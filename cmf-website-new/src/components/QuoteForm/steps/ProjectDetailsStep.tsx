import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema } from '../../../schemas/quoteFormSchema';
import { useQuoteFormStore } from '../../../stores/quoteFormStore';
import type { ProjectFormData } from '../../../schemas/quoteFormSchema';

const ProjectDetailsStep: React.FC = () => {
  const { formData, updateProjectData } = useQuoteFormStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: formData.project,
    mode: 'onBlur',
  });

  // Auto-save on field change
  React.useEffect(() => {
    const subscription = watch((value) => {
      updateProjectData(value as ProjectFormData);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateProjectData]);

  const onSubmit = (data: ProjectFormData) => {
    updateProjectData(data);
  };

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="form-step project-details-step">
      <h2>Project Details</h2>
      <p>Tell us about your project requirements.</p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="quote-form">
        <div className="form-group">
          <label htmlFor="projectName">
            Project Name <span className="required">*</span>
          </label>
          <input
            {...register('projectName')}
            type="text"
            id="projectName"
            className={errors.projectName ? 'error' : ''}
            placeholder="e.g., Custom Enclosure Prototype"
          />
          {errors.projectName && (
            <span className="error-message">{errors.projectName.message}</span>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="projectType">
              Project Type <span className="required">*</span>
            </label>
            <select
              {...register('projectType')}
              id="projectType"
              className={errors.projectType ? 'error' : ''}
            >
              <option value="">Select a project type</option>
              <option value="prototype">Prototype</option>
              <option value="small-batch">Small Batch (1-100 units)</option>
              <option value="large-production">Large Production (100+ units)</option>
              <option value="custom-fabrication">Custom Fabrication</option>
              <option value="repair-modification">Repair/Modification</option>
              <option value="other">Other</option>
            </select>
            {errors.projectType && (
              <span className="error-message">{errors.projectType.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="material">
              Material Type <span className="required">*</span>
            </label>
            <select
              {...register('material')}
              id="material"
              className={errors.material ? 'error' : ''}
            >
              <option value="">Select a material</option>
              <option value="steel">Steel</option>
              <option value="stainless-steel">Stainless Steel</option>
              <option value="aluminum">Aluminum</option>
              <option value="copper">Copper</option>
              <option value="brass">Brass</option>
              <option value="titanium">Titanium</option>
              <option value="other">Other</option>
            </select>
            {errors.material && (
              <span className="error-message">{errors.material.message}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="thickness">
              Material Thickness (mm) <span className="optional">(Optional)</span>
            </label>
            <input
              {...register('thickness')}
              type="text"
              id="thickness"
              className={errors.thickness ? 'error' : ''}
              placeholder="e.g., 3.5"
            />
            {errors.thickness && (
              <span className="error-message">{errors.thickness.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="quantity">
              Quantity <span className="required">*</span>
            </label>
            <input
              {...register('quantity', { valueAsNumber: true })}
              type="number"
              id="quantity"
              min="1"
              className={errors.quantity ? 'error' : ''}
              placeholder="1"
            />
            {errors.quantity && (
              <span className="error-message">{errors.quantity.message}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="requiredDate">
              Required By Date <span className="required">*</span>
            </label>
            <input
              {...register('requiredDate')}
              type="date"
              id="requiredDate"
              min={today}
              className={errors.requiredDate ? 'error' : ''}
            />
            {errors.requiredDate && (
              <span className="error-message">{errors.requiredDate.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="budget">
              Budget Range <span className="optional">(Optional)</span>
            </label>
            <select
              {...register('budget')}
              id="budget"
              className={errors.budget ? 'error' : ''}
            >
              <option value="">Select budget range</option>
              <option value="under-1k">Under $1,000</option>
              <option value="1k-5k">$1,000 - $5,000</option>
              <option value="5k-10k">$5,000 - $10,000</option>
              <option value="10k-25k">$10,000 - $25,000</option>
              <option value="25k-50k">$25,000 - $50,000</option>
              <option value="50k-100k">$50,000 - $100,000</option>
              <option value="over-100k">Over $100,000</option>
            </select>
            {errors.budget && (
              <span className="error-message">{errors.budget.message}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">
            Project Description <span className="required">*</span>
          </label>
          <textarea
            {...register('description')}
            id="description"
            rows={4}
            className={errors.description ? 'error' : ''}
            placeholder="Please describe your project requirements, including any specific features, dimensions, or special requirements..."
          />
          {errors.description && (
            <span className="error-message">{errors.description.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="specifications">
            Technical Specifications <span className="optional">(Optional)</span>
          </label>
          <textarea
            {...register('specifications')}
            id="specifications"
            rows={3}
            className={errors.specifications ? 'error' : ''}
            placeholder="Include any technical specifications, tolerances, surface finishes, or compliance requirements..."
          />
          {errors.specifications && (
            <span className="error-message">{errors.specifications.message}</span>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProjectDetailsStep;