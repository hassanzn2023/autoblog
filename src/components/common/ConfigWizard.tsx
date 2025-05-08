
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface Step {
  id: string;
  title: string;
  component: React.ReactNode;
  visibleFor: 'all' | 'blog' | 'autoblog';
}

interface ConfigWizardProps {
  title: string;
  configType: 'blog' | 'autoblog';
  name: string;
  steps: Step[];
}

const ConfigWizard: React.FC<ConfigWizardProps> = ({
  title,
  configType,
  name,
  steps,
}) => {
  const [activeStep, setActiveStep] = useState<string>(steps[0].id);

  // Filter steps based on the configuration type
  const visibleSteps = steps.filter(step => 
    step.visibleFor === 'all' || step.visibleFor === configType
  );

  // Find the active step index
  const activeStepIndex = visibleSteps.findIndex(step => step.id === activeStep);
  const activeStepData = visibleSteps.find(step => step.id === activeStep);

  const handleNext = () => {
    if (activeStepIndex < visibleSteps.length - 1) {
      setActiveStep(visibleSteps[activeStepIndex + 1].id);
    }
  };

  const handleBack = () => {
    if (activeStepIndex > 0) {
      setActiveStep(visibleSteps[activeStepIndex - 1].id);
    }
  };

  const handleStepClick = (stepId: string) => {
    setActiveStep(stepId);
  };

  const handleSave = () => {
    // Here would be logic to save the configuration
    alert('Configuration saved!');
    // Redirect back to the appropriate listing page
    window.location.href = configType === 'blog' ? '/blog/create' : '/autoblog/create';
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">{title}: {name}</h1>
      
      <div className="flex gap-6">
        {/* Steps Navigation */}
        <div className="w-1/4 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="space-y-1 p-2">
            {visibleSteps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleStepClick(step.id)}
                className={`w-full text-left px-4 py-3 rounded-md text-sm transition-colors ${
                  step.id === activeStep
                    ? 'bg-[#f0e9ff] text-[#6e41e2] border-l-4 border-[#6e41e2]'
                    : 'hover:bg-gray-100'
                }`}
              >
                Step {index + 1}: {step.title}
              </button>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="w-3/4 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Step {activeStepIndex + 1}: {activeStepData?.title}</h2>
          
          <div className="min-h-[300px] mb-4">
            {activeStepData?.component}
          </div>
          
          <div className="flex justify-between pt-4 border-t border-gray-200">
            {activeStepIndex > 0 ? (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            ) : (
              <div />
            )}
            
            {activeStepIndex < visibleSteps.length - 1 ? (
              <Button
                className="bg-[#6e41e2] hover:bg-[#5a35c8] text-white"
                onClick={handleNext}
              >
                Next
              </Button>
            ) : (
              <Button
                className="bg-[#6e41e2] hover:bg-[#5a35c8] text-white"
                onClick={handleSave}
              >
                Save {configType === 'blog' ? 'Project' : 'Campaign'} Configuration
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigWizard;
