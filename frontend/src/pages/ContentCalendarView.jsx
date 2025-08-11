import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { apiService } from '../utils/api';
import { CalendarIcon, Edit, CheckCircle, Clock, Send } from 'lucide-react';

const ContentCalendarView = ({ inline = false, onClose }) => {
  const [companyName, setCompanyName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [contentPlan, setContentPlan] = useState(null);
  const [cmsPlatform, setCmsPlatform] = useState('wordpress');
  const [showCmsSetup, setShowCmsSetup] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [cmsCredentials, setCmsCredentials] = useState({});
  const [isSavingCredentials, setIsSavingCredentials] = useState(false);

  const handleGenerateCalendar = async () => {
    if (!companyName.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await apiService.generateContentCalendar({ companyName });
      setContentPlan(response.data.data);
    } catch (error) {
      console.error('Error generating content calendar:', error);
      alert('Failed to generate content calendar. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApproveCalendar = async () => {
    if (!contentPlan) return;
    
    setIsApproving(true);
    try {
      await apiService.approveContentCalendar({ 
        companyName,
        contentPlan: contentPlan.map(item => ({ ...item, status: 'approved' }))
      });
      alert('Content calendar approved and scheduled for auto-publishing!');
      setContentPlan(prev => prev.map(item => ({ ...item, status: 'approved' })));
    } catch (error) {
      console.error('Error approving calendar:', error);
      alert('Failed to approve calendar. Please try again.');
    } finally {
      setIsApproving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'published': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'published': return <Send className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Handle body scroll when modal is open
  useEffect(() => {
    if (showCmsSetup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showCmsSetup]);

  const handleSaveCMSCredentials = async () => {
    if (!cmsPlatform) return;
    
    setIsSavingCredentials(true);
    try {
      // Prepare credentials object based on platform
      const authDetails = {};
      
      switch (cmsPlatform) {
        case 'wordpress':
          authDetails.siteUrl = cmsCredentials.siteUrl;
          authDetails.username = cmsCredentials.username;
          authDetails.applicationPassword = cmsCredentials.applicationPassword;
          break;
        case 'webflow':
          authDetails.apiKey = cmsCredentials.apiKey;
          authDetails.siteId = cmsCredentials.siteId;
          break;
        case 'shopify':
          authDetails.shopDomain = cmsCredentials.shopDomain;
          authDetails.accessToken = cmsCredentials.accessToken;
          break;
        case 'wix':
          authDetails.siteId = cmsCredentials.siteId;
          authDetails.apiKey = cmsCredentials.apiKey;
          authDetails.accessToken = cmsCredentials.accessToken;
          break;
      }

      // Save credentials
      await apiService.saveCMSCredentials({
        platform: cmsPlatform,
        authDetails
      });

      alert('CMS credentials saved successfully! Connection tested and verified.');
      setShowCmsSetup(false);
      setCmsCredentials({});
    } catch (error) {
      console.error('Error saving CMS credentials:', error);
      alert('Failed to save CMS credentials. Please check your input and try again.');
    } finally {
      setIsSavingCredentials(false);
    }
  };

  if (!contentPlan) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border border-[#b0b0d8] bg-white">
          <CardHeader>
            <CardTitle className="text-[#4a4a6a] flex items-center space-x-2">
              <CalendarIcon className="w-6 h-6" />
              <span>Content Calendar Generator</span>
            </CardTitle>
            <CardDescription className="text-[#4a4a6a]">
              Generate a 30-day AI-powered content plan for your company
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#4a4a6a] mb-2">
                Company Name
              </label>
              <Input
                type="text"
                placeholder="Enter your company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="border-[#b0b0d8] focus:border-[#6658f4]"
              />
            </div>
            <Button 
              onClick={handleGenerateCalendar}
              disabled={!companyName.trim() || isGenerating}
              className="w-full gradient-primary"
            >
              {isGenerating ? 'Generating...' : 'Generate Calendar'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-[#4a4a6a]">
            Content Calendar for {companyName}
          </h3>
          <p className="text-sm text-[#4a4a6a]">
            {contentPlan.filter(item => item.status === 'approved').length} of {contentPlan.length} posts approved
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowCmsSetup(true)}
            className="border-[#b0b0d8] text-[#4a4a6a] hover:bg-white hover:border-[#6658f4]"
          >
            CMS Setup
          </Button>

          <Button
            onClick={handleApproveCalendar}
            disabled={isApproving}
            className="gradient-primary"
          >
            {isApproving ? 'Approving...' : 'Approve Calendar'}
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-[#4a4a6a] p-2">
            {day}
          </div>
        ))}
        
        {contentPlan.map((item, index) => (
          <div key={index} className="min-h-[120px] border border-[#b0b0d8] rounded-lg p-2 hover:border-[#6658f4] transition-colors cursor-pointer">
            <div className="text-xs text-[#4a4a6a] mb-1">
              {new Date(item.date).getDate()}
            </div>
            <div className="space-y-1">
              <div className="text-xs font-medium text-[#4a4a6a] line-clamp-2">
                {item.title}
              </div>
              <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                <span className="flex items-center space-x-1">
                  {getStatusIcon(item.status)}
                  <span>{item.status}</span>
                </span>
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* CMS Setup Modal */}
      {showCmsSetup && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCmsSetup(false);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="relative p-6">
              {/* Close Button */}
              <button
                onClick={() => setShowCmsSetup(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">CMS Platform Setup</h2>
                <p className="text-gray-600">
                  Configure your CMS credentials for auto-publishing
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#4a4a6a] mb-2">
                    CMS Platform
                  </label>
                  <Select value={cmsPlatform} onValueChange={setCmsPlatform}>
                    <SelectTrigger className="border-[#b0b0d8] focus:border-[#6658f4]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wordpress">WordPress</SelectItem>
                      <SelectItem value="webflow">Webflow</SelectItem>
                      <SelectItem value="shopify">Shopify</SelectItem>
                      <SelectItem value="wix">Wix</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* WordPress Fields */}
                {cmsPlatform === 'wordpress' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-[#4a4a6a] mb-2">
                        Site URL
                      </label>
                      <Input
                        placeholder="https://yoursite.com"
                        className="border-[#b0b0d8] focus:border-[#6658f4]"
                        value={cmsCredentials.siteUrl || ''}
                        onChange={(e) => setCmsCredentials({ ...cmsCredentials, siteUrl: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#4a4a6a] mb-2">
                        Username
                      </label>
                      <Input
                        placeholder="your_username"
                        className="border-[#b0b0d8] focus:border-[#6658f4]"
                        value={cmsCredentials.username || ''}
                        onChange={(e) => setCmsCredentials({ ...cmsCredentials, username: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#4a4a6a] mb-2">
                        Application Password
                      </label>
                      <Input
                        type="password"
                        placeholder="your_app_password"
                        className="border-[#b0b0d8] focus:border-[#6658f4]"
                        value={cmsCredentials.applicationPassword || ''}
                        onChange={(e) => setCmsCredentials({ ...cmsCredentials, applicationPassword: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* Webflow Fields */}
                {cmsPlatform === 'webflow' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-[#4a4a6a] mb-2">
                        API Key
                      </label>
                      <Input
                        placeholder="your_api_key"
                        className="border-[#b0b0d8] focus:border-[#6658f4]"
                        value={cmsCredentials.apiKey || ''}
                        onChange={(e) => setCmsCredentials({ ...cmsCredentials, apiKey: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#4a4a6a] mb-2">
                        Site ID
                      </label>
                      <Input
                        placeholder="your_site_id"
                        className="border-[#b0b0d8] focus:border-[#6658f4]"
                        value={cmsCredentials.siteId || ''}
                        onChange={(e) => setCmsCredentials({ ...cmsCredentials, siteId: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* Shopify Fields */}
                {cmsPlatform === 'shopify' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-[#4a4a6a] mb-2">
                        Shop Domain
                      </label>
                      <Input
                        placeholder="yourshop.myshopify.com"
                        className="border-[#b0b0d8] focus:border-[#6658f4]"
                        value={cmsCredentials.shopDomain || ''}
                        onChange={(e) => setCmsCredentials({ ...cmsCredentials, shopDomain: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#4a4a6a] mb-2">
                        Access Token
                      </label>
                      <Input
                        type="password"
                        placeholder="your_access_token"
                        className="border-[#b0b0d8] focus:border-[#6658f4]"
                        value={cmsCredentials.accessToken || ''}
                        onChange={(e) => setCmsCredentials({ ...cmsCredentials, accessToken: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* Wix Fields */}
                {cmsPlatform === 'wix' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-[#4a4a6a] mb-2">
                        Site ID
                      </label>
                      <Input
                        placeholder="your_site_id"
                        className="border-[#b0b0d8] focus:border-[#6658f4]"
                        value={cmsCredentials.siteId || ''}
                        onChange={(e) => setCmsCredentials({ ...cmsCredentials, siteId: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#4a4a6a] mb-2">
                        API Key
                      </label>
                      <Input
                        placeholder="your_api_key"
                        className="border-[#b0b0d8] focus:border-[#6658f4]"
                        value={cmsCredentials.apiKey || ''}
                        onChange={(e) => setCmsCredentials({ ...cmsCredentials, apiKey: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#4a4a6a] mb-2">
                        Access Token
                      </label>
                      <Input
                        type="password"
                        placeholder="your_access_token"
                        className="border-[#b0b0d8] focus:border-[#6658f4]"
                        value={cmsCredentials.accessToken || ''}
                        onChange={(e) => setCmsCredentials({ ...cmsCredentials, accessToken: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCmsSetup(false)}
                    className="border-[#b0b0d8] text-[#4a4a6a] hover:bg-white hover:border-[#6658f4]"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveCMSCredentials} 
                    className="gradient-primary"
                    disabled={!cmsPlatform || isSavingCredentials}
                  >
                    {isSavingCredentials ? 'Saving...' : 'Save & Test Connection'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentCalendarView;
