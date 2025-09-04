import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  { number: 1, title: 'Contact Info' },
  { number: 2, title: 'Project Details' },
  { number: 3, title: 'Upload Files' },
  { number: 4, title: 'Review & Submit' },
];

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="step-indicator">
      <div className="step-indicator-progress">
        <div 
          className="step-indicator-progress-bar"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
      
      <div className="step-indicator-steps">
        {steps.map((step) => (
          <div
            key={step.number}
            className={`step-indicator-item ${
              currentStep === step.number ? 'active' : ''
            } ${currentStep > step.number ? 'completed' : ''}`}
          >
            <div className="step-indicator-number">
              {currentStep > step.number ? '✓' : step.number}
            </div>
            <div className="step-indicator-title">{step.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;