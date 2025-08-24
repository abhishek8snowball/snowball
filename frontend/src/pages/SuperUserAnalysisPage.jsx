import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { 
  BarChart3, 
  Globe, 
  FileText, 
  Settings, 
  LogOut, 
  Link as LinkIcon,
  Activity,
  Calendar,
  Building2,
  Crown,
  ArrowLeft,
  History
} from 'lucide-react';

import SuperUserDomainAnalysis from '../components/SuperUserDomainAnalysis';
import { apiService } from '../utils/api';
import { getUserName, isSuperuser } from '../utils/auth';

const SuperUserAnalysisPage = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(getUserName());
  const [activeSection, setActiveSection] = useState('domain-analysis');
  const [analysisHistory, setAnalysisHistory] = useState([]);

  // Redirect non-super users
  useEffect(() => {
    if (!isSuperuser()) {
      console.log('❌ Access denied - redirecting non-super user');
      navigate('/dashboard');
      return;
    }
    
    // Load super user analysis history
    loadAnalysisHistory();
  }, [navigate]);

  const loadAnalysisHistory = async () => {
    try {
      // Get super user analysis history from backend
      const response = await apiService.get('/api/v1/brand/super-user/history');
      setAnalysisHistory(response.data.analyses || []);
    } catch (error) {
      console.log('No analysis history found or error loading:', error);
      setAnalysisHistory([]);
    }
  };

  const handleLogout = () => {
    apiService.logout();
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-[#ffffff] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#ffffff]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#4a4a6a]">Super User</h2>
              <p className="text-sm text-[#4a4a6a]">{userName}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button
            onClick={handleBack}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-[#4a4a6a] hover:text-[#6658f4] hover:bg-gray-100 hover:border-l-3 hover:border-l-[#6658f4]/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <button
            onClick={() => setActiveSection('domain-analysis')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeSection === 'domain-analysis'
                ? 'bg-[#6658f4] text-white shadow-md'
                : 'text-[#4a4a6a] hover:text-[#6658f4] hover:bg-gray-100 hover:border-l-3 hover:border-l-[#6658f4]/20'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Domain Analysis</span>
          </button>

          <button
            onClick={() => setActiveSection('history')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeSection === 'history'
                ? 'bg-[#6658f4] text-white shadow-md'
                : 'text-[#4a4a6a] hover:text-[#6658f4] hover:bg-gray-100 hover:border-l-3 hover:border-l-[#6658f4]/20'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Analysis History</span>
            {analysisHistory.length > 0 && (
              <span className="ml-auto bg-[#6658f4] text-white text-xs px-2 py-0.5 rounded-full">
                {analysisHistory.length}
              </span>
            )}
          </button>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-[#ffffff]">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-[#4a4a6a] hover:text-[#6658f4] hover:bg-gray-100 hover:border-l-3 hover:border-l-[#6658f4]/20"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <header className="bg-white border-b border-[#ffffff] px-8 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#4a4a6a]">
                  {activeSection === 'domain-analysis' ? 'Domain Analysis' : 'Analysis History'}
                </h1>
                <p className="text-sm text-[#4a4a6a]">
                  {activeSection === 'domain-analysis' 
                    ? 'Analyze any domain and get comprehensive brand intelligence'
                    : 'View all your previous domain analyses'
                  }
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto px-8 py-6">
          {activeSection === 'domain-analysis' && (
            <SuperUserDomainAnalysis onAnalysisComplete={loadAnalysisHistory} />
          )}

          {activeSection === 'history' && (
            <div className="space-y-6">
              {analysisHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <History className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis History</h3>
                  <p className="text-gray-500 mb-4">You haven't run any domain analyses yet.</p>
                  <Button
                    onClick={() => setActiveSection('domain-analysis')}
                    className="gradient-primary"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Start First Analysis
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analysisHistory.map((analysis, index) => (
                    <div
                      key={analysis.id || index}
                      className="bg-white border border-[#b0b0d8] rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => {
                        // Navigate to view this analysis
                        navigate(`/super-user-analysis/${analysis.id}`);
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-[#7c77ff] rounded-lg flex items-center justify-center">
                            <Globe className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-[#4a4a6a]">{analysis.domain}</h4>
                            <p className="text-xs text-gray-500">{formatDate(analysis.createdAt)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Mentions:</span>
                          <span className="font-medium">{analysis.totalMentions || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Competitors:</span>
                          <span className="font-medium">{analysis.competitorsCount || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Brand Share:</span>
                          <span className="font-medium">{analysis.brandShare || 0}%</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Crown className="w-3 h-3 mr-1" />
                          Super User Analysis
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SuperUserAnalysisPage;