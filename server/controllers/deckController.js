const Deck = require('../models/Deck');
const Flashcard = require('../models/Flashcard');
const cloudinary = require('../config/cloudinary');
const { extractText } = require('../services/pdfService');
const { generateFlashcards, generateSummary } = require('../services/geminiService');

/**
 * @desc    Create a new deck with file upload
 * @route   POST /api/decks
 * @access  Private
 */
exports.createDeck = async (req, res) => {
  try {
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

    // Step 1: Upload file to Cloudinary
    console.log('📤 Uploading file to Cloudinary...');
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'study-buddy',
          resource_type: 'auto'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(file.buffer);
    });

    console.log('✅ File uploaded to Cloudinary');

    // Step 2: Extract text from file
    console.log('📄 Extracting text from file...');
    const extractedText = await extractText(file.buffer, file.mimetype);
    console.log(`✅ Extracted ${extractedText.length} characters`);

    // Step 3: Generate summary using AI
    console.log('🤖 Generating summary...');
    const summary = await generateSummary(extractedText);
    console.log('✅ Summary generated');

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
        id: deck._id,
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
    console.error('Create deck error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create deck',
      error: error.message
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

    // Get flashcard count
    const flashcardCount = await Flashcard.countDocuments({ deckId: deck._id });

    res.status(200).json({
      success: true,
      deck: {
        ...deck.toObject(),
        flashcardCount
      }
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

    // Delete all flashcards associated with this deck
    await Flashcard.deleteMany({ deckId: deck._id });

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

module.exports = exports;
