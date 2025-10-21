require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testWithSDK() {
  try {
    console.log('🧪 Testing with Official Google Generative AI SDK...\n');

    const apiKey = process.env.GEMINI_API_KEY;
    console.log('API Key:', apiKey ? `${apiKey.substring(0, 15)}...` : 'Missing ❌');

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found');
    }

    // Initialize SDK
    const genAI = new GoogleGenerativeAI(apiKey);

    // Try the current recommended model name
    const modelName = "gemini-1.5-flash";
    console.log(`\n🔄 Trying model: ${modelName}\n`);

    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = "Say hello in JSON format: {\"message\": \"your greeting\"}";

    console.log('📝 Sending test prompt...\n');

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ SUCCESS! API is working!\n');
    console.log('Response:');
    console.log('─────────────────────────────────────');
    console.log(text);
    console.log('─────────────────────────────────────\n');

    console.log('🎉 Your API key is valid and working!');
    console.log('✅ You can now use flashcard generation in your app!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);

    if (error.message.includes('API_KEY_INVALID')) {
      console.log('\n💡 Your API key appears to be invalid.');
      console.log('Please create a new one at: https://aistudio.google.com/app/apikey\n');
    } else if (error.message.includes('PERMISSION_DENIED')) {
      console.log('\n💡 Permission denied. Please check:');
      console.log('1. API is enabled: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
      console.log('2. Wait 1-2 minutes after enabling');
      console.log('3. Try creating a new API key in a NEW project\n');
    } else {
      console.log('\n💡 Full error details:');
      console.log(error);
    }

    process.exit(1);
  }
}

testWithSDK();
