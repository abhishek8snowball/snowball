import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const CategoriesSetup = () => {
  const { businessData, competitors, categories, setCategories, nextStep, prevStep, setLoading, setError } = useOnboarding();
  const [localCategories, setLocalCategories] = useState(categories);
  const [isGeneratingCategories, setIsGeneratingCategories] = useState(false);

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  useEffect(() => {
    // Auto-generate categories when component mounts
    if (businessData.domain && categories.length === 0) {
      generateCategoriesWithAI();
    }
  }, [businessData.domain]);

  const generateCategoriesWithAI = async () => {
    setIsGeneratingCategories(true);
    setLoading(true);
    
    try {
      const response = await fetch('/api/v1/onboarding/generate-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth')}`
        },
        body: JSON.stringify({ 
          domain: businessData.domain,
          businessName: businessData.businessName,
          description: businessData.description,
          competitors: competitors
        })
      });

      if (!response.ok) throw new Error('Failed to generate categories');

      const categoriesData = await response.json();
      // The API now returns saved categories with _id from the database
      const categoriesList = categoriesData.categories || [];
      console.log('🔍 Received saved categories:', categoriesList);
      setLocalCategories(categoriesList);
      setCategories(categoriesList);

    } catch (error) {
      setError('Failed to generate categories. Please try again.');
      console.error('Categories generation error:', error);
    } finally {
      setIsGeneratingCategories(false);
      setLoading(false);
    }
  };

  const handleCategoryToggle = (category) => {
    setLocalCategories(prev => {
      // Handle both string categories and saved category objects
      const categoryId = typeof category === 'string' ? category : category._id;
      const categoryName = typeof category === 'string' ? category : category.categoryName;
      
      const exists = prev.some(c => 
        (typeof c === 'string' ? c : c._id) === categoryId
      );
      
      if (exists) {
        return prev.filter(c => (typeof c === 'string' ? c : c._id) !== categoryId);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleSave = () => {
    setCategories(localCategories);
    nextStep();
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Select Your Business Categories
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Information Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 font-medium mb-2">
            Categories help us understand your business better and generate relevant content.
          </p>
          <p className="text-sm text-blue-700">
            Select the categories that best describe your business and target audience.
          </p>
        </div>

        {/* Generate Categories Button */}
        <div className="text-center">
          <Button
            onClick={generateCategoriesWithAI}
            disabled={isGeneratingCategories}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isGeneratingCategories ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Generating Categories...
              </div>
            ) : (
              '🎯 Generate Categories with AI'
            )}
          </Button>
        </div>

        {/* Categories Grid */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Available Categories:</h3>
          <div className="grid grid-cols-2 gap-3">
            {localCategories.map((category, index) => {
              // Handle both string categories and saved category objects
              const categoryName = typeof category === 'string' ? category : category.categoryName;
              const categoryId = typeof category === 'string' ? category : category._id;
              
              return (
                <button
                  key={categoryId || index}
                  onClick={() => handleCategoryToggle(category)}
                  className={`p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                    localCategories.some(c => 
                      (typeof c === 'string' ? c : c._id) === categoryId
                    )
                      ? 'border-blue-500 bg-blue-50 text-blue-800'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {categoryName}
                </button>
              );
            })}
          </div>
          
          {localCategories.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">
              No categories generated yet. Click the button above to generate them with AI.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            onClick={prevStep}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            ← Previous
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={localCategories.length === 0}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2"
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoriesSetup;
