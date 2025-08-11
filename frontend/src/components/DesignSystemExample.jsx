import React from 'react';

const DesignSystemExample = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container-lg mx-auto space-y-12">
        
        {/* Header Section */}
        <header className="text-center">
          <h1 className="text-display text-gray-900 mb-4">Snowball Design System</h1>
          <p className="text-large text-gray-600 max-w-2xl mx-auto">
            A comprehensive design system built with Tailwind CSS and React, providing consistent UI components and design patterns.
          </p>
        </header>

        {/* Typography Section */}
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Typography Scale</h2>
            <p className="card-description">Consistent text sizing and weights across the platform</p>
          </div>
          <div className="card-content space-y-4">
            <div>
              <h1 className="text-h1 text-gray-900">Heading 1 (28px, Semibold)</h1>
              <h2 className="text-h2 text-gray-800">Heading 2 (24px, Semibold)</h2>
              <h3 className="text-h3 text-gray-700">Heading 3 (20px, Semibold)</h3>
              <h4 className="text-h4 text-gray-600">Heading 4 (18px, Medium)</h4>
            </div>
            <div className="space-y-2">
              <p className="text-large text-gray-700">Large text (16px, Normal)</p>
              <p className="text-base text-gray-600">Base text (14px, Normal)</p>
              <p className="text-small text-gray-500">Small text (12px, Normal)</p>
              <p className="text-tiny text-gray-400">Tiny text (11px, Normal)</p>
            </div>
          </div>
        </section>

        {/* Color Palette Section */}
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Color Palette</h2>
            <p className="card-description">Primary colors and gray scale for consistent theming</p>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-50 rounded-lg border border-gray-200 mx-auto mb-2"></div>
                <p className="text-small text-gray-600">primary-50</p>
                <p className="text-tiny text-gray-400">#F8F9FF</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-lg border border-gray-200 mx-auto mb-2"></div>
                <p className="text-small text-gray-600">primary-100</p>
                <p className="text-tiny text-gray-400">#E4E7FF</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-500 rounded-lg border border-gray-200 mx-auto mb-2"></div>
                <p className="text-small text-white">primary-500</p>
                <p className="text-tiny text-primary-100">#6366F1</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-600 rounded-lg border border-gray-200 mx-auto mb-2"></div>
                <p className="text-small text-white">primary-600</p>
                <p className="text-tiny text-primary-100">#5E6AD2</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-900 rounded-lg border border-gray-200 mx-auto mb-2"></div>
                <p className="text-small text-white">primary-900</p>
                <p className="text-tiny text-primary-100">#2D3142</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-lg border border-gray-200 mx-auto mb-2"></div>
                <p className="text-small text-gray-600">gray-50</p>
                <p className="text-tiny text-gray-400">#F9FAFB</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-lg border border-gray-200 mx-auto mb-2"></div>
                <p className="text-small text-gray-600">gray-200</p>
                <p className="text-tiny text-gray-400">#E5E7EB</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-500 rounded-lg border border-gray-200 mx-auto mb-2"></div>
                <p className="text-small text-white">gray-500</p>
                <p className="text-tiny text-gray-100">#6B7280</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-700 rounded-lg border border-gray-200 mx-auto mb-2"></div>
                <p className="text-small text-white">gray-700</p>
                <p className="text-tiny text-gray-100">#374151</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-900 rounded-lg border border-gray-200 mx-auto mb-2"></div>
                <p className="text-small text-white">gray-900</p>
                <p className="text-tiny text-gray-100">#111827</p>
              </div>
            </div>
          </div>
        </section>

        {/* Buttons Section */}
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Button Variants</h2>
            <p className="card-description">Different button styles for various use cases</p>
          </div>
          <div className="card-content">
            <div className="space-y-6">
              <div>
                <h4 className="text-h4 text-gray-700 mb-3">Button Variants</h4>
                <div className="flex flex-wrap gap-3">
                  <button className="btn-primary">Primary</button>
                  <button className="btn-secondary">Secondary</button>
                  <button className="btn-outline">Outline</button>
                  <button className="btn-ghost">Ghost</button>
                  <button className="btn-link">Link</button>
                  <button className="btn-destructive">Destructive</button>
                </div>
              </div>
              
              <div>
                <h4 className="text-h4 text-gray-700 mb-3">Button Sizes</h4>
                <div className="flex flex-wrap items-center gap-3">
                  <button className="btn-primary btn-sm">Small</button>
                  <button className="btn-primary btn-md">Medium</button>
                  <button className="btn-primary btn-lg">Large</button>
                  <button className="btn-primary btn-icon">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Form Components Section */}
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Form Components</h2>
            <p className="card-description">Consistent form styling and behavior</p>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Input
                  </label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Enter text..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Textarea
                  </label>
                  <textarea 
                    className="form-textarea" 
                    rows="3" 
                    placeholder="Enter description..."
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Dropdown
                  </label>
                  <select className="form-select">
                    <option>Select an option</option>
                    <option>Option 1</option>
                    <option>Option 2</option>
                    <option>Option 3</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Checkbox
                  </label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-base text-gray-700">Accept terms and conditions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Badges Section */}
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Badges & Status Indicators</h2>
            <p className="card-description">Visual indicators for different states and categories</p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div>
                <h4 className="text-h4 text-gray-700 mb-3">Status Badges</h4>
                <div className="flex flex-wrap gap-3">
                  <span className="badge-primary">Primary</span>
                  <span className="badge-secondary">Secondary</span>
                  <span className="badge-success">Success</span>
                  <span className="badge-warning">Warning</span>
                  <span className="badge-error">Error</span>
                  <span className="badge-info">Info</span>
                </div>
              </div>
              
              <div>
                <h4 className="text-h4 text-gray-700 mb-3">Custom Badges</h4>
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                    Featured
                  </span>
                  <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
                    Premium
                  </span>
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                    New
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Alerts Section */}
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Alert Messages</h2>
            <p className="card-description">Different types of alert notifications</p>
          </div>
          <div className="card-content space-y-4">
            <div className="alert alert-info">
              <div className="flex">
                <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p>This is an informational message with an icon.</p>
              </div>
            </div>
            
            <div className="alert alert-success">
              <div className="flex">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p>Operation completed successfully!</p>
              </div>
            </div>
            
            <div className="alert alert-warning">
              <div className="flex">
                <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p>Please review your input before proceeding.</p>
              </div>
            </div>
            
            <div className="alert alert-error">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p>An error occurred while processing your request.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Special Effects Section */}
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Special Effects & Animations</h2>
            <p className="card-description">Enhanced visual elements and interactions</p>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-h4 text-gray-700">Gradients</h4>
                <div className="space-y-3">
                  <div className="gradient-primary text-white p-4 rounded-lg text-center">
                    Primary Gradient
                  </div>
                  <div className="gradient-secondary text-white p-4 rounded-lg text-center">
                    Secondary Gradient
                  </div>
                  <div className="gradient-dark text-white p-4 rounded-lg text-center">
                    Dark Gradient
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-h4 text-gray-700">Text Effects</h4>
                <div className="space-y-3">
                  <h3 className="text-gradient-primary text-h3">Gradient Text</h3>
                  <p className="text-gradient-dark text-large">Dark gradient text</p>
                  <div className="glow-primary p-4 rounded-lg border border-primary-200">
                    Glowing element with hover effect
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Layout Examples Section */}
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Layout Examples</h2>
            <p className="card-description">Common layout patterns and grid systems</p>
          </div>
          <div className="card-content space-y-6">
            <div>
              <h4 className="text-h4 text-gray-700 mb-3">Responsive Grid</h4>
              <div className="grid-responsive">
                <div className="bg-gray-100 p-4 rounded-lg text-center">Column 1</div>
                <div className="bg-gray-100 p-4 rounded-lg text-center">Column 2</div>
                <div className="bg-gray-100 p-4 rounded-lg text-center">Column 3</div>
              </div>
            </div>
            
            <div>
              <h4 className="text-h4 text-gray-700 mb-3">Stack Layouts</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-small text-gray-600 mb-2">Vertical Stack</p>
                  <div className="stack-vertical">
                    <div className="bg-gray-100 p-3 rounded">Item 1</div>
                    <div className="bg-gray-100 p-3 rounded">Item 2</div>
                    <div className="bg-gray-100 p-3 rounded">Item 3</div>
                  </div>
                </div>
                <div>
                  <p className="text-small text-gray-600 mb-2">Horizontal Stack</p>
                  <div className="stack-horizontal">
                    <div className="bg-gray-100 p-3 rounded">Item 1</div>
                    <div className="bg-gray-100 p-3 rounded">Item 2</div>
                    <div className="bg-gray-100 p-3 rounded">Item 3</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8">
          <p className="text-base text-gray-600">
            This design system provides a solid foundation for building consistent, professional, and user-friendly interfaces.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default DesignSystemExample;
