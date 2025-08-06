import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiService } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import DomainAnalysis from './DomainAnalysis';

const Dashboard = () => {
  const [token, setToken] = useState(JSON.parse(localStorage.getItem("auth")) || "");
  const [data, setData] = useState({});
  const [analyzeResult, setAnalyzeResult] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showAnalyzeLink, setShowAnalyzeLink] = useState(false);
  const [showDomainAnalysis, setShowDomainAnalysis] = useState(false);
  const [brands, setBrands] = useState([]);
  const linkRef = useRef();
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    if (!token) {
      navigate("/login");
      toast.warn("Please login first to access dashboard");
      return;
    }

    setDashboardLoading(true);
    try {
      const response = await apiService.getDashboard();
      setData({ 
        msg: response.data.msg, 
        luckyNumber: response.data.secret 
      });
      
      // Also fetch user's brands for the blog scoring link
      const brandsResponse = await apiService.getUserBrands();
      setBrands(brandsResponse.data.brands || []);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      // Error is already handled by API interceptor
    } finally {
      setDashboardLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await apiService.getHistory();
      setHistory(response.data.history || []);
      setShowHistory(true);
    } catch (error) {
      console.error('History fetch error:', error);
      // Error is already handled by API interceptor
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const handleAnalyzeLink = async (e) => {
    e.preventDefault();
    const url = linkRef.current?.value?.trim();
    
    if (!url) {
      toast.error("Please enter a valid URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.analyzeLink({ url });
      setAnalyzeResult(response.data.result);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error('Link analysis error:', error);
      // Error is already handled by API interceptor
    } finally {
      setLoading(false);
    }
  };





  const handleGetSuggestion = async () => {
    if (!analyzeResult) {
      toast.error("Please analyze a link first");
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.getSuggestions({
        tags: analyzeResult,
        url: linkRef.current?.value
      });
      setSuggestion(response.data.suggestion);
      toast.success("Suggestion received!");
    } catch (error) {
      console.error('Suggestion fetch error:', error);
      // Error is already handled by API interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth");
    setToken("");
    navigate("/login");
    toast.success("Logged out successfully");
  };

  if (dashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>

          {data.msg && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-lg text-blue-800">
                Hi {data.msg}! {data.luckyNumber && `Your lucky number is: ${data.luckyNumber}`}
              </p>
            </div>
          )}

          {!showAnalyzeLink && !showDomainAnalysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => setShowAnalyzeLink(true)}
                className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
              >
                Analyze Link
              </button>
              <button
                onClick={() => setShowDomainAnalysis(true)}
                className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-medium"
              >
                Domain Analysis
              </button>

              {brands.length > 0 ? (
                <Link
                  to={`/brand/${brands[0].id}/blog-scoring`}
                  className="p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-lg font-medium text-center flex items-center justify-center"
                >
                  Blog GEO Scoring
                </Link>
              ) : (
                <button
                  disabled
                  className="p-4 bg-gray-400 text-white rounded-lg text-lg font-medium text-center flex items-center justify-center cursor-not-allowed"
                >
                  Blog GEO Scoring
                </button>
              )}
            </div>
          )}

          {showAnalyzeLink && (
            <div className="mb-6">
              <form onSubmit={handleAnalyzeLink} className="flex flex-col sm:flex-row gap-4">
                <input
                  type="url"
                  ref={linkRef}
                  placeholder="Enter a URL to analyze"
                  className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Analyzing...' : 'Analyze Link'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAnalyzeLink(false)}
                  className="px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </form>
            </div>
          )}

          {showDomainAnalysis && (
            <DomainAnalysis onClose={() => setShowDomainAnalysis(false)} />
          )}



          {loading && (
            <div className="flex justify-center my-8">
              <LoadingSpinner size="large" message="Processing..." />
            </div>
          )}



          {analyzeResult && (
            <div className="mt-6 space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Analysis Result</h3>
                  <button
                    onClick={handleGetSuggestion}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Getting Suggestions...' : 'Get AI Suggestions'}
                  </button>
                </div>
                
                <div className="bg-white rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                    {JSON.stringify(analyzeResult, null, 2)}
                  </pre>
                </div>
              </div>

              {suggestion && (
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Suggestions</h3>
                  <div className="bg-white rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                      {suggestion}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center mt-8">
            <button
              onClick={fetchHistory}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              View History
            </button>
            <Link
              to="/history"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Full History
            </Link>
          </div>

          {showHistory && (
            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Analysis History</h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No history found.</p>
              ) : (
                <div className="space-y-4">
                  {history.map((item, idx) => (
                    <div key={item._id || idx} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.url}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(item.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;