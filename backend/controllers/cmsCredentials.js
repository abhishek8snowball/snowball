const CMSCredentials = require('../models/CMSCredentials');
const cmsIntegration = require('../utils/cmsIntegration');

class CMSCredentialsController {
  async saveCredentials(req, res) {
    try {
      const { platform, authDetails } = req.body;
      const userId = req.user.id;

      if (!platform || !authDetails) {
        return res.status(400).json({ error: 'Platform and auth details are required' });
      }

      // Test the connection before saving
      console.log(`Testing ${platform} connection with:`, { platform, authDetails });
      
      const testResult = await cmsIntegration.testConnection(platform, { authDetails });
      
      if (!testResult.success) {
        console.error(`${platform} connection test failed:`, testResult.error);
        return res.status(400).json({ 
          error: `Failed to connect to ${platform}`,
          details: testResult.error 
        });
      }

      // Save or update credentials
      const credentials = await CMSCredentials.findOneAndUpdate(
        { userId, platform },
        { authDetails, isActive: true },
        { upsert: true, new: true, runValidators: true }
      );

      res.json({
        success: true,
        data: credentials,
        message: `${platform} credentials saved and connection verified successfully`
      });

    } catch (error) {
      console.error('Error saving CMS credentials:', error);
      res.status(500).json({ 
        error: 'Failed to save CMS credentials',
        details: error.message 
      });
    }
  }

  async getCredentials(req, res) {
    try {
      const userId = req.user.id;
      const { platform } = req.query;

      const query = { userId };
      if (platform) {
        query.platform = platform;
      }

      const credentials = await CMSCredentials.find(query);

      res.json({
        success: true,
        data: credentials
      });

    } catch (error) {
      console.error('Error fetching CMS credentials:', error);
      res.status(500).json({ 
        error: 'Failed to fetch CMS credentials',
        details: error.message 
      });
    }
  }

  async testConnection(req, res) {
    try {
      const { platform, authDetails } = req.body;

      if (!platform || !authDetails) {
        return res.status(400).json({ error: 'Platform and auth details are required' });
      }

      const testResult = await cmsIntegration.testConnection(platform, { authDetails });

      res.json({
        success: true,
        data: testResult
      });

    } catch (error) {
      console.error('Error testing CMS connection:', error);
      res.status(500).json({ 
        error: 'Failed to test CMS connection',
        details: error.message 
      });
    }
  }

  async deleteCredentials(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const credentials = await CMSCredentials.findOneAndDelete({ _id: id, userId });

      if (!credentials) {
        return res.status(404).json({ error: 'CMS credentials not found' });
      }

      res.json({
        success: true,
        message: 'CMS credentials deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting CMS credentials:', error);
      res.status(500).json({ 
        error: 'Failed to delete CMS credentials',
        details: error.message 
      });
    }
  }

  async deactivateCredentials(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const credentials = await CMSCredentials.findOneAndUpdate(
        { _id: id, userId },
        { isActive: false },
        { new: true }
      );

      if (!credentials) {
        return res.status(404).json({ error: 'CMS credentials not found' });
      }

      res.json({
        success: true,
        data: credentials,
        message: 'CMS credentials deactivated successfully'
      });

    } catch (error) {
      console.error('Error deactivating CMS credentials:', error);
      res.status(500).json({ 
        error: 'Failed to deactivate CMS credentials',
        details: error.message 
      });
    }
  }
}

module.exports = new CMSCredentialsController();
