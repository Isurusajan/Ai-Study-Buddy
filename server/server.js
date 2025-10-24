const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');
const socketIO = require('socket.io');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Create HTTPS server with self-signed certificates
const certPath = path.join(__dirname, 'certs', 'cert.pem');
const keyPath = path.join(__dirname, 'certs', 'key.pem');

let server;
if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  const options = {
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath)
  };
  server = https.createServer(options, app);
  console.log('🔒 Using HTTPS server with self-signed certificates');
} else {
  const http = require('http');
  server = http.createServer(app);
  console.log('⚠️ HTTPS certificates not found, using HTTP');
}

// Initialize Socket.io with CORS configuration
const io = socketIO(server, {
  cors: {
    origin: 'https://main.d1dg86wxbzr6zt.amplifyapp.com',
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  perMessageDeflate: false
});

// Connect to MongoDB
connectDB();

// ===== MIDDLEWARE =====

// Enable CORS (allows frontend to make requests from different domain)
app.use(cors({
  origin: function(origin, callback) {
    // Allow specific origins
    const allowedOrigins = [
      'https://main.d1dg86wxbzr6zt.amplifyapp.com',
      'http://localhost:3000',
      'http://localhost:5000',
      'https://localhost:5000'
    ];
    
    // Allow requests with no origin (like mobile apps)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Request logger (shows incoming requests in console)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ===== ROUTES =====

// Authentication routes
app.use('/api/auth', require('./routes/auth'));

// Deck routes
app.use('/api/decks', require('./routes/decks'));

// Battle routes
app.use('/api/battles', require('./routes/battles'));

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AI Study Buddy API is running!',
    version: '1.0.0'
  });
});

// 404 handler - catch all unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// ===== START SERVER =====

const PORT = process.env.PORT || 5000;

// Socket.io Event Handlers
require('./websockets/battleSocket')(io);

server.listen(PORT, () => {
  const protocol = fs.existsSync(certPath) && fs.existsSync(keyPath) ? 'https' : 'http';
  console.log('=================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 API URL: ${protocol}://localhost:${PORT}`);
  console.log(`🔌 WebSocket: ${protocol === 'https' ? 'wss' : 'ws'}://localhost:${PORT}`);
  console.log('=================================');
});

module.exports = { app, server, io };
