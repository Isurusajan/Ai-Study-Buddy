const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Google Gemini AI Service
 * Handles all AI-related operations (flashcard generation, summaries, Q&A)
 */

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Generate flashcards from text
 * @param {String} text - Extracted text from document
 * @param {Number} count - Number of flashcards to generate
 * @returns {Array} - Array of flashcard objects
 */
exports.generateFlashcards = async (text, count = 10) => {
  try {
    // Limit text to avoid token limits (use first 10000 characters)
    const limitedText = text.substring(0, 10000);

    const prompt = `You are an expert educator creating flashcards from study materials.

Given the following text, generate exactly ${count} flashcards that:
1. Cover the most important concepts
2. Have clear, specific questions
3. Provide complete, accurate answers
4. Vary in difficulty (include easy, medium, and hard questions)

Text:
${limitedText}

Return ONLY a valid JSON array in this exact format (no markdown, no extra text):
[
  {
    "question": "question text here",
    "answer": "answer text here",
    "difficulty": "easy"
  },
  {
    "question": "question text here",
    "answer": "answer text here",
    "difficulty": "medium"
  }
]

Important: Return ONLY the JSON array, nothing else.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Clean up the response (remove markdown code blocks if present)
    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\n?/g, '');
    }

    // Parse JSON
    const flashcards = JSON.parse(cleanResponse);

    console.log(`✅ Generated ${flashcards.length} flashcards`);
    return flashcards;

  } catch (error) {
    console.error('Gemini flashcard generation error:', error);
    throw new Error('Failed to generate flashcards: ' + error.message);
  }
};

/**
 * Generate summary from text
 * @param {String} text - Extracted text from document
 * @returns {String} - Summary text
 */
exports.generateSummary = async (text) => {
  try {
    const limitedText = text.substring(0, 10000);

    const prompt = `Summarize the following text in 3-5 concise bullet points that capture the key concepts:

${limitedText}

Return only the bullet points, no other text.`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    console.log('✅ Generated summary');
    return summary;

  } catch (error) {
    console.error('Gemini summary generation error:', error);
    throw new Error('Failed to generate summary');
  }
};

/**
 * Answer a question based on context
 * @param {String} context - Study material context
 * @param {String} question - User's question
 * @param {String} level - Complexity level (simple, medium, detailed)
 * @returns {String} - Answer
 */
exports.answerQuestion = async (context, question, level = 'medium') => {
  try {
    const limitedContext = context.substring(0, 8000);

    const complexityMap = {
      simple: 'Explain like I\'m 10 years old, using simple language and examples.',
      medium: 'Explain like I\'m a college student, with moderate detail.',
      detailed: 'Explain like I\'m an expert, with comprehensive technical detail.'
    };

    const prompt = `You are a helpful study tutor. Answer the following question about the study material.

Complexity Level: ${complexityMap[level]}

Study Material Context:
${limitedContext}

Question: ${question}

Provide a clear, accurate answer based on the study material.`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    console.log('✅ Answered question');
    return answer;

  } catch (error) {
    console.error('Gemini Q&A error:', error);
    throw new Error('Failed to answer question');
  }
};

module.exports = exports;
