import React from 'react';

const ProgressBar = ({ currentStep }) => {
  const steps = [
    { number: 1, title: 'Business', description: 'Domain & AI Analysis' },
    { number: 2, title: 'Categories', description: 'Business Categories' },
    { number: 3, title: 'Competitors', description: 'Competitor Analysis' },
    { number: 4, title: 'Prompts', description: 'Search Prompts' }
  ];

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;

          return (
            <div key={step.number} className="flex flex-col items-center flex-1">
              {/* Step Circle */}
              <div className="relative">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-[#7765e3] border-[#7765e3] text-white'
                      : isCurrent
                      ? 'bg-[#7765e3]/10 border-[#7765e3] text-[#7765e3]'
                      : 'bg-white border-[#b0b0d8] text-[#4a4a6a]/50'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>

                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`absolute top-6 left-12 w-full h-0.5 transition-all duration-300 ${
                      isCompleted ? 'bg-[#7765e3]' : 'bg-[#b0b0d8]'
                    }`}
                    style={{ width: 'calc(100vw / 4 - 3rem)' }}
                  />
                )}
              </div>

              {/* Step Title */}
              <div className="mt-4 text-center">
                <h3
                  className={`text-sm font-medium transition-colors duration-300 ${
                    isCompleted || isCurrent
                      ? 'text-[#4a4a6a]'
                      : 'text-[#4a4a6a]/50'
                  }`}
                >
                  {step.title}
                </h3>
                <p
                  className={`text-xs mt-1 transition-colors duration-300 ${
                    isCompleted || isCurrent
                      ? 'text-[#4a4a6a]/70'
                      : 'text-[#4a4a6a]/40'
                  }`}
                >
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Text */}
      <div className="text-center mt-8">
        <p className="text-sm text-[#4a4a6a]">
          Step {currentStep} of {steps.length}
        </p>
      </div>
    </div>
  );
};

export default ProgressBar;
