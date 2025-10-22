const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// ===== MIDDLEWARE =====

// Enable CORS (allows frontend to make requests from different domain)
app.use(cors());

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

app.listen(PORT, () => {
  console.log('=================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log('=================================');
});
