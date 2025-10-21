require('dotenv').config();
const axios = require('axios');

async function testGeminiREST() {
  try {
    console.log('🧪 Testing Gemini API with REST...');
    console.log('API Key:', process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.substring(0, 10)}...` : 'Missing ❌');

    const apiKey = process.env.GEMINI_API_KEY;

    // Try different API versions and model names
    const testCombinations = [
      { version: 'v1', model: 'gemini-1.5-flash' },
      { version: 'v1', model: 'gemini-1.5-pro' },
      { version: 'v1', model: 'gemini-pro' },
      { version: 'v1beta', model: 'gemini-1.5-flash' },
      { version: 'v1beta', model: 'gemini-pro' }
    ];

    for (const { version, model: modelName } of testCombinations) {
      console.log(`\n🔄 Trying ${version}/models/${modelName}`);

      const url = `https://generativelanguage.googleapis.com/${version}/models/${modelName}:generateContent?key=${apiKey}`;

      const prompt = 'Say "Hello, I am working!" in JSON format: {"message": "your response"}';

      try {
        const response = await axios.post(
          url,
          {
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          },
          {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );

        console.log(`✅ SUCCESS with ${modelName}!`);
        console.log('Response:', JSON.stringify(response.data, null, 2));

        // Extract the text
        const text = response.data.candidates[0].content.parts[0].text;
        console.log('\n📝 Generated text:', text);

        return modelName; // Return the working model name

      } catch (error) {
        if (error.response) {
          console.log(`❌ Failed with ${modelName}:`, error.response.status, error.response.data?.error?.message || error.message);
        } else {
          console.log(`❌ Failed with ${modelName}:`, error.message);
        }
      }
    }

    console.log('\n❌ All models failed. Your API key might be invalid or restricted.');
    console.log('\n💡 Please check:');
    console.log('1. Go to https://aistudio.google.com/app/apikey');
    console.log('2. Create a new API key');
    console.log('3. Update your .env file with the new key');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

testGeminiREST();
