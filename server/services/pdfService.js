const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * PDF Service
 * Extracts text from PDF and DOCX files
 */

/**
 * Extract text from PDF file
 * @param {Buffer} buffer - PDF file buffer
 * @returns {String} - Extracted text
 */
exports.extractTextFromPDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

/**
 * Extract text from DOCX file
 * @param {Buffer} buffer - DOCX file buffer
 * @returns {String} - Extracted text
 */
exports.extractTextFromDOCX = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error('Failed to extract text from DOCX');
  }
};

/**
 * Extract text from any supported file type
 * @param {Buffer} buffer - File buffer
 * @param {String} mimetype - File MIME type
 * @returns {String} - Extracted text
 */
exports.extractText = async (buffer, mimetype) => {
  if (mimetype === 'application/pdf') {
    return await this.extractTextFromPDF(buffer);
  } else if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword'
  ) {
    return await this.extractTextFromDOCX(buffer);
  } else if (mimetype === 'text/plain') {
    return buffer.toString('utf-8');
  } else {
    throw new Error('Unsupported file type');
  }
};
