const express = require('express');
const router = express.Router();
const { authenticationMiddleware: auth } = require('../middleware/auth');
const cmsCredentialsController = require('../controllers/cmsCredentials');

// Apply auth middleware to all routes
router.use(auth);

// Save or update CMS credentials
router.post('/', cmsCredentialsController.saveCredentials);

// Get user's CMS credentials
router.get('/', cmsCredentialsController.getCredentials);

// Test CMS connection
router.post('/test', cmsCredentialsController.testConnection);

// Delete CMS credentials
router.delete('/:id', cmsCredentialsController.deleteCredentials);

// Deactivate CMS credentials
router.patch('/:id/deactivate', cmsCredentialsController.deactivateCredentials);

module.exports = router;
