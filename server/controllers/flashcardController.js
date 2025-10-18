const Flashcard = require('../models/Flashcard');
const Deck = require('../models/Deck');
const { generateFlashcards } = require('../services/geminiService');

/**
 * @desc    Generate flashcards for a deck
 * @route   POST /api/decks/:deckId/flashcards/generate
 * @access  Private
 */
exports.generateFlashcardsForDeck = async (req, res) => {
  try {
    const { deckId } = req.params;
    const { count = 10 } = req.body;

    // Find deck and include extractedText
    const deck = await Deck.findOne({
      _id: deckId,
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

    console.log(`🤖 Generating ${count} flashcards for deck: ${deck.title}`);

    // Generate flashcards using AI
    const generatedCards = await generateFlashcards(deck.extractedText, parseInt(count));

    // Save flashcards to database
    const flashcards = await Flashcard.insertMany(
      generatedCards.map(card => ({
        deckId: deck._id,
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty || 'medium'
      }))
    );

    // Update deck's total cards count
    await Deck.findByIdAndUpdate(deck._id, {
      totalCards: flashcards.length
    });

    console.log(`✅ Created ${flashcards.length} flashcards`);

    res.status(201).json({
      success: true,
      message: `Generated ${flashcards.length} flashcards`,
      flashcards
    });

  } catch (error) {
    console.error('Generate flashcards error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate flashcards',
      error: error.message
    });
  }
};

/**
 * @desc    Get all flashcards for a deck
 * @route   GET /api/decks/:deckId/flashcards
 * @access  Private
 */
exports.getFlashcards = async (req, res) => {
  try {
    const { deckId } = req.params;

    // Verify deck belongs to user
    const deck = await Deck.findOne({
      _id: deckId,
      userId: req.user.id
    });

    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck not found'
      });
    }

    const flashcards = await Flashcard.find({ deckId })
      .sort({ createdAt: 1 }); // Oldest first

    res.status(200).json({
      success: true,
      count: flashcards.length,
      flashcards
    });

  } catch (error) {
    console.error('Get flashcards error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get flashcards',
      error: error.message
    });
  }
};

/**
 * @desc    Get due flashcards for review (spaced repetition)
 * @route   GET /api/decks/:deckId/flashcards/due
 * @access  Private
 */
exports.getDueFlashcards = async (req, res) => {
  try {
    const { deckId } = req.params;

    // Verify deck belongs to user
    const deck = await Deck.findOne({
      _id: deckId,
      userId: req.user.id
    });

    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck not found'
      });
    }

    // Find flashcards due for review (nextReviewDate <= now)
    const now = new Date();
    const dueFlashcards = await Flashcard.find({
      deckId,
      nextReviewDate: { $lte: now }
    }).sort({ nextReviewDate: 1 });

    res.status(200).json({
      success: true,
      count: dueFlashcards.length,
      flashcards: dueFlashcards
    });

  } catch (error) {
    console.error('Get due flashcards error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get due flashcards',
      error: error.message
    });
  }
};

/**
 * @desc    Submit flashcard review (update spaced repetition data)
 * @route   PUT /api/flashcards/:id/review
 * @access  Private
 */
exports.reviewFlashcard = async (req, res) => {
  try {
    const { id } = req.params;
    const { quality } = req.body; // 0-5 scale (SM-2 algorithm)

    if (quality === undefined || quality < 0 || quality > 5) {
      return res.status(400).json({
        success: false,
        message: 'Quality must be a number between 0 and 5'
      });
    }

    const flashcard = await Flashcard.findById(id);

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found'
      });
    }

    // SM-2 Spaced Repetition Algorithm
    let { easeFactor, interval, repetitions } = flashcard;

    if (quality >= 3) {
      // Correct answer
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions++;
      flashcard.timesCorrect++;
    } else {
      // Incorrect answer - reset
      repetitions = 0;
      interval = 1;
      flashcard.timesIncorrect++;
    }

    // Update ease factor
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    easeFactor = Math.max(1.3, easeFactor); // Minimum ease factor of 1.3

    // Calculate next review date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);
    nextReviewDate.setHours(0, 0, 0, 0); // Start of day

    // Update flashcard
    flashcard.easeFactor = easeFactor;
    flashcard.interval = interval;
    flashcard.repetitions = repetitions;
    flashcard.nextReviewDate = nextReviewDate;
    flashcard.lastReviewed = new Date();
    flashcard.timesReviewed++;

    await flashcard.save();

    res.status(200).json({
      success: true,
      message: 'Review recorded',
      flashcard
    });

  } catch (error) {
    console.error('Review flashcard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record review',
      error: error.message
    });
  }
};

/**
 * @desc    Delete flashcard
 * @route   DELETE /api/flashcards/:id
 * @access  Private
 */
exports.deleteFlashcard = async (req, res) => {
  try {
    const flashcard = await Flashcard.findById(req.params.id);

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found'
      });
    }

    await flashcard.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Flashcard deleted'
    });

  } catch (error) {
    console.error('Delete flashcard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete flashcard',
      error: error.message
    });
  }
};

module.exports = exports;
