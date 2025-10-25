const multer = require('multer');
const path = require('path');

/**
 * Multer Configuration for File Uploads
 *
 * This middleware handles file uploads from the frontend
 * Files are temporarily stored in memory before uploading to Cloudinary
 */

// Store files in memory as Buffer
const storage = multer.memoryStorage();

// File filter - only allow PDF and DOCX files
const fileFilter = (req, file, cb) => {
  console.log('🔍 Multer file filter - File:', file.originalname, 'MIME:', file.mimetype);
  
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    console.log('✅ File type accepted');
    cb(null, true); // Accept file
  } else {
    console.log('❌ File type rejected');
    cb(new Error('Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB max file size
  },
  fileFilter: fileFilter
});

module.exports = upload;
