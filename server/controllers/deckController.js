const Deck = require('../models/Deck');
const cloudinary = require('../config/cloudinary');
const handleCloudinaryError = require('../config/cloudinaryErrorHandler');
const { extractText } = require('../services/pdfService');
const { generateSummary, generateMCQ, generateShortAnswer, generateLongAnswer } = require('../services/geminiService');

/**
 * @desc    Create a new deck with file upload
 * @route   POST /api/decks
 * @access  Private
 */
exports.createDeck = async (req, res) => {
  try {
    console.log('\n========================================');
    console.log('🔍 createDeck called');
    console.log('📋 Body:', req.body);
    console.log('📎 File:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'No file');
    console.log('👤 User ID:', req.user?.id);
    console.log('========================================\n');
    
    const { title, subject, description } = req.body;
    const file = req.file;

    // Validation
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a title'
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    // Step 1: Upload file to Cloudinary with PUBLIC delivery settings
    console.log('📤 Uploading file to Cloudinary...');
    console.log('File details:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer ? 'Buffer present' : 'Buffer missing'
    });
    
    if (!file.buffer) {
      throw new Error('File buffer is missing');
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'study-buddy',
          resource_type: 'auto',
          type: 'upload',
          access_type: 'token',  // Allow signed URLs but also public access
          flags: 'immutable',     // Cache aggressively
          delivery_type: 'upload' // Direct delivery, not restricted
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            console.error('Cloudinary error details:', JSON.stringify(error, null, 2));
            reject(error);
          }
          else {
            console.log('✅ Cloudinary upload success:', result.public_id);
            resolve(result);
          }
        }
      );
      
      try {
        uploadStream.end(file.buffer);
      } catch (streamError) {
        console.error('❌ Stream error:', streamError);
        reject(streamError);
      }
    });

    console.log('✅ File uploaded to Cloudinary');
    console.log('📎 File URL:', uploadResult.secure_url);

    // Step 2: Extract text from file
    console.log('📄 Extracting text from file...');
    const extractedText = await extractText(file.buffer, file.mimetype);
    console.log(`✅ Extracted ${extractedText.length} characters`);

    // Step 3: Generate summary using AI (optional - skip if fails)
    let summary = null;
    try {
      console.log('🤖 Generating summary...');
      summary = await generateSummary(extractedText);
      console.log('✅ Summary generated');
    } catch (summaryError) {
      console.log('⚠️ Summary generation failed, continuing without it:', summaryError.message);
      summary = 'Summary generation unavailable';
    }

    // Step 4: Create deck in database
    const deck = await Deck.create({
      userId: req.user.id,
      title,
      subject: subject || 'General',
      description,
      sourceFile: {
        filename: file.originalname,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id
      },
      extractedText,
      summary
    });

    res.status(201).json({
      success: true,
      message: 'Deck created successfully',
      deck: {
        _id: deck._id,
        title: deck.title,
        subject: deck.subject,
        description: deck.description,
        summary: deck.summary,
        sourceFile: {
          filename: deck.sourceFile.filename,
          url: deck.sourceFile.url
        },
        createdAt: deck.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Deck creation error:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Handle specific error types
    if (error.name === 'Error' && error.message.includes('buffer')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file format or empty file'
      });
    }
    
    // Handle Cloudinary specific errors
    if (error.http_code) {
      const errorMessage = handleCloudinaryError(error);
      return res.status(error.http_code).json({
        success: false,
        message: errorMessage
      });
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      message: 'Failed to create deck',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * @desc    Get all decks for current user
 * @route   GET /api/decks
 * @access  Private
 */
exports.getDecks = async (req, res) => {
  try {
    const decks = await Deck.find({ userId: req.user.id })
      .select('-extractedText') // Don't return extracted text (too large)
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json({
      success: true,
      count: decks.length,
      decks
    });

  } catch (error) {
    console.error('Get decks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get decks',
      error: error.message
    });
  }
};

/**
 * @desc    Get single deck by ID
 * @route   GET /api/decks/:id
 * @access  Private
 */
exports.getDeck = async (req, res) => {
  try {
    const deck = await Deck.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).select('-extractedText');

    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck not found'
      });
    }

    res.status(200).json({
      success: true,
      deck: deck.toObject()
    });

  } catch (error) {
    console.error('Get deck error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get deck',
      error: error.message
    });
  }
};

/**
 * @desc    Delete deck
 * @route   DELETE /api/decks/:id
 * @access  Private
 */
exports.deleteDeck = async (req, res) => {
  try {
    const deck = await Deck.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck not found'
      });
    }

    // Delete file from Cloudinary
    if (deck.sourceFile.publicId) {
      await cloudinary.uploader.destroy(deck.sourceFile.publicId);
    }

    // Delete deck
    await deck.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Deck deleted successfully'
    });

  } catch (error) {
    console.error('Delete deck error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete deck',
      error: error.message
    });
  }
};

/**
 * @desc    Generate summary for a deck with customizable detail level
 * @route   POST /api/decks/:id/summary
 * @access  Private
 */
exports.generateDeckSummary = async (req, res) => {
  try {
    const { level = 'medium' } = req.body; // brief, medium, detailed

    const deck = await Deck.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).select('+extractedText');

    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck not found'
      });
    }

    if (!deck.extractedText) {
      return res.status(400).json({
        success: false,
        message: 'No extracted text available for this deck'
      });
    }

    console.log(`📝 Generating ${level} summary for deck: ${deck.title}`);

    const summary = await generateSummary(deck.extractedText, level);

    // Update deck's summary (save the medium version by default)
    if (level === 'medium') {
      deck.summary = summary;
      await deck.save();
    }

    res.status(200).json({
      success: true,
      summary,
      level,
      deckTitle: deck.title
    });

  } catch (error) {
    console.error('Generate summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate summary',
      error: error.message
    });
  }
};

/**
 * @desc    Generate MCQ quiz for a deck
 * @route   POST /api/decks/:id/quiz
 * @access  Private
 */
exports.generateQuiz = async (req, res) => {
  try {
    const { count = 10, difficulty = 'medium' } = req.body;

    const deck = await Deck.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).select('+extractedText');

    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck not found'
      });
    }

    if (!deck.extractedText) {
      return res.status(400).json({
        success: false,
        message: 'No extracted text available for this deck'
      });
    }

    console.log(`📝 Generating ${count} ${difficulty} MCQ questions for deck: ${deck.title}`);

    const questions = await generateMCQ(deck.extractedText, parseInt(count), difficulty);

    res.status(200).json({
      success: true,
      questions,
      count: questions.length,
      difficulty,
      deckTitle: deck.title
    });

  } catch (error) {
    console.error('Generate quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate quiz',
      error: error.message
    });
  }
};

/**
 * @desc    Download summary as a text file
 * @route   GET /api/decks/:id/summary/download
 * @access  Private
 */
exports.downloadSummary = async (req, res) => {
  try {
    const { level = 'medium' } = req.query;

    const deck = await Deck.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).select('+extractedText');

    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck not found'
      });
    }

    if (!deck.extractedText) {
      return res.status(400).json({
        success: false,
        message: 'No extracted text available for this deck'
      });
    }

    console.log(`📥 Generating ${level} summary for download: ${deck.title}`);

    const summary = await generateSummary(deck.extractedText, level);

    // Create filename
    const filename = `${deck.title.replace(/[^a-z0-9]/gi, '_')}_summary_${level}.txt`;

    // Set headers for file download
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Send summary as file
    res.send(summary);

  } catch (error) {
    console.error('Download summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download summary',
      error: error.message
    });
  }
};

/**
 * @desc    Generate short answer questions for a deck
 * @route   POST /api/decks/:id/short-answer
 * @access  Private
 */
exports.generateShortAnswerQuestions = async (req, res) => {
  try {
    const { count = 10, difficulty = 'medium' } = req.body;

    const deck = await Deck.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).select('+extractedText');

    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck not found'
      });
    }

    if (!deck.extractedText) {
      return res.status(400).json({
        success: false,
        message: 'No extracted text available for this deck'
      });
    }

    console.log(`📝 Generating ${count} ${difficulty} short answer questions for deck: ${deck.title}`);

    const questions = await generateShortAnswer(deck.extractedText, parseInt(count), difficulty);

    res.status(200).json({
      success: true,
      questions,
      count: questions.length,
      difficulty,
      deckTitle: deck.title
    });

  } catch (error) {
    console.error('Generate short answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate short answer questions',
      error: error.message
    });
  }
};

/**
 * @desc    Generate long answer/essay questions for a deck
 * @route   POST /api/decks/:id/long-answer
 * @access  Private
 */
exports.generateLongAnswerQuestions = async (req, res) => {
  try {
    const { count = 5, difficulty = 'medium' } = req.body;

    const deck = await Deck.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).select('+extractedText');

    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck not found'
      });
    }

    if (!deck.extractedText) {
      return res.status(400).json({
        success: false,
        message: 'No extracted text available for this deck'
      });
    }

    console.log(`📝 Generating ${count} ${difficulty} long answer questions for deck: ${deck.title}`);

    const questions = await generateLongAnswer(deck.extractedText, parseInt(count), difficulty);

    res.status(200).json({
      success: true,
      questions,
      count: questions.length,
      difficulty,
      deckTitle: deck.title
    });

  } catch (error) {
    console.error('Generate long answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate long answer questions',
      error: error.message
    });
  }
};

/**
 * @desc    Ask a question about the deck content
 * @route   POST /api/decks/:id/ask
 * @access  Private
 */
exports.askQuestion = async (req, res) => {
  try {
    const { question, level = 'medium' } = req.body;

    if (!question || question.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a question'
      });
    }

    const deck = await Deck.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).select('+extractedText');

    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck not found'
      });
    }

    if (!deck.extractedText) {
      return res.status(400).json({
        success: false,
        message: 'No extracted text available for this deck'
      });
    }

    console.log(`💬 Answering question for deck: ${deck.title}`);
    console.log(`   Question: ${question}`);

    const { answerQuestion } = require('../services/geminiService');
    const answer = await answerQuestion(deck.extractedText, question, level);

    res.status(200).json({
      success: true,
      question,
      answer,
      level,
      deckTitle: deck.title
    });

  } catch (error) {
    console.error('Ask question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to answer question',
      error: error.message
    });
  }
};

module.exports = exports;
