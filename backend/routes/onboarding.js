const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const onboardingController = require('../controllers/onboarding');

// All onboarding routes require authentication
router.use(auth);

// Step 1: Analyze domain and auto-fill business information
router.post('/analyze-domain', onboardingController.analyzeDomain);

// Step 2: Fetch competitors using AI
router.post('/fetch-competitors', onboardingController.fetchCompetitors);

// Step 3: Generate business categories
router.post('/generate-categories', onboardingController.generateCategories);

// Step 4: Generate prompts based on categories
router.post('/generate-prompts', onboardingController.generatePrompts);

// Step 5: Complete onboarding and save all data
router.post('/complete', onboardingController.completeOnboarding);

// Get onboarding status for a user
router.get('/status', onboardingController.getOnboardingStatus);

module.exports = router;
