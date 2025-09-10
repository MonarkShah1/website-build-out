import React, { useEffect, useState } from 'react';
import { useQuoteFormStore } from '../../stores/quoteFormStore';
import { validateStep } from '../../schemas/quoteFormSchema';
import { getTrackingData, installHubSpotTracking } from '../../utils/hubspot-tracking';
import StepIndicator from './StepIndicator';
import ContactInfoStep from './steps/ContactInfoStep';
import ProjectDetailsStep from './steps/ProjectDetailsStep';
import FileUploadStep from './steps/FileUploadStep';
import ReviewStep from './steps/ReviewStep';
import type { QuoteSubmissionResponse } from '../../types/quote';
import './QuoteForm.css';

const QuoteForm: React.FC = () => {
  const {
    currentStep,
    formData,
    isSubmitting,
    hasError,
    errorMessage,
    submissionId,
    setStep,
    nextStep,
    previousStep,
    setSubmitting,
    setError,
    setSubmissionId,
    resetForm,
    setStepValidation,
  } = useQuoteFormStore();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load saved progress on mount
    useQuoteFormStore.getState().loadSavedProgress();
    
    // Install HubSpot tracking if we have a portal ID
    const portalId = import.meta.env.PUBLIC_HUBSPOT_PORTAL_ID;
    if (portalId) {
      installHubSpotTracking(portalId);
    }
  }, []);

  const handleStepValidation = () => {
    const stepData = getStepData();
    const validation = validateStep(currentStep, stepData);
    setStepValidation(currentStep, validation.success);
    return validation;
  };

  const getStepData = () => {
    switch (currentStep) {
      case 1:
        return formData.contact;
      case 2:
        return formData.project;
      case 3:
        return formData.files;
      case 4:
        return formData.services;
      default:
        return {};
    }
  };

  const handleNext = () => {
    const validation = handleStepValidation();
    if (validation.success) {
      nextStep();
    } else {
      // Show validation errors
      setError(true, 'Please fix the errors before proceeding');
      setTimeout(() => setError(false), 3000);
    }
  };

  const handlePrevious = () => {
    previousStep();
  };

  const handleSubmit = async () => {
    // Validate all steps
    for (let step = 1; step <= 4; step++) {
      const stepData = step === 1 ? formData.contact :
                      step === 2 ? formData.project :
                      step === 3 ? formData.files :
                      formData.services;
      const validation = validateStep(step, stepData);
      if (!validation.success) {
        setStep(step);
        setError(true, `Please complete step ${step} correctly`);
        return;
      }
    }

    setSubmitting(true);
    setError(false);

    try {
      // Get file objects from the store
      const getAllFileObjects = useQuoteFormStore.getState().getAllFileObjects;
      const fileObjects = getAllFileObjects();
      
      // Get HubSpot tracking data
      const trackingData = getTrackingData();
      
      // Prepare form data - convert dates to ISO strings for JSON serialization
      const submitFormData = {
        ...formData,
        files: formData.files.map(file => ({
          ...file,
          uploadedAt: file.uploadedAt instanceof Date 
            ? file.uploadedAt.toISOString() 
            : file.uploadedAt
        })),
        tracking: trackingData // Include tracking data
      };

      // Create FormData object if we have files, otherwise use JSON
      let body: FormData | string;
      let headers: Record<string, string> = {};
      
      if (fileObjects.length > 0) {
        // Use FormData for file uploads
        const formDataObj = new FormData();
        
        // Add the JSON data
        formDataObj.append('data', JSON.stringify(submitFormData));
        
        // Add the actual files
        fileObjects.forEach((file, index) => {
          formDataObj.append(`file_${index}`, file, file.name);
        });
        
        body = formDataObj;
        // Don't set Content-Type for FormData - browser will set it with boundary
      } else {
        // Use JSON for submissions without files
        body = JSON.stringify(submitFormData);
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch('/api/submit-quote', {
        method: 'POST',
        body,
        headers,
      });

      const result: QuoteSubmissionResponse = await response.json();

      if (result.success && result.quoteId) {
        setSubmissionId(result.quoteId);
        // Clear form after successful submission
        setTimeout(() => {
          resetForm();
        }, 10000); // Reset after 10 seconds
      } else {
        setError(true, result.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setError(true, 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ContactInfoStep />;
      case 2:
        return <ProjectDetailsStep />;
      case 3:
        return <FileUploadStep />;
      case 4:
        return <ReviewStep onSubmit={handleSubmit} />;
      default:
        return null;
    }
  };

  if (!isClient) {
    return <div className="quote-form-loading">Loading...</div>;
  }

  if (submissionId) {
    return (
      <div className="quote-form-success">
        <div className="success-icon">✓</div>
        <h2>Thank You for Your Quote Request!</h2>
        <p>Your quote reference number is:</p>
        <div className="quote-id">{submissionId}</div>
        <p>We'll review your request and contact you within 24 hours.</p>
        <button 
          onClick={resetForm}
          className="btn btn-primary"
        >
          Submit Another Quote
        </button>
      </div>
    );
  }

  return (
    <div className="quote-form-container">
      <div className="quote-form-header">
        <h1>Get an Instant Quote</h1>
        <p>Complete the form below and we'll provide you with a custom quote</p>
      </div>

      <StepIndicator currentStep={currentStep} totalSteps={4} />

      {hasError && (
        <div className="error-message">
          {errorMessage || 'Please check your information and try again.'}
        </div>
      )}

      <div className="quote-form-content">
        {renderStep()}
      </div>

      <div className="quote-form-navigation">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={handlePrevious}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            Previous
          </button>
        )}
        
        {currentStep < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            Next Step
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="btn btn-primary btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quote Request'}
          </button>
        )}
      </div>

      {currentStep === 1 && (
        <div className="form-note">
          <p>Your information is secure and will never be shared with third parties.</p>
        </div>
      )}
    </div>
  );
};

export default QuoteForm;