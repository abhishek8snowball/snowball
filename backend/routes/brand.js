const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const brandController = require("../controllers/brand");

// Brand analysis endpoints
router.post("/analyze", auth, brandController.analyzeBrand);
router.get("/analysis/:brandId", auth, brandController.getBrandAnalysis);
// Removed unused mock endpoint routes

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

// Create minimal brand profile for blog analysis (without full analysis)
router.post("/create-minimal-brand", auth, brandController.createMinimalBrand);

module.exports = router;