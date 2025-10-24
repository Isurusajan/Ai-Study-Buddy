/**
 * Test Battle Create Endpoint
 * Run this to test if battle creation works
 */

const axios = require('axios');
const fs = require('fs');

// Load environment
require('dotenv').config();

const API_URL = 'http://localhost:5000';

// Use a test token from your browser (replace with your actual token)
const TOKEN = process.env.TEST_TOKEN || 'your_jwt_token_here';

async function testBattleCreate() {
  try {
    console.log('Testing Battle Create Endpoint...\n');
    
    // You need to provide a valid deckId from your database
    const deckId = process.argv[2] || 'test-deck-id';
    
    console.log(`📋 Deck ID: ${deckId}`);
    console.log(`🔑 Token: ${TOKEN.substring(0, 20)}...`);
    console.log(`🌐 API URL: ${API_URL}\n`);
    
    const response = await axios.post(
      `${API_URL}/api/battles/create`,
      {
        deckId,
        battleType: 'private',
        maxPlayers: 4,
        difficulty: 'medium'
      },
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Battle Created Successfully!\n');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error Creating Battle\n');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
    console.error('Full Error:', JSON.stringify(error.response?.data, null, 2));
  }
}

// Usage: node test-battle-create.js <deckId>
testBattleCreate();
