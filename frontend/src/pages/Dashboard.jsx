import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import DomainAnalysis from './DomainAnalysis';
import BlogAnalysis from './BlogAnalysis';
import { apiService } from '../utils/api';
import { getUserName } from '../utils/auth';
import { 
  BarChart3, 
  Globe, 
  FileText, 
  Settings, 
  LogOut, 
  Link as LinkIcon,
  Activity,
  ArrowLeft
} from 'lucide-react';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showAnalyzeLink, setShowAnalyzeLink] = useState(false);
  const [activeTool, setActiveTool] = useState(null); // 'domain' | 'blog' | null
  const [domainToAnalyze, setDomainToAnalyze] = useState('');
  const [userName, setUserName] = useState(getUserName());

  const handleLogout = () => {
    apiService.logout();
  };

  const handleDomainAnalysisSubmit = (e) => {
    e.preventDefault();
    if (domainToAnalyze.trim()) {
      setActiveTool('domain');
    }
  };

  const renderInlineTool = () => {
    if (activeTool === 'domain') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-[#4a4a6a]"></h2>
              <p className="text-[#4a4a6a]"></p>
            </div>
            <Button variant="outline" onClick={() => setActiveTool(null)} className="inline-flex items-center border-[#b0b0d8] text-[#4a4a6a] hover:bg-white hover:border-[#6658f4]">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </div>
          <DomainAnalysis onClose={() => setActiveTool(null)} />
        </div>
      );
    }
    if (activeTool === 'blog') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-[#4a4a6a]">Blog Analysis</h2>
              <p className="text-[#4a4a6a]">Analyze blog content quality and optimization</p>
            </div>
            <Button variant="outline" onClick={() => setActiveTool(null)} className="inline-flex items-center border-[#b0b0d8] text-[#4a4a6a] hover:bg-white hover:border-[#6658f4]">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </div>
          <BlogAnalysis inline onClose={() => setActiveTool(null)} />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-[#b0b0d8] flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-[#b0b0d8]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-white">S</span>
            </div>
            <span className="text-lg font-semibold text-[#4a4a6a]">Snowball</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => { setActiveSection('dashboard'); setActiveTool(null); }}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeSection === 'dashboard' && !activeTool
                ? 'nav-active'
                : 'text-[#4a4a6a] hover:text-[#6658f4] hover:bg-white hover:border-l-3 hover:border-l-[#6658f4]/20'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => { setActiveSection('blog-analysis'); setActiveTool('blog'); }}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeSection === 'blog-analysis' || activeTool === 'blog'
                ? 'nav-active'
                : 'text-[#4a4a6a] hover:text-[#6658f4] hover:bg-white hover:border-l-3 hover:border-l-[#6658f4]/20'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Blog Analysis</span>
          </button>

          <button
            onClick={() => { setActiveSection('history'); setActiveTool(null); }}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeSection === 'history'
                ? 'nav-active'
                : 'text-[#4a4a6a] hover:text-[#6658f4] hover:bg-white hover:border-l-3 hover:border-l-[#6658f4]/20'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>History</span>
          </button>

          <button
            onClick={() => { setActiveSection('settings'); setActiveTool(null); }}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeSection === 'settings'
                ? 'nav-active'
                : 'text-[#4a4a6a] hover:text-[#6658f4] hover:bg-white hover:border-l-3 hover:border-l-[#6658f4]/20'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-[#b0b0d8]">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-[#4a4a6a] hover:text-[#6658f4] hover:bg-white"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <header className="bg-white border-b border-[#b0b0d8] px-8 py-6 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-[#4a4a6a]">
                Welcome back, {userName}!
              </h1>
              <p className="text-[#4a4a6a] mt-1">
                Ready to analyze your next project?
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 overflow-y-auto min-h-0 bg-white">
          {activeSection === 'dashboard' && (
            <div className="space-y-8">
              {!activeTool && (
                <>
                  {/* Action Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Domain Analysis Card */}
                    <Card 
                      className="cursor-pointer card-hover border border-[#b0b0d8] bg-white"
                      onClick={() => setActiveTool('domain')}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-12 h-12 bg-[#7c77ff] rounded-lg flex items-center justify-center">
                            <Globe className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-[#4a4a6a]">
                              Domain Analysis
                            </h3>
                            <p className="text-sm text-[#4a4a6a]">
                              Comprehensive brand insights
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-[#4a4a6a]">
                          Analyze entire domains for competitive intelligence, brand positioning, and market opportunities.
                        </p>
                      </CardContent>
                    </Card>

                    {/* Blog Analysis Card */}
                    <Card 
                      className="cursor-pointer card-hover border border-[#b0b0d8] bg-white"
                      onClick={() => setActiveTool('blog')}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-12 h-12 bg-[#7c77ff] rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-[#4a4a6a]">
                              Blog Analysis
                            </h3>
                            <p className="text-sm text-[#4a4a6a]">
                              Content quality optimization
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-[#4a4a6a]">
                          Analyze blog content using our GEO framework for content optimization and scoring.
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Analyze Link Form */}
                  {showAnalyzeLink && (
                    <Card className="border border-[#b0b0d8] bg-white">
                      <CardHeader>
                        <CardTitle className="text-[#4a4a6a]">Quick Link Analysis</CardTitle>
                        <CardDescription className="text-[#4a4a6a]">
                          Enter a URL to get instant SEO insights
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleDomainAnalysisSubmit} className="space-y-4">
                          <div className="flex space-x-2">
                            <Input
                              type="url"
                              placeholder="https://example.com"
                              value={domainToAnalyze}
                              onChange={(e) => setDomainToAnalyze(e.target.value)}
                              className="flex-1 border-[#b0b0d8] focus:border-[#6658f4]"
                            />
                            <Button type="submit" className="gradient-primary">Analyze</Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  )}

                  {/* Quick Actions */}
                  <div className="flex space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowAnalyzeLink(!showAnalyzeLink)}
                      className="flex items-center space-x-2 border-[#b0b0d8] text-[#4a4a6a] hover:bg-white hover:border-[#6658f4]"
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span>Quick Link Analysis</span>
                    </Button>
                  </div>
                </>
              )}

              {activeTool && renderInlineTool()}
            </div>
          )}

          {activeSection === 'history' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-[#4a4a6a] mb-2">Analysis History</h2>
                <p className="text-[#4a4a6a]">View your previous domain and blog analyses</p>
              </div>
              {/* History content would go here */}
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-[#4a4a6a] mb-2">Settings</h2>
                <p className="text-[#4a4a6a]">Manage your account and preferences</p>
              </div>
              {/* Settings content would go here */}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;