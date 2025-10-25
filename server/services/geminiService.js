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
 * Calculate dynamic pages based on content size
 * @param {Number} textLength - Length of the extracted text
 * @param {String} type - Summary type
 * @returns {Object} - Pages and words estimate
 */
function calculateDynamicPages(textLength, type) {
  // Estimate: ~250 words per page in a PDF
  const contentPages = Math.ceil(textLength / 2500); // Rough estimate of pages in original
  
  const pageRanges = {
    concise: { min: Math.max(1, contentPages * 0.3), max: Math.max(2, contentPages * 0.4) },
    bullets: { min: Math.max(1, contentPages * 0.35), max: Math.max(2, contentPages * 0.45) },
    structured: { min: Math.max(2, contentPages * 0.4), max: Math.max(4, contentPages * 0.6) },
    narrative: { min: Math.max(3, contentPages * 0.5), max: Math.max(5, contentPages * 0.8) },
    comprehensive: { min: Math.max(5, contentPages * 0.7), max: Math.max(10, contentPages * 1.0) }
  };

  const range = pageRanges[type] || pageRanges.structured;
  const avgWords = ((range.min + range.max) / 2) * 300; // ~300 words per page
  
  return {
    minPages: Math.round(range.min),
    maxPages: Math.round(range.max),
    estimatedWords: Math.round(avgWords)
  };
}

/**
 * Generate summary from text with adaptive detail levels and summary types
 * @param {String} text - Extracted text from document
 * @param {String} level - Detail level: 'concise', 'bullets', 'structured', 'narrative', 'comprehensive'
 * @returns {String} - Summary text
 */
exports.generateSummary = async (text, level = 'structured') => {
  try {
    // Use full text (Gemini can handle larger contexts in 2.5-flash)
    const limitedText = text.substring(0, 30000);
    const pageInfo = calculateDynamicPages(limitedText.length, level);

    const levelPrompts = {
      concise: `Create a concise, quick-reference summary of the following text that fits on ${pageInfo.minPages}-${pageInfo.maxPages} pages (approximately ${pageInfo.estimatedWords} words).

Focus on:
- Topic overview (1-2 sentences)
- Top 5-7 key takeaways (bullet points)
- Brief conclusion (1 sentence)

Text:
${limitedText}

Format with clear sections and bullet points. Be direct and skip non-essential details.`,

      bullets: `Create a bullet-point summary of the following text that spans ${pageInfo.minPages}-${pageInfo.maxPages} pages (approximately ${pageInfo.estimatedWords} words).

Structure as:
- **Overview**: 2-3 sentence summary of what this covers
- **Key Points**: 10-15 main bullet points organized by topic
- **Important Notes**: 3-5 critical takeaways to remember

Text:
${limitedText}

Format entirely in bullet points with clear topic headers. Make it scannable.`,

      structured: `Create a well-structured summary of the following text that spans ${pageInfo.minPages}-${pageInfo.maxPages} pages (approximately ${pageInfo.estimatedWords} words).

Include:
- **Introduction**: Overview and context (1 paragraph)
- **Main Sections**: Break content into 4-6 logical topics with explanations
- **Key Concepts**: Important ideas and their definitions
- **Practical Applications**: How these concepts apply in practice
- **Summary**: Recap of main points (1 paragraph)

Text:
${limitedText}

Use markdown formatting with clear headings (##, ###), paragraphs, and bullet points.`,

      narrative: `Create a comprehensive narrative summary of the following text that spans ${pageInfo.minPages}-${pageInfo.maxPages} pages (approximately ${pageInfo.estimatedWords} words).

Structure as:
- **Executive Overview**: High-level summary (1-2 paragraphs)
- **Background & Context**: Setting the stage (1-2 paragraphs)
- **Main Content**: Detailed explanation of concepts, ideas, and their interconnections (multiple sections)
- **Real-world Implications**: How this applies to real situations
- **Key Takeaways**: Memorable summary points
- **Conclusion**: Final thoughts and broader significance (1-2 paragraphs)

Text:
${limitedText}

Write in flowing paragraphs that tell the story of the content. Use markdown for readability.`,

      comprehensive: `Create a comprehensive, detailed summary of the following text that spans ${pageInfo.minPages}-${pageInfo.maxPages} pages (approximately ${pageInfo.estimatedWords} words).

Include:
- **Executive Summary**: High-level overview (1 paragraph)
- **Introduction**: Full context, background, and significance (2-3 paragraphs)
- **Detailed Content**:
  - Organize into major themes/sections with detailed explanations
  - Include examples, case studies, and practical applications
  - Explain relationships and connections between concepts
  - Add supporting details and nuances
- **Analysis & Interpretation**: Critical analysis of key points
- **Key Takeaways**: Numbered list of important concepts
- **Conclusion**: Summary and broader implications (2-3 paragraphs)
- **Study Notes**: Additional context and resources to explore

Text:
${limitedText}

Format with comprehensive markdown including headings (##, ###, ####), paragraphs, bullet points, numbered lists, and emphasis where appropriate.`
    };

    const prompt = levelPrompts[level] || levelPrompts.structured;
    const model = getModel();
    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    console.log(`✅ Generated ${level} summary (${pageInfo.minPages}-${pageInfo.maxPages} pages, ~${pageInfo.estimatedWords} words)`);
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
