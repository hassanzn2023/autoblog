
import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ 
  currentStep, 
  totalSteps 
}) => {
  return (
    <div className="w-full flex items-center justify-between mb-6">
      <div className="w-full flex items-center">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <React.Fragment key={index}>
            <div 
              className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 
                ${index <= currentStep ? 
                  'border-[#F76D01] bg-[#F76D01] text-white' : 
                  'border-gray-300 bg-white text-gray-500'
                } z-10 transition-all duration-300`}
            >
              {index < currentStep ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span className="text-sm">{index + 1}</span>
              )}
            </div>
            
            {index < totalSteps - 1 && (
              <div 
                className={`flex-grow h-1 mx-1 
                  ${index < currentStep ? 'bg-[#F76D01]' : 'bg-gray-300'} 
                  transition-all duration-300`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
