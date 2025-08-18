import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ShopifyIntegration = () => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [shopInfo, setShopInfo] = useState(null);
  const [publishResult, setPublishResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = 'http://localhost:5000/api/v1/shopify';

  // Check connection status on component mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/status`);
      setConnectionStatus(response.data.status);
      if (response.data.status === 'connected') {
        setShopInfo(response.data);
      }
    } catch (error) {
      console.error('Error checking status:', error);
      setConnectionStatus('error');
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      // Redirect to Shopify OAuth without requiring shop domain
      window.location.href = `${API_BASE}/connect-shopify`;
    } catch (error) {
      setError('Failed to initiate connection');
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (connectionStatus !== 'connected') {
      setError('Must be connected to Shopify first');
      return;
    }

    setLoading(true);
    setError(null);
    setPublishResult(null);

    try {
      const response = await axios.post(`${API_BASE}/publish`);
      setPublishResult(response.data);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to publish article');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStatus = () => {
    checkConnectionStatus();
  };

  const handleDisconnect = () => {
    setConnectionStatus('disconnected');
    setShopInfo(null);
    setPublishResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🛍️ Shopify Integration Test
          </h1>
          <p className="text-gray-600 mb-6">
            Test the Shopify OAuth integration and content publishing
          </p>

          {/* Connection Status */}
          <div className="mb-6 p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Connection Status
                </h3>
                <p className="text-sm text-gray-600">
                  Current Shopify store connection status
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  connectionStatus === 'connected' 
                    ? 'bg-green-100 text-green-800' 
                    : connectionStatus === 'disconnected'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {connectionStatus === 'connected' ? '🟢 Connected' : 
                   connectionStatus === 'disconnected' ? '⚪ Disconnected' : '🔴 Error'}
                </span>
                <button
                  onClick={handleRefreshStatus}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>

            {shopInfo && (
              <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
                <p className="text-sm text-green-800">
                  <strong>Connected to:</strong> {shopInfo.shop}
                </p>
                <p className="text-sm text-green-800">
                  <strong>Scopes:</strong> {shopInfo.scopes}
                </p>
              </div>
            )}
          </div>

          {/* Connect to Shopify */}
          <div className="mb-6 p-4 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              🔗 Connect to Shopify Store
            </h3>
            
            <div className="text-center mb-3">
              <button
                onClick={handleConnect}
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
              >
                {loading ? '🔄 Connecting...' : '🚀 Connect to Shopify'}
              </button>
            </div>
            
                         <p className="text-sm text-gray-600 text-center">
               Click to start the Shopify OAuth process. You'll be redirected to Shopify where you can select your store and authorize the app.
             </p>
          </div>

          {/* Publish Test Article */}
          <div className="mb-6 p-4 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              📝 Publish Test Article
            </h3>
            
            <div className="flex space-x-3 mb-3">
              <button
                onClick={handlePublish}
                disabled={loading || connectionStatus !== 'connected'}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Publishing...' : 'Publish Test Article'}
              </button>
              
              {connectionStatus === 'connected' && (
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Disconnect
                </button>
              )}
            </div>
            
            <p className="text-sm text-gray-600">
              Publishes a test article "Hello from Node.js" to your Shopify blog
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                ❌ Error
              </h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Publish Result */}
          {publishResult && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                ✅ Article Published Successfully!
              </h3>
              <div className="space-y-2">
                <p className="text-green-700">
                  <strong>Title:</strong> {publishResult.article.title}
                </p>
                <p className="text-green-700">
                  <strong>Article ID:</strong> {publishResult.article.id}
                </p>
                <p className="text-green-700">
                  <strong>URL:</strong> 
                  <a 
                    href={publishResult.article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline ml-1"
                  >
                    View Article
                  </a>
                </p>
                <p className="text-green-700">
                  <strong>Published:</strong> {new Date(publishResult.article.published_at).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              📋 How to Test
            </h3>
                         <ol className="list-decimal list-inside space-y-1 text-blue-700 text-sm">
               <li>Click "🚀 Connect to Shopify" button</li>
               <li>You'll be redirected to Shopify's app installation page</li>
               <li>Select your store and grant permissions</li>
               <li>Return here and click "Refresh" to check connection status</li>
               <li>Click "Publish Test Article" to test content publishing</li>
               <li>View the published article on your Shopify store</li>
             </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopifyIntegration;
