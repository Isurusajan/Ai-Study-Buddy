require('dotenv').config();
const https = require('https');

async function testDirectEndpoint() {
  const apiKey = process.env.GEMINI_API_KEY;

  console.log('🧪 Testing Direct API Endpoint...\n');
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 15)}...` : 'Missing ❌');
  console.log('');

  // Try the exact endpoint format from Google's documentation
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  const data = JSON.stringify({
    contents: [{
      parts: [{
        text: 'Hello! Please respond with: {"status": "working"}'
      }]
    }]
  });

  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    console.log('📡 Making request to:');
    console.log(url.replace(apiKey, 'API_KEY'));
    console.log('');

    const req = https.request(url, options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        console.log(`Status Message: ${res.statusMessage}\n`);

        if (res.statusCode === 200) {
          console.log('✅ SUCCESS!\n');
          const response = JSON.parse(body);
          console.log('Full Response:');
          console.log(JSON.stringify(response, null, 2));

          if (response.candidates && response.candidates[0]) {
            const text = response.candidates[0].content.parts[0].text;
            console.log('\n📝 Generated Text:');
            console.log('─────────────────────────────────────');
            console.log(text);
            console.log('─────────────────────────────────────');
            console.log('\n🎉 Your API key is WORKING!');
            console.log('✅ You can now generate flashcards!\n');
          }
          resolve();
        } else {
          console.log('❌ Request failed\n');
          console.log('Response Body:');
          console.log(body);
          console.log('');

          try {
            const error = JSON.parse(body);
            console.log('Error Details:');
            console.log(JSON.stringify(error, null, 2));

            if (error.error) {
              console.log('\n💡 Error Message:', error.error.message);
              console.log('💡 Error Status:', error.error.status);

              if (error.error.message.includes('API key not valid')) {
                console.log('\n⚠️  Your API key is not valid or has restrictions.');
                console.log('Try creating a new one: https://aistudio.google.com/app/apikey');
              }
            }
          } catch (e) {
            // Not JSON
          }

          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request Error:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

testDirectEndpoint().catch(err => {
  console.error('\n❌ Test failed:', err.message);
  process.exit(1);
});
