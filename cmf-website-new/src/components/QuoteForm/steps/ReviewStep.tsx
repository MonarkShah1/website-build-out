import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { servicesSchema } from '../../../schemas/quoteFormSchema';
import { useQuoteFormStore } from '../../../stores/quoteFormStore';
import type { ServicesFormData } from '../../../schemas/quoteFormSchema';

interface ReviewStepProps {
  onSubmit: () => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ onSubmit }) => {
  const { formData, updateServicesData } = useQuoteFormStore();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ServicesFormData>({
    resolver: zodResolver(servicesSchema),
    defaultValues: formData.services,
  });

  // Auto-save on field change
  React.useEffect(() => {
    const subscription = watch((value) => {
      updateServicesData(value as ServicesFormData);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateServicesData]);

  const handleFormSubmit = (data: ServicesFormData) => {
    updateServicesData(data);
    if (agreedToTerms) {
      onSubmit();
    }
  };

  const formatBudget = (budget?: string): string => {
    const budgetMap: Record<string, string> = {
      'under-1k': 'Under $1,000',
      '1k-5k': '$1,000 - $5,000',
      '5k-10k': '$5,000 - $10,000',
      '10k-25k': '$10,000 - $25,000',
      '25k-50k': '$25,000 - $50,000',
      '50k-100k': '$50,000 - $100,000',
      'over-100k': 'Over $100,000',
    };
    return budget ? budgetMap[budget] || 'Not specified' : 'Not specified';
  };

  return (
    <div className="form-step review-step">
      <h2>Review & Submit</h2>
      <p>Please review your information and select the services you need.</p>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="quote-form">
        <div className="services-section">
          <h3>Required Services</h3>
          <p className="section-description">Select all services you need for this project:</p>
          
          <div className="services-grid">
            <label className="service-item">
              <input
                {...register('laserCutting')}
                type="checkbox"
              />
              <span className="service-label">
                <span className="service-icon">⚡</span>
                Laser Cutting
              </span>
            </label>

            <label className="service-item">
              <input
                {...register('metalBending')}
                type="checkbox"
              />
              <span className="service-label">
                <span className="service-icon">📐</span>
                Metal Bending
              </span>
            </label>

            <label className="service-item">
              <input
                {...register('welding')}
                type="checkbox"
              />
              <span className="service-label">
                <span className="service-icon">🔥</span>
                Welding
              </span>
            </label>

            <label className="service-item">
              <input
                {...register('assembly')}
                type="checkbox"
              />
              <span className="service-label">
                <span className="service-icon">🔧</span>
                Assembly
              </span>
            </label>

            <label className="service-item">
              <input
                {...register('finishing')}
                type="checkbox"
              />
              <span className="service-label">
                <span className="service-icon">✨</span>
                Finishing
              </span>
            </label>

            <label className="service-item">
              <input
                {...register('design')}
                type="checkbox"
              />
              <span className="service-label">
                <span className="service-icon">📊</span>
                Design Services
              </span>
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="other">
              Other Services <span className="optional">(Please specify)</span>
            </label>
            <input
              {...register('other')}
              type="text"
              id="other"
              placeholder="Any other services you need..."
              className={errors.other ? 'error' : ''}
            />
            {errors.other && (
              <span className="error-message">{errors.other.message}</span>
            )}
          </div>

          {errors && Object.keys(errors).length > 0 && !Object.keys(errors).some(k => k === 'other') && (
            <div className="error-message">Please select at least one service</div>
          )}
        </div>

        <div className="review-section">
          <h3>Quote Summary</h3>
          
          <div className="summary-grid">
            <div className="summary-section">
              <h4>Contact Information</h4>
              <dl>
                <dt>Name:</dt>
                <dd>{formData.contact.firstName} {formData.contact.lastName}</dd>
                <dt>Email:</dt>
                <dd>{formData.contact.email}</dd>
                <dt>Phone:</dt>
                <dd>{formData.contact.phone}</dd>
                <dt>Company:</dt>
                <dd>{formData.contact.company}</dd>
                {formData.contact.jobTitle && (
                  <>
                    <dt>Job Title:</dt>
                    <dd>{formData.contact.jobTitle}</dd>
                  </>
                )}
              </dl>
            </div>

            <div className="summary-section">
              <h4>Project Details</h4>
              <dl>
                <dt>Project Name:</dt>
                <dd>{formData.project.projectName}</dd>
                <dt>Type:</dt>
                <dd>{formData.project.projectType}</dd>
                <dt>Material:</dt>
                <dd>{formData.project.material}</dd>
                {formData.project.thickness && (
                  <>
                    <dt>Thickness:</dt>
                    <dd>{formData.project.thickness} mm</dd>
                  </>
                )}
                <dt>Quantity:</dt>
                <dd>{formData.project.quantity}</dd>
                <dt>Required By:</dt>
                <dd>{new Date(formData.project.requiredDate).toLocaleDateString()}</dd>
                <dt>Budget:</dt>
                <dd>{formatBudget(formData.project.budget)}</dd>
              </dl>
            </div>
          </div>

          {formData.project.description && (
            <div className="summary-description">
              <h4>Description</h4>
              <p>{formData.project.description}</p>
            </div>
          )}

          {formData.files.length > 0 && (
            <div className="summary-files">
              <h4>Uploaded Files</h4>
              <p>{formData.files.length} file(s) attached</p>
            </div>
          )}
        </div>

        <div className="terms-section">
          <label className="terms-checkbox">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              required
            />
            <span>
              I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a> and 
              <a href="/privacy" target="_blank" rel="noopener noreferrer"> Privacy Policy</a>. 
              I understand that Canadian Metal Fabricators will contact me regarding this quote request.
            </span>
          </label>
          {!agreedToTerms && (
            <p className="terms-error">Please accept the terms to submit your quote request.</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default ReviewStep;