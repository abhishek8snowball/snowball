require("dotenv").config();
require('express-async-errors');

const connectDB = require("./db/connect");
const express = require("express");
const cors = require('cors');
const app = express();
const mainRouter = require("./routes/user");
const brandRouter = require("./routes/brand");

app.use(express.json());

// CORS configuration for development
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use("/api/v1", mainRouter);
app.use("/api/v1/brand", brandRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({ 
    msg: "Server error", 
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const port = process.env.PORT || 3000;

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

