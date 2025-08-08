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
              <h2 className="text-2xl font-semibold text-foreground"></h2>
              <p className="text-muted-foreground"></p>
            </div>
            <Button variant="outline" onClick={() => setActiveTool(null)} className="inline-flex items-center">
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
              <h2 className="text-2xl font-semibold text-foreground">Blog Analysis</h2>
              <p className="text-muted-foreground">Analyze blog content quality and optimization</p>
            </div>
            <Button variant="outline" onClick={() => setActiveTool(null)} className="inline-flex items-center">
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
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">S</span>
            </div>
            <span className="text-lg font-semibold text-foreground">Snowball</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => { setActiveSection('dashboard'); setActiveTool(null); }}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === 'dashboard' && !activeTool
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => { setActiveSection('dashboard'); setActiveTool('blog'); }}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTool === 'blog' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Blog Analysis</span>
          </button>

          <button
            onClick={() => { setActiveSection('history'); setActiveTool(null); }}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === 'history'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>History</span>
          </button>

          <button
            onClick={() => { setActiveSection('settings'); setActiveTool(null); }}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === 'settings'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <header className="bg-card border-b border-border px-8 py-6 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Welcome back, {userName}!
              </h1>
              <p className="text-muted-foreground mt-1">
                Ready to analyze your next project?
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 overflow-y-auto min-h-0">
          {activeSection === 'dashboard' && (
            <div className="space-y-8">
              {!activeTool && (
                <>
                  {/* Action Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Domain Analysis Card */}
                    <Card 
                      className="cursor-pointer hover:shadow-md transition-shadow border-0 bg-card"
                      onClick={() => setActiveTool('domain')}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Globe className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              Domain Analysis
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Comprehensive brand insights
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Analyze entire domains for competitive intelligence, brand positioning, and market opportunities.
                        </p>
                      </CardContent>
                    </Card>

                    {/* Blog Analysis Card */}
                    <Card 
                      className="cursor-pointer hover:shadow-md transition-shadow border-0 bg-card"
                      onClick={() => setActiveTool('blog')}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              Blog Analysis
                            </h3>
                            <p className="text-sm text-muted-foreground">
                        
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Analyze blog content using our GEO framework for content optimization and scoring.
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Analyze Link Form */}
                  {showAnalyzeLink && (
                    <Card className="border-0 bg-card">
                      <CardHeader>
                        <CardTitle>Quick Link Analysis</CardTitle>
                        <CardDescription>
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
                              className="flex-1"
                            />
                            <Button type="submit">Analyze</Button>
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
                      className="flex items-center space-x-2"
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
                <h2 className="text-2xl font-semibold text-foreground mb-2">Analysis History</h2>
                <p className="text-muted-foreground">View your previous domain and blog analyses</p>
              </div>
              {/* History content would go here */}
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">Settings</h2>
                <p className="text-muted-foreground">Manage your account and preferences</p>
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