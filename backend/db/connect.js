const mongoose = require("mongoose");

const connectDB = (url) => {
  if (!url) {
    throw new Error('MongoDB connection string is required. Please check your .env file.');
  }
  
  console.log('Connecting to MongoDB...');
  return mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

module.exports = connectDB;