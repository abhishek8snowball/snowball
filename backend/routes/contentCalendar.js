const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const contentCalendarController = require('../controllers/contentCalendar');
const autoPublisher = require('../utils/autoPublisher');

// Apply auth middleware to all routes
router.use(auth);

// Generate 30-day content calendar
router.post('/generate', contentCalendarController.generateCalendar);

// Approve and schedule content calendar
router.post('/approve', contentCalendarController.approveCalendar);

// Get user's content calendar
router.get('/', contentCalendarController.getCalendar);

// Update specific calendar entry
router.put('/:id', contentCalendarController.updateEntry);

// Delete specific calendar entry
router.delete('/:id', contentCalendarController.deleteEntry);

// Manual trigger for auto-publishing (for testing)
router.post('/publish/trigger', async (req, res) => {
  try {
    await autoPublisher.triggerPublishing();
    res.json({ success: true, message: 'Auto-publishing triggered successfully' });
  } catch (error) {
    console.error('Error triggering auto-publishing:', error);
    res.status(500).json({ error: 'Failed to trigger auto-publishing' });
  }
});

// Get publishing statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await autoPublisher.getPublishingStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error getting publishing stats:', error);
    res.status(500).json({ error: 'Failed to get publishing stats' });
  }
});

// Retry failed publishing
router.post('/publish/retry', async (req, res) => {
  try {
    await autoPublisher.retryFailedPublishing();
    res.json({ success: true, message: 'Retry of failed publishing initiated' });
  } catch (error) {
    console.error('Error retrying failed publishing:', error);
    res.status(500).json({ error: 'Failed to retry failed publishing' });
  }
});

module.exports = router;
