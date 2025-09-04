import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema } from '../../../schemas/quoteFormSchema';
import { useQuoteFormStore } from '../../../stores/quoteFormStore';
import type { ContactFormData } from '../../../schemas/quoteFormSchema';

const ContactInfoStep: React.FC = () => {
  const { formData, updateContactData } = useQuoteFormStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: formData.contact,
    mode: 'onBlur',
  });

  // Auto-save on field change
  React.useEffect(() => {
    const subscription = watch((value) => {
      updateContactData(value as ContactFormData);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateContactData]);

  const onSubmit = (data: ContactFormData) => {
    updateContactData(data);
  };

  return (
    <div className="form-step contact-info-step">
      <h2>Contact Information</h2>
      <p>Let us know how to reach you about your quote.</p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="quote-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">
              First Name <span className="required">*</span>
            </label>
            <input
              {...register('firstName')}
              type="text"
              id="firstName"
              className={errors.firstName ? 'error' : ''}
              placeholder="John"
            />
            {errors.firstName && (
              <span className="error-message">{errors.firstName.message}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">
              Last Name <span className="required">*</span>
            </label>
            <input
              {...register('lastName')}
              type="text"
              id="lastName"
              className={errors.lastName ? 'error' : ''}
              placeholder="Doe"
            />
            {errors.lastName && (
              <span className="error-message">{errors.lastName.message}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">
              Email Address <span className="required">*</span>
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              className={errors.email ? 'error' : ''}
              placeholder="john@example.com"
            />
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">
              Phone Number <span className="required">*</span>
            </label>
            <input
              {...register('phone')}
              type="tel"
              id="phone"
              className={errors.phone ? 'error' : ''}
              placeholder="(416) 555-0123"
            />
            {errors.phone && (
              <span className="error-message">{errors.phone.message}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="company">
              Company Name <span className="required">*</span>
            </label>
            <input
              {...register('company')}
              type="text"
              id="company"
              className={errors.company ? 'error' : ''}
              placeholder="ACME Corporation"
            />
            {errors.company && (
              <span className="error-message">{errors.company.message}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="jobTitle">
              Job Title <span className="optional">(Optional)</span>
            </label>
            <input
              {...register('jobTitle')}
              type="text"
              id="jobTitle"
              className={errors.jobTitle ? 'error' : ''}
              placeholder="Engineering Manager"
            />
            {errors.jobTitle && (
              <span className="error-message">{errors.jobTitle.message}</span>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ContactInfoStep;