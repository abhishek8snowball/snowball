const express = require('express');
const router = express.Router();
const { authenticationMiddleware: auth, requireSuperuser } = require('../middleware/auth');
const domainAnalysisController = require('../controllers/domainAnalysis');

// All routes require authentication
router.use(auth);

// Get domain analysis data (SoV results, brand strength, etc.) - All users can view their own data
router.get('/data', domainAnalysisController.getDomainAnalysisData);

// Get SoV results for a brand - All users can view their own data
router.get('/sov', domainAnalysisController.getShareOfVoice);

// Get brand strength score - All users can view their own data
router.get('/strength', domainAnalysisController.getBrandStrength);

// Get AI responses with mention analysis - All users can view their own data
router.get('/responses', domainAnalysisController.getAIResponses);

// Check SoV calculation status - All users can check their own status
router.get('/sov-status', domainAnalysisController.getSoVStatus);

// Routes that CREATE new domain analyses (superuser only)
// TODO: Add routes here for creating new domain analyses that require superuser

module.exports = router;
