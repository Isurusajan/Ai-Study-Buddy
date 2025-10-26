const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Create HTTP server (Nginx handles HTTPS termination)
const server = http.createServer(app);
console.log('🌐 Using HTTP server (HTTPS handled by Nginx reverse proxy)');

// Initialize Socket.io with CORS configuration
const io = socketIO(server, {
  cors: {
    origin: ['https://main.d1dg86wxbzr6zt.amplifyapp.com', 'https://aistudybuddy.duckdns.org'],
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

// Add explicit CORS headers middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://main.d1dg86wxbzr6zt.amplifyapp.com',
    'https://aistudybuddy.duckdns.org',
    'http://localhost:3000',
    'http://localhost:5000',
    'https://localhost:5000'
  ];

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Max-Age', '86400');
  }

  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Enable CORS (allows frontend to make requests from different domain)
app.use(cors({
  origin: function(origin, callback) {
    // Allow specific origins
    const allowedOrigins = [
      'https://main.d1dg86wxbzr6zt.amplifyapp.com',
      'https://aistudybuddy.duckdns.org',
      'http://localhost:3000',
      'http://localhost:5000',
      'https://localhost:5000'
    ];
    
    // Allow requests with no origin (like mobile apps or direct API calls)
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
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', cors());

// Parse JSON request bodies
app.use(express.json({ limit: '50mb' }));

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

// Admin restart endpoint - pulls latest code and restarts (for deployment emergencies)
app.post('/admin/restart', async (req, res) => {
  try {
    const adminSecret = req.headers['x-admin-secret'];
    const expectedSecret = process.env.ADMIN_SECRET || 'emergency-restart-key-2024';
    
    // Basic auth check
    if (adminSecret !== expectedSecret) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized - invalid admin secret' 
      });
    }
    
    console.log('🚀 Admin restart endpoint triggered...');
    const { exec } = require('child_process');
    
    // Determine the correct path based on environment
    const repoPath = process.env.REPO_PATH || '/home/ubuntu/Ai-Study-Buddy';
    const gitCommand = `cd ${repoPath}/server && git pull origin main && npx pm2 restart all`;
    
    exec(gitCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Restart error:', error.message);
        return res.status(500).json({ 
          success: false, 
          message: 'Restart failed', 
          error: error.message 
        });
      }
      console.log('✅ Backend restarted successfully');
      console.log(stdout);
      res.json({ 
        success: true, 
        message: 'Backend restarted and latest code loaded',
        output: stdout
      });
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Restart error',
      error: error.message 
    });
  }
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
  console.log('=================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
  console.log(`📡 Public: https://aistudybuddy.duckdns.org (via Nginx)`);
  console.log('=================================');
});

module.exports = { app, server, io };
