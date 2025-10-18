const cloudinary = require('cloudinary').v2;

/**
 * Configure Cloudinary
 * This connects to your Cloudinary account for file uploads
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

console.log('✅ Cloudinary configured');

module.exports = cloudinary;
