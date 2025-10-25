#!/usr/bin/env node

/**
 * Simple script to restart the backend server
 * Run this on the EC2 instance to reload all changes
 * 
 * Usage: node restart-backend.js
 * Or: npm run restart
 */

const { spawn } = require('child_process');

console.log('🔄 Restarting backend server...');

const pm2 = spawn('npx', ['pm2', 'restart', 'all'], {
  stdio: 'inherit',
  shell: true
});

pm2.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Backend server restarted successfully!');
  } else {
    console.log(`❌ Restart failed with code ${code}`);
  }
  process.exit(code);
});
