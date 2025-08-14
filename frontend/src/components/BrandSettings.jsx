import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { apiService } from '../utils/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';

const BrandSettings = () => {
  const [brandTonality, setBrandTonality] = useState('');
  const [brandInformation, setBrandInformation] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load existing brand settings on component mount
  useEffect(() => {
    loadBrandSettings();
  }, []);

  const loadBrandSettings = async () => {
    try {
      setLoading(true);
      const response = await apiService.getBrandSettings();
      
      if (response.data.success) {
        const { brandTonality: tonality, brandInformation: info, updatedAt } = response.data.data;
        setBrandTonality(tonality || '');
        setBrandInformation(info || '');
        setLastUpdated(updatedAt ? new Date(updatedAt).toLocaleString() : null);
      }
    } catch (error) {
      console.error('Error loading brand settings:', error);
      toast.error('Failed to load brand settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await apiService.saveBrandSettings({
        brandTonality,
        brandInformation
      });
      
      if (response.data.success) {
        toast.success('Brand settings saved successfully!');
        setLastUpdated(new Date().toLocaleString());
      }
    } catch (error) {
      console.error('Error saving brand settings:', error);
      const errorMsg = error.response?.data?.msg || 'Failed to save brand settings';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    loadBrandSettings();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#6658f4] mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading brand settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Brand Tonality */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#4a4a6a] mb-2">
              Brand Tonality
            </label>
            <p className="text-xs text-gray-600 mb-2">
              Define your brand's voice, tone, and personality (max 500 characters)
            </p>
            <Textarea
              value={brandTonality}
              onChange={(e) => setBrandTonality(e.target.value)}
              placeholder="e.g., Professional yet approachable, innovative, customer-focused, trustworthy..."
              className="min-h-[100px] resize-none border-[#b0b0d8] focus:border-[#6658f4] focus:ring-[#6658f4]/20"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 text-right mt-1">
              {brandTonality.length}/500 characters
            </div>
          </div>
        </div>

        {/* Brand Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#4a4a6a] mb-2">
              Brand Information
            </label>
            <p className="text-xs text-gray-600 mb-2">
              Share key details about your brand, products, and services (max 2000 characters)
            </p>
            <Textarea
              value={brandInformation}
              onChange={(e) => setBrandInformation(e.target.value)}
              placeholder="e.g., We are a B2B SaaS company specializing in AI-powered sales automation. Our platform helps sales teams increase productivity through intelligent lead scoring, automated outreach, and data-driven insights..."
              className="min-h-[100px] resize-none border-[#b0b0d8] focus:border-[#6658f4] focus:ring-[#6658f4]/20"
              maxLength={2000}
            />
            <div className="text-xs text-gray-500 text-right mt-1">
              {brandInformation.length}/2000 characters
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {lastUpdated && (
            <span>Last updated: {lastUpdated}</span>
          )}
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={handleReset}
            variant="outline"
            className="border-[#b0b0d8] text-[#4a4a6a] hover:border-[#6658f4]"
          >
            Reset Changes
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#6658f4] hover:bg-[#6658f4]/90 text-white"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-md">
        <h4 className="font-medium text-gray-800 mb-2">💡 How this helps:</h4>
        <ul className="space-y-1 list-disc list-inside">
          <li>Your brand tonality will be used to generate more personalized AI responses</li>
          <li>Brand information helps AI understand your business context better</li>
          <li>These settings are used across all AI-powered features in the platform</li>
          <li>You can update these anytime to refine your brand's AI interactions</li>
        </ul>
      </div>
    </div>
  );
};

export default BrandSettings;
