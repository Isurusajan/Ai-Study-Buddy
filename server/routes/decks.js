const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createDeck,
  getDecks,
  getDeck,
  deleteDeck,
  generateDeckSummary,
  generateQuiz,
  downloadSummary,
  generateShortAnswerQuestions,
  generateLongAnswerQuestions,
  askQuestion
} = require('../controllers/deckController');

/**
 * Deck Routes
 * All routes require authentication
 */

// Create deck with file upload (uses multer middleware)
router.post('/', protect, upload.single('file'), createDeck);

// Get all decks for current user
router.get('/', protect, getDecks);

// Get single deck
router.get('/:id', protect, getDeck);

// Delete deck
router.delete('/:id', protect, deleteDeck);

// Generate summary for deck (with level: brief, medium, detailed)
router.post('/:id/summary', protect, generateDeckSummary);

// Download summary as file
router.get('/:id/summary/download', protect, downloadSummary);

// Generate MCQ quiz (with count and difficulty: easy, medium, hard)
router.post('/:id/quiz', protect, generateQuiz);

// Generate short answer questions (with count and difficulty)
router.post('/:id/short-answer', protect, generateShortAnswerQuestions);

// Generate long answer/essay questions (with count and difficulty)
router.post('/:id/long-answer', protect, generateLongAnswerQuestions);

// Ask a question about the deck content
router.post('/:id/ask', protect, askQuestion);

// Proxy endpoint to serve PDF (bypasses Cloudinary 401 restrictions)
// Accepts token as query parameter for browser link access
router.get('/:id/pdf-proxy', async (req, res) => {
  try {
    const { id } = req.params;
    const axios = require('axios');
    const Deck = require('../models/Deck');
    const jwt = require('jsonwebtoken');
    const User = require('../models/User');

    // Get token from Authorization header or query parameter
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized - no token provided' });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized - user not found' });
      }
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized - invalid token' });
    }

    // Get deck from database
    const deck = await Deck.findById(id);
    
    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }

    const cloudinaryUrl = deck.sourceFile?.url;
    if (!cloudinaryUrl) {
      return res.status(404).json({ error: 'PDF not found' });
    }

    // Download from Cloudinary
    const pdfResponse = await axios.get(cloudinaryUrl, {
      responseType: 'stream',
      timeout: 30000
    }).catch(err => {
      console.error('Cloudinary fetch error:', err.response?.status, err.message);
      // If Cloudinary returns 401, it means the file is restricted
      if (err.response?.status === 401) {
        throw new Error('PDF is restricted on Cloudinary. Please try downloading directly.');
      }
      throw err;
    });

    // Set proper headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="document.pdf"');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    // Stream to client
    pdfResponse.data.pipe(res);
  } catch (error) {
    console.error('PDF proxy error:', error.message);
    
    // If error is about restricted file, suggest download
    if (error.message.includes('restricted')) {
      return res.status(403).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to load PDF' });
  }
});

module.exports = router;
