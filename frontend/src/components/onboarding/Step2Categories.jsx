import React, { useState, useEffect } from 'react';
import { apiService } from '../../utils/api';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tags, Sparkles, Edit2, Plus, X } from 'lucide-react';

const Step2Categories = ({ onComplete, loading, error, progress }) => {
  const [categories, setCategories] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    // Load saved progress if available
    if (progress?.step2?.categories) {
      setCategories(progress.step2.categories);
    }
  }, [progress]);

  const handleExtractCategories = async () => {
    try {
      setIsExtracting(true);
      
      const response = await apiService.step2Categories({});
      
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Categories extraction failed:', error);
      alert('Failed to extract categories. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleEditCategory = (index) => {
    setEditingIndex(index);
    setEditValue(categories[index]);
  };

  const handleSaveEdit = () => {
    if (editValue.trim()) {
      const newCategories = [...categories];
      newCategories[editingIndex] = editValue.trim();
      setCategories(newCategories);
    }
    setEditingIndex(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const handleRemoveCategory = (index) => {
    const newCategories = categories.filter((_, i) => i !== index);
    setCategories(newCategories);
  };

  const handleAddCategory = () => {
    if (categories.length < 6) {
      setCategories([...categories, '']);
      setEditingIndex(categories.length);
      setEditValue('');
    }
  };

  const handleContinue = () => {
    if (categories.length === 0) {
      alert('Please extract or add at least one category');
      return;
    }

    // Filter out empty categories
    const validCategories = categories.filter(cat => cat.trim());

    onComplete({
      step2: {
        categories: validCategories,
        completed: true
      }
    }, 3);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-semibold text-[#4a4a6a] mb-3">
          Business Categories
        </h2>
        <p className="text-[#4a4a6a]">
          We'll identify the main categories your business operates in
        </p>
      </div>

      <div className="space-y-8">
        {/* Categories Card */}
        <Card className="border-[#b0b0d8] bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tags className="w-5 h-5 text-[#7765e3]" />
                <CardTitle className="text-[#4a4a6a]">Business Categories</CardTitle>
              </div>
              <Button
                onClick={handleExtractCategories}
                disabled={isExtracting}
                variant="outline"
                className="border-[#7765e3] text-[#7765e3] hover:bg-[#7765e3] hover:text-white"
              >
                {isExtracting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Extracting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Extract with AI
                  </>
                )}
              </Button>
            </div>
            <CardDescription className="text-[#4a4a6a]">
              Categories help us understand your business focus areas
            </CardDescription>
          </CardHeader>
          <CardContent>

            {categories.length === 0 ? (
              <div className="text-center py-12 text-[#4a4a6a]/70">
                <Tags className="w-12 h-12 mx-auto mb-4 text-[#b0b0d8]" />
                <p>No categories yet. Click "Extract with AI" to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((category, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-[#b0b0d8]/30">
                    {editingIndex === index ? (
                      <>
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 px-3 py-2 border border-[#b0b0d8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#6658f4] focus:border-[#6658f4]"
                          placeholder="Enter category name"
                        />
                        <Button
                          onClick={handleSaveEdit}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          size="sm"
                          variant="outline"
                          className="border-[#b0b0d8] text-[#4a4a6a]"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1 text-[#4a4a6a] font-medium">
                          {category}
                        </div>
                        <Button
                          onClick={() => handleEditCategory(index)}
                          size="sm"
                          variant="ghost"
                          className="text-[#7765e3] hover:text-[#6658f4] hover:bg-[#7765e3]/10"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleRemoveCategory(index)}
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add Category Button */}
            {categories.length < 6 && (
              <Button
                onClick={handleAddCategory}
                variant="outline"
                className="mt-6 w-full border-2 border-dashed border-[#b0b0d8] text-[#4a4a6a] hover:border-[#7765e3] hover:text-[#7765e3] hover:bg-[#7765e3]/5 h-12"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Category
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Continue Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleContinue}
            disabled={loading || categories.length === 0}
            className="gradient-primary px-8 h-12 min-w-[120px]"
          >
            {loading ? 'Processing...' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Step2Categories;
