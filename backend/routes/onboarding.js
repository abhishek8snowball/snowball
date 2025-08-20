const express = require('express');
const router = express.Router();
const { authenticationMiddleware: auth } = require('../middleware/auth');
const onboardingController = require('../controllers/onboarding');

// All routes require authentication
router.use(auth);

// Get user's onboarding progress
router.get('/progress', onboardingController.getProgress);

// Save onboarding progress
router.post('/save-progress', onboardingController.saveProgress);

// Step 1: Domain analysis and AI autocomplete
router.post('/step1-domain', onboardingController.step1DomainAnalysis);

// Step 2: Categories extraction
router.post('/step2-categories', onboardingController.step2Categories);

// Step 3: Competitors extraction
router.post('/step3-competitors', onboardingController.step3Competitors);

// Step 4: Prompts generation
router.post('/step4-prompts', onboardingController.step4Prompts);

// Complete onboarding
router.post('/complete', onboardingController.completeOnboarding);

// Get onboarding status
router.get('/status', onboardingController.getStatus);

module.exports = router;
