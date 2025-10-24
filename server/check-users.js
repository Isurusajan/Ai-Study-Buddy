const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find({}, 'name email _id createdAt').sort({ createdAt: -1 });
    
    console.log('📋 All Users in Database:');
    console.log('================================');
    users.forEach((user, index) => {
      console.log(`${index + 1}. Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   ID: ${user._id.toString()}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    });

    console.log('================================');
    console.log(`Total Users: ${users.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
