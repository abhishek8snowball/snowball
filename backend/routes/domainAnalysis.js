const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const domainAnalysisController = require('../controllers/domainAnalysis');

// All routes require authentication
router.use(auth);

// Get domain analysis data (SoV results, brand strength, etc.)
router.get('/data', domainAnalysisController.getDomainAnalysisData);

// Get SoV results for a brand
router.get('/sov', domainAnalysisController.getShareOfVoice);

// Get brand strength score
router.get('/strength', domainAnalysisController.getBrandStrength);

// Get AI responses with mention analysis
router.get('/responses', domainAnalysisController.getAIResponses);

// Check SoV calculation status
router.get('/sov-status', domainAnalysisController.getSoVStatus);

module.exports = router;
