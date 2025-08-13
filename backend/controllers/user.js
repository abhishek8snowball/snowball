const jwt = require("jsonwebtoken");
const User = require("../models/User");
const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const { Configuration, OpenAIApi } = require("openai");
const OpenAI = require("openai");
const authMiddleware = require('../middleware/auth');

// Removed old Analysis model definition - now using the new Analysis model from models/Analysis.js


const login = async (req, res) => {
  console.log('🔐 Login attempt:', { body: req.body, headers: req.headers });
  
  const { email, password } = req.body;

  if (!email || !password) {
    console.log('❌ Missing email or password:', { email: !!email, password: !!password });
    return res.status(400).json({
      msg: "Bad request. Please add email and password in the request body",
    });
  }

  console.log('🔍 Looking for user with email:', email);
  let foundUser = await User.findOne({ email: req.body.email });
  
  if (foundUser) {
    console.log('✅ User found:', foundUser.name);
    const isMatch = await foundUser.comparePassword(password);
    console.log('🔑 Password match:', isMatch);

    if (isMatch) {
      const token = jwt.sign(
        { id: foundUser._id, name: foundUser.name },
        process.env.JWT_SECRET,
        {
          expiresIn: "30d",
        }
      );
      console.log('🎉 Login successful, token generated');
      return res.status(200).json({ msg: "user logged in", token });
    } else {
      console.log('❌ Password mismatch');
      return res.status(400).json({ msg: "Bad password" });
    }
  } else {
    console.log('❌ User not found with email:', email);
    return res.status(400).json({ msg: "Bad credentials" });
  }
};

const dashboard = async (req, res) => {
  const luckyNumber = Math.floor(Math.random() * 100);

  res.status(200).json({
    msg: `Hello, ${req.user.name}`,

  });
};

const getAllUsers = async (req, res) => {
  let users = await User.find({});

  return res.status(200).json({ users });
};

const register = async (req, res) => {
  let foundUser = await User.findOne({ email: req.body.email });
  if (foundUser === null) {
    let { name, email, password } = req.body; // <-- use 'name'
    if (name && email && password) { // <-- check for truthy, not .length
      const person = new User({
        name,
        email,
        password,
      });
      await person.save();
      return res.status(201).json({ person });
    } else {
      return res.status(400).json({ msg: "Please add all values in the request body" });
    }
  } else {
    return res.status(400).json({ msg: "Email already in use" });
  }
};

const analyzeLink = async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ msg: "URL is required" });

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const $ = cheerio.load(response.data);
    

    const extractedTags = {
      title: $('title').text() || '',
      description: $('meta[name="description"]').attr('content') || '',
      robots: $('meta[name="robots"]').attr('content') || '',
      canonical: $('link[rel="canonical"]').attr('href') || '',
      h1: $('h1').first().text() || '',
      h2: [],
      openGraph: {},
      twitter: {}
    };

    $('h2').each((i, el) => {
      extractedTags.h2.push($(el).text());
    });

    $('meta[property^="og:"]').each((i, el) => {
      const property = $(el).attr('property');
      const content = $(el).attr('content');
      if (property && content) {
        extractedTags.openGraph[property] = content;
      }
    });

    $('meta[name^="twitter:"]').each((i, el) => {
      const name = $(el).attr('name');
      const content = $(el).attr('content');
      if (name && content) {
        extractedTags.twitter[name] = content;
      }
    });

    return res.json({ result: extractedTags });
  } catch (err) {
    console.error('Scraping failed:', err.message);
    return res.status(500).json({ msg: "Failed to analyze link", error: err.message });
  }
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const suggestImprovements = async (req, res) => {
  const { tags, url } = req.body;
  if (!tags || !url) return res.status(400).json({ msg: "Tags and URL are required" });

  try {
    const prompt = `
      Here are the SEO tags for a web page:
      ${JSON.stringify(tags, null, 2)}
      Suggest improvements for these tags to enhance SEO. Be specific and concise.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    });

    const suggestion = completion.choices[0].message.content;

    // Save analysis with user reference
    const analysis = new Analysis({ user: req.user.id, url, tags, suggestion });
    await analysis.save();

    res.json({ suggestion });
  } catch (err) {
    console.error("OpenAI error:", err.message);
    res.status(500).json({ msg: "Failed to get suggestions", error: err.message });
  }
};

const getAnalysisHistory = async (req, res) => {
  try {
    const history = await Analysis.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ history });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch history", error: err.message });
  }
};


const deleteAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    await Analysis.findByIdAndDelete(id);
    res.json({ msg: "Analysis deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Failed to delete analysis", error: err.message });
  }
};

module.exports = {
  login,
  register,
  dashboard,
  getAllUsers,
  analyzeLink,
  suggestImprovements,
  getAnalysisHistory, // <-- Make sure to export it
  deleteAnalysis,
};
