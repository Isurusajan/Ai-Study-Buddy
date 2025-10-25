const handleCloudinaryError = (error) => {
  console.error('Cloudinary Error:', {
    message: error.message,
    name: error.name,
    http_code: error.http_code,
    details: JSON.stringify(error, null, 2)
  });

  // Return a user-friendly error message
  if (error.http_code === 413) {
    return 'File size is too large. Please upload a smaller file.';
  } else if (error.http_code === 415) {
    return 'File type not supported. Please upload a PDF, DOCX, DOC, or TXT file.';
  } else if (error.http_code === 401) {
    return 'Authentication failed. Please try again.';
  } else {
    return 'An error occurred while uploading the file. Please try again.';
  }
};

module.exports = handleCloudinaryError;