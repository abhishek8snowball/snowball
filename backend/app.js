require("dotenv").config();
require('express-async-errors');

// Debug environment variables
console.log('Environment variables loaded:');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'NOT SET');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'NOT SET');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'NOT SET');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Set' : 'NOT SET');
console.log('PERPLEXITY_API_KEY:', process.env.PERPLEXITY_API_KEY ? 'Set' : 'NOT SET');
console.log('SHOPIFY_API_KEY:', process.env.SHOPIFY_API_KEY ? 'Set' : 'NOT SET');
console.log('SHOPIFY_API_SECRET:', process.env.SHOPIFY_API_SECRET ? 'Set' : 'NOT SET');
console.log('APP_URL:', process.env.APP_URL || 'http://localhost:5000 (default)');
console.log('PORT:', process.env.PORT || '5000 (default)');

const connectDB = require("./db/connect");
const express = require("express");
const cors = require('cors');
const app = express();
const mainRouter = require("./routes/user");
const brandRouter = require("./routes/brand");
const contentCalendarRouter = require("./routes/contentCalendar");
const cmsCredentialsRouter = require("./routes/cmsCredentials");
const shopifyRouter = require("./routes/shopify");
const authRouter = require("./routes/auth");
const onboardingRouter = require("./routes/onboarding");

// Initialize Passport.js
const passport = require('passport');

// Initialize auto-publisher
require('./utils/autoPublisher');

app.use(express.json());

// Initialize Passport middleware
app.use(passport.initialize());

// CORS configuration for development and production
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:3000', 
  'http://127.0.0.1:5173',
  'https://snowball-frontend.onrender.com',
  'https://snowball-land.onrender.com',
  'https://geo-optimizer-land.onrender.com',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Snowball API is running',
    timestamp: new Date().toISOString()
  });
});

app.use("/api/v1", mainRouter);
app.use("/api/v1/brand", brandRouter);
app.use("/api/v1/content-calendar", contentCalendarRouter);
app.use("/api/v1/cms-credentials", cmsCredentialsRouter);
app.use("/api/v1/shopify", shopifyRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/onboarding", onboardingRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({ 
    msg: "Server error", 
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const port = process.env.PORT || 5000;

const start = async () => {
    try {        
        await connectDB(process.env.MONGO_URI);
        app.listen(port, () => {
            console.log(`Server is listening on port ${port}`);
        });
    } catch (error) {
       console.log(error); 
    }
}

start();

