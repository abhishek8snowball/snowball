const mongoose = require('mongoose');

// Try to connect using the same method as your app
async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Check if we're already connected
    if (mongoose.connection.readyState === 1) {
      console.log('✅ Already connected to MongoDB');
      console.log('📊 Connection state:', mongoose.connection.readyState);
      console.log('🌐 Database name:', mongoose.connection.name);
      console.log('🔗 Host:', mongoose.connection.host);
      console.log('🚪 Port:', mongoose.connection.port);
    } else {
      console.log('❌ Not connected to MongoDB');
      console.log('📊 Connection state:', mongoose.connection.readyState);
    }
    
    // Try to connect if not already connected
    if (mongoose.connection.readyState !== 1) {
      console.log('🔄 Attempting to connect...');
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/snowball');
      console.log('✅ Connected to MongoDB');
    }
    
    // Test a simple query
    console.log('🧪 Testing database query...');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📚 Collections found:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
  } finally {
    // Don't close the connection if it's shared with the main app
    if (mongoose.connection.readyState === 1) {
      console.log('🔗 Keeping connection open (shared with main app)');
    } else {
      await mongoose.connection.close();
    }
  }
}

testConnection();
