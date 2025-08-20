const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');

// Load .env from the backend root directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function makeSuperuser(email) {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ Database URI not found in environment variables');
      console.error('Make sure you have a .env file in the backend directory with MONGO_URI or MONGODB_URI');
      return;
    }
    
    console.log('🔗 Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to database');

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User with email ${email} not found`);
      return;
    }

    user.role = 'superuser';
    await user.save();
    
    console.log(`✅ User ${user.name} (${email}) has been made a superuser`);
  } catch (error) {
    console.error('❌ Error making user superuser:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.log('Usage: node make-superuser.js <email>');
  console.log('Example: node make-superuser.js user@example.com');
  process.exit(1);
}

makeSuperuser(email);