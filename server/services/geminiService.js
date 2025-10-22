const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Google Gemini AI Service
 * Handles all AI-related operations (summaries, Q&A, quizzes)
 */

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to get model - use gemini-2.5-flash (latest and fastest)
function getModel() {
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

/**
 * Generate summary from text with page-based detail levels
 * @param {String} text - Extracted text from document
 * @param {String} level - Detail level: 'brief', 'medium', 'detailed'
 * @returns {String} - Summary text
 */
exports.generateSummary = async (text, level = 'medium') => {
  try {
    const limitedText = text.substring(0, 20000);

    const levelPrompts = {
      brief: `Create a concise summary of the following text that fits on 1-2 pages (approximately 300-500 words).

Include:
- Main topic overview (2-3 sentences)
- Key points (5-7 bullet points)
- Brief conclusion (1-2 sentences)

Text:
${limitedText}

Format the summary in clear paragraphs and bullet points.`,

      medium: `Create a comprehensive summary of the following text that spans 3-5 pages (approximately 800-1200 words).

Include:
- Introduction: Overview of the topic and its importance (1 paragraph)
- Main Concepts: Detailed explanation of key concepts (organized by subtopics with bullet points)
- Important Details: Supporting information, examples, and connections between ideas
- Summary: Recap of main takeaways (1 paragraph)

Text:
${limitedText}

Format the response with clear headings, paragraphs, and bullet points using markdown.`,

      detailed: `Create an extensive, detailed summary of the following text that spans 6-10 pages (approximately 1500-2500 words).

Include:
- **Executive Summary**: High-level overview (1 paragraph)
- **Introduction**: Context, background, and significance (2-3 paragraphs)
- **Main Content**:
  - Break down into major sections/topics
  - Provide detailed explanations for each concept
  - Include examples, applications, and implications
  - Discuss relationships between different ideas
- **Key Takeaways**: Important points to remember (bullet points)
- **Conclusion**: Summary and broader implications (2 paragraphs)
- **Additional Notes**: Any supplementary information or considerations

Text:
${limitedText}

Format the response with comprehensive markdown formatting including headings (##, ###), paragraphs, bullet points, and numbered lists where appropriate.`
    };

    const prompt = levelPrompts[level] || levelPrompts.medium;
    const model = getModel();
    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    console.log(`✅ Generated ${level} summary`);
    return summary;

  } catch (error) {
    console.error('Gemini summary generation error:', error);
    throw new Error('Failed to generate summary');
  }
};

/**
 * Answer a question based on context
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

    const model = getModel();
    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    console.log('✅ Answered question');
    return answer;

  } catch (error) {
    console.error('Gemini Q&A error:', error);
    throw new Error('Failed to answer question');
  }
};

/**
 * Generate MCQ quiz from text
 */
exports.generateMCQ = async (text, count = 10, difficulty = 'medium') => {
  try {
    const limitedText = text.substring(0, 15000);

    const difficultyDescriptions = {
      easy: 'straightforward questions that test basic recall and understanding',
      medium: 'moderately challenging questions that test comprehension and application',
      hard: 'difficult questions that test deep understanding, analysis, and critical thinking'
    };

    const prompt = `You are an expert educator creating a multiple-choice quiz from study materials.

Generate exactly ${count} ${difficulty} multiple-choice questions based on the following text. Create ${difficultyDescriptions[difficulty]}.

Text:
${limitedText}

Return ONLY a valid JSON array in this exact format (no markdown, no extra text):
[
  {
    "question": "question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "brief explanation of why this is the correct answer",
    "difficulty": "${difficulty}"
  }
]

Important rules:
- Each question must have exactly 4 options
- correctAnswer is the index (0-3) of the correct option
- Make sure options are plausible distractors
- Questions should cover different topics from the text
- Return ONLY the JSON array, nothing else`;

    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\n?/g, '');
    }

    const questions = JSON.parse(cleanResponse);
    console.log(`✅ Generated ${questions.length} ${difficulty} MCQ questions`);
    return questions;

  } catch (error) {
    console.error('Gemini MCQ generation error:', error);
    throw new Error('Failed to generate MCQ quiz: ' + error.message);
  }
};

/**
 * Generate short answer questions from text
 */
exports.generateShortAnswer = async (text, count = 10, difficulty = 'medium') => {
  try {
    const limitedText = text.substring(0, 15000);

    const difficultyDescriptions = {
      easy: 'straightforward questions that test basic recall (answers should be 1-2 sentences)',
      medium: 'moderately challenging questions that test comprehension (answers should be 2-4 sentences)',
      hard: 'difficult questions that test analysis and critical thinking (answers should be 3-5 sentences)'
    };

    const prompt = `You are an expert educator creating short answer questions from study materials.

Generate exactly ${count} ${difficulty} short answer questions based on the following text. Create ${difficultyDescriptions[difficulty]}.

Text:
${limitedText}

Return ONLY a valid JSON array in this exact format (no markdown, no extra text):
[
  {
    "question": "question text here",
    "answer": "expected answer here (brief but complete)",
    "keyPoints": ["key point 1", "key point 2", "key point 3"],
    "difficulty": "${difficulty}"
  }
]

Important rules:
- Questions should require written responses, not just yes/no
- Answers should be concise but complete
- keyPoints are the main points that should appear in a good answer
- Questions should cover different topics from the text
- Return ONLY the JSON array, nothing else`;

    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\n?/g, '');
    }

    const questions = JSON.parse(cleanResponse);
    console.log(`✅ Generated ${questions.length} ${difficulty} short answer questions`);
    return questions;

  } catch (error) {
    console.error('Gemini short answer generation error:', error);
    throw new Error('Failed to generate short answer questions: ' + error.message);
  }
};

/**
 * Generate long answer/essay questions from text
 */
exports.generateLongAnswer = async (text, count = 5, difficulty = 'medium') => {
  try {
    const limitedText = text.substring(0, 15000);

    const difficultyDescriptions = {
      easy: 'straightforward questions that test understanding (answers should be 1 paragraph)',
      medium: 'moderately challenging questions that test comprehension and application (answers should be 2-3 paragraphs)',
      hard: 'complex questions that test deep analysis, synthesis, and critical thinking (answers should be 3-4 paragraphs)'
    };

    const prompt = `You are an expert educator creating long answer/essay questions from study materials.

Generate exactly ${count} ${difficulty} long answer questions based on the following text. Create ${difficultyDescriptions[difficulty]}.

Text:
${limitedText}

Return ONLY a valid JSON array in this exact format (no markdown, no extra text):
[
  {
    "question": "question text here",
    "sampleAnswer": "a complete sample answer that demonstrates the expected depth and structure",
    "keyPoints": ["key point 1", "key point 2", "key point 3", "key point 4", "key point 5"],
    "gradingCriteria": ["criterion 1", "criterion 2", "criterion 3"],
    "difficulty": "${difficulty}"
  }
]

Important rules:
- Questions should require detailed, well-developed responses
- Sample answers should be comprehensive and demonstrate proper structure
- keyPoints are the essential concepts that must be covered
- gradingCriteria are the main aspects to evaluate in a student's answer
- Questions should encourage analysis, not just description
- Return ONLY the JSON array, nothing else`;

    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\n?/g, '');
    }

    const questions = JSON.parse(cleanResponse);
    console.log(`✅ Generated ${questions.length} ${difficulty} long answer questions`);
    return questions;

  } catch (error) {
    console.error('Gemini long answer generation error:', error);
    throw new Error('Failed to generate long answer questions: ' + error.message);
  }
};

module.exports = exports;
