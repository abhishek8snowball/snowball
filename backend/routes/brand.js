const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const brandController = require("../controllers/brand");

// Brand analysis endpoints
router.post("/analyze", auth, brandController.analyzeBrand);
router.post("/queries", auth, brandController.generatePrompts);
router.post("/competitors", auth, brandController.getCompetitors);
router.post("/share-of-voice", auth, brandController.getShareOfVoice);
router.get("/rank", auth, brandController.getBrandRank);

// User data endpoints with proper ownership validation
router.get("/user/brands", auth, brandController.getUserBrands);
router.get("/user/categories", auth, brandController.getUserCategories);

// Category prompts endpoint
router.get("/categories/:categoryId/prompts", auth, brandController.getCategoryPrompts);

// Prompt response endpoint
router.get("/prompts/:promptId/response", auth, brandController.getPromptResponse);

// Debug endpoint
router.get("/debug/ai-responses", auth, brandController.debugAIResponses);

// Blog analysis endpoints
router.get("/:brandId/blogs", auth, brandController.getBlogAnalysis);
router.post("/:brandId/blogs/score", auth, brandController.scoreSingleBlog);
router.get("/:brandId/blogs/scores", auth, brandController.getBlogScores);

// Blog extraction endpoint (separate from main analysis)
router.post("/extract-blogs", auth, brandController.extractBlogs);

// Blog analysis trigger for domain analysis
router.post("/:brandId/trigger-blog-analysis", auth, brandController.triggerBlogAnalysis);

module.exports = router;