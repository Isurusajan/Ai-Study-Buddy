const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Test file upload function
async function testFileUpload() {
  try {
    console.log('🧪 Starting file upload test...\n');

    // Path to test file
    const testFilePath = path.join(__dirname, '..', 'test_study_material.txt');
    
    // Check if file exists
    if (!fs.existsSync(testFilePath)) {
      console.error('❌ Test file not found:', testFilePath);
      return;
    }

    console.log('📎 Test file:', testFilePath);
    console.log('📏 File size:', fs.statSync(testFilePath).size, 'bytes\n');

    // Create FormData
    const form = new FormData();
    form.append('file', fs.createReadStream(testFilePath));
    form.append('title', 'Test Study Material');
    form.append('subject', 'Biology');
    form.append('description', 'This is a test upload');

    // Get token (you need to be logged in first)
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    }).catch(async (err) => {
      console.log('⚠️  Login failed, trying to register first...');
      return await axios.post('http://localhost:5000/api/auth/register', {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
    });

    const token = loginResponse.data.token;
    console.log('🔐 Got authentication token:', token.substring(0, 20) + '...\n');

    // Upload file
    console.log('📤 Uploading file...');
    const uploadResponse = await axios.post(
      'http://localhost:5000/api/decks',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('\n✅ Upload successful!');
    console.log('Response:', JSON.stringify(uploadResponse.data, null, 2));

  } catch (error) {
    console.error('\n❌ Upload failed!');
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testFileUpload();
