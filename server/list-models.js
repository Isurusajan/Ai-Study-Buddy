require('dotenv').config();
const https = require('https');

async function listAvailableModels() {
  const apiKey = process.env.GEMINI_API_KEY;

  console.log('🔍 Listing Available Gemini Models...\n');
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 15)}...` : 'Missing ❌');
  console.log('');

  // List models endpoint
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  return new Promise((resolve, reject) => {
    console.log('📡 Fetching model list...\n');

    https.get(url, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        console.log(`Status: ${res.statusCode} ${res.statusMessage}\n`);

        if (res.statusCode === 200) {
          const data = JSON.parse(body);

          if (data.models && data.models.length > 0) {
            console.log(`✅ Found ${data.models.length} available models:\n`);
            console.log('─────────────────────────────────────────────────────────────');

            data.models.forEach((model, index) => {
              console.log(`\n${index + 1}. Model: ${model.name}`);
              console.log(`   Display Name: ${model.displayName || 'N/A'}`);
              console.log(`   Description: ${model.description || 'N/A'}`);
              console.log(`   Supported Methods: ${model.supportedGenerationMethods ? model.supportedGenerationMethods.join(', ') : 'N/A'}`);

              if (model.supportedGenerationMethods && model.supportedGenerationMethods.includes('generateContent')) {
                console.log('   ✅ SUPPORTS generateContent - CAN BE USED!');
              }
            });

            console.log('\n─────────────────────────────────────────────────────────────\n');

            // Show which model to use
            const usableModel = data.models.find(m =>
              m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')
            );

            if (usableModel) {
              console.log('💡 RECOMMENDED MODEL TO USE:');
              console.log(`   ${usableModel.name}\n`);
              console.log('🔧 Update your code to use this model name!\n');
            } else {
              console.log('⚠️  No models support generateContent method');
              console.log('This API key might not have access to Gemini models\n');
            }

          } else {
            console.log('❌ No models found for this API key\n');
            console.log('💡 This means:');
            console.log('- The API might not be fully enabled yet (wait 2-5 minutes)');
            console.log('- The API key might be restricted');
            console.log('- You may need to enable billing\n');
          }

          resolve();
        } else {
          console.log('❌ Failed to list models\n');
          console.log('Response:');
          console.log(body);

          try {
            const error = JSON.parse(body);
            if (error.error) {
              console.log('\n💡 Error:', error.error.message);
            }
          } catch (e) {
            // Not JSON
          }

          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', (error) => {
      console.error('❌ Request Error:', error.message);
      reject(error);
    });
  });
}

listAvailableModels().catch(err => {
  console.error('\n❌ Failed:', err.message);
  console.log('\n💡 Troubleshooting:');
  console.log('1. Wait 2-5 minutes after enabling the API');
  console.log('2. Check: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
  console.log('3. Try creating a NEW API key in a NEW project: https://aistudio.google.com/app/apikey\n');
  process.exit(1);
});
