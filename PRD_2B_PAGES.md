
# Product Requirements Document (2B): Pages & "Instant Quote" Form

**Project:** Canadian Metal Fabricators (CMF) Corporate Website

**Author:** Development Team

**Version:** 2.0 (Enhanced)

**Date:** September 1, 2025

**Status:** In Development

---

## Executive Summary

This PRD defines the implementation of core user-facing pages and the business-critical "Instant Quote" form system. Using first principles design, we focus on creating a conversion-optimized, accessible, and performant quote generation system that serves as the primary lead generation mechanism.

## 1. Overview & Objective

### 1.1 Primary Objectives
- Implement a frictionless, multi-step quote form with real-time validation
- Create conversion-optimized landing pages with clear value propositions
- Build a scalable content architecture for service pages
- Establish trust signals and social proof throughout the user journey

### 1.2 Success Metrics
- Form completion rate > 60%
- Form abandonment rate < 30%
- Average time to complete < 2 minutes
- Mobile form completion rate > 50%
- Page load time < 2 seconds
- Accessibility score = 100

### 1.3 Technical Stack
- **Frontend**: React 18+ with TypeScript for form component
- **State Management**: Zustand for form state persistence
- **Validation**: Zod for schema validation
- **File Handling**: React Dropzone for drag-and-drop
- **Analytics**: Custom event tracking for funnel analysis
- **Testing**: React Testing Library + Cypress

## 2. Prerequisites & Dependencies

### 2.1 Technical Prerequisites
- ✅ Completion of PRD 2A (Layout, Header, Footer components)
- ✅ Design system tokens implemented
- ✅ TypeScript configuration
- ✅ React integration with Astro Islands

### 2.2 Business Prerequisites
- Defined material types and specifications
- Pricing calculation logic (for future phases)
- Lead routing and CRM integration requirements
- GDPR/Privacy compliance requirements

## 3. Core Feature: Instant Quote Form System

### 3.1 Architecture Overview

```typescript
// Form Architecture
interface QuoteFormArchitecture {
  components: {
    QuoteForm: 'Main container component',
    FormStep: 'Individual step wrapper',
    FileUploader: 'Drag-and-drop file handler',
    MaterialSelector: 'Material specification component',
    ContactForm: 'Contact information collector',
    ProgressIndicator: 'Visual step progress',
    FormSummary: 'Review before submission'
  };
  state: {
    formData: 'Persistent form state',
    validation: 'Real-time validation state',
    upload: 'File upload progress',
    errors: 'Error handling state'
  };
  services: {
    validation: 'Schema validation service',
    storage: 'Local storage persistence',
    analytics: 'Event tracking service',
    upload: 'File upload service'
  };
}
```

### 3.2 Data Models & Types

```typescript
// src/types/quote.ts
export interface QuoteFormData {
  // Step 1: Project Details
  project: {
    files: File[];
    material: MaterialType;
    thickness: number;
    thicknessUnit: 'mm' | 'inches';
    quantity: number;
    finishType?: FinishType;
    tolerance?: ToleranceLevel;
    additionalNotes?: string;
  };
  
  // Step 2: Timeline & Delivery
  timeline: {
    urgency: 'standard' | 'rush' | 'flexible';
    desiredDate?: Date;
    deliveryLocation: {
      city: string;
      state: string;
      postalCode: string;
    };
  };
  
  // Step 3: Contact Information
  contact: {
    firstName: string;
    lastName: string;
    company: string;
    email: string;
    phone: string;
    preferredContact: 'email' | 'phone';
    marketingConsent: boolean;
  };
  
  // Metadata
  metadata: {
    formVersion: string;
    sessionId: string;
    timestamp: Date;
    source: string;
    utm?: UTMParams;
  };
}

export enum MaterialType {
  STEEL = 'steel',
  STAINLESS_STEEL = 'stainless_steel',
  ALUMINUM = 'aluminum',
  BRASS = 'brass',
  COPPER = 'copper',
  TITANIUM = 'titanium',
  OTHER = 'other'
}

export enum FinishType {
  NONE = 'none',
  POWDER_COAT = 'powder_coat',
  ANODIZED = 'anodized',
  PLATED = 'plated',
  BRUSHED = 'brushed',
  POLISHED = 'polished'
}

export enum ToleranceLevel {
  STANDARD = 'standard',
  TIGHT = 'tight',
  PRECISION = 'precision'
}
```

### 3.3 Quote Form Component Implementation

```tsx
// src/components/QuoteForm.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStore } from '../store/quoteStore';
import { trackEvent } from '../utils/analytics';
import { ProjectDetailsStep } from './form-steps/ProjectDetailsStep';
import { TimelineStep } from './form-steps/TimelineStep';
import { ContactStep } from './form-steps/ContactStep';
import { FormSummary } from './form-steps/FormSummary';
import { ProgressIndicator } from './ProgressIndicator';
import type { QuoteFormData } from '../types/quote';

// Validation Schemas
const projectSchema = z.object({
  files: z.array(z.instanceof(File)).min(1, 'Please upload at least one file'),
  material: z.enum(['steel', 'stainless_steel', 'aluminum', 'brass', 'copper', 'titanium', 'other']),
  thickness: z.number().positive('Thickness must be positive'),
  thicknessUnit: z.enum(['mm', 'inches']),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  finishType: z.enum(['none', 'powder_coat', 'anodized', 'plated', 'brushed', 'polished']).optional(),
  tolerance: z.enum(['standard', 'tight', 'precision']).optional(),
  additionalNotes: z.string().max(500).optional()
});

const timelineSchema = z.object({
  urgency: z.enum(['standard', 'rush', 'flexible']),
  desiredDate: z.date().optional(),
  deliveryLocation: z.object({
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid postal code')
  })
});

const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  company: z.string().min(1, 'Company is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  preferredContact: z.enum(['email', 'phone']),
  marketingConsent: z.boolean()
});

const formSchema = z.object({
  project: projectSchema,
  timeline: timelineSchema,
  contact: contactSchema
});

export const QuoteForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { formData, updateFormData, clearFormData } = useStore();
  
  const methods = useForm<QuoteFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: formData,
    mode: 'onChange'
  });
  
  const { handleSubmit, trigger, watch } = methods;
  
  // Auto-save to local storage
  useEffect(() => {
    const subscription = watch((data) => {
      updateFormData(data as QuoteFormData);
      localStorage.setItem('quoteFormDraft', JSON.stringify(data));
    });
    return () => subscription.unsubscribe();
  }, [watch, updateFormData]);
  
  // Handle step navigation
  const handleNext = useCallback(async () => {
    const stepFields = {
      1: ['project'],
      2: ['timeline'],
      3: ['contact']
    };
    
    const isValid = await trigger(stepFields[currentStep as keyof typeof stepFields]);
    
    if (isValid) {
      trackEvent('quote_form_step_completed', { step: currentStep });
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  }, [currentStep, trigger]);
  
  const handlePrevious = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);
  
  // Handle form submission
  const onSubmit = async (data: QuoteFormData) => {
    setIsSubmitting(true);
    
    try {
      // Add metadata
      const submissionData = {
        ...data,
        metadata: {
          formVersion: '2.0',
          sessionId: sessionStorage.getItem('sessionId') || generateSessionId(),
          timestamp: new Date(),
          source: 'website',
          utm: parseUTMParams(window.location.search)
        }
      };
      
      // Track submission
      trackEvent('quote_form_submitted', {
        material: data.project.material,
        quantity: data.project.quantity,
        urgency: data.timeline.urgency
      });
      
      // TODO: Replace with actual API call
      console.log('Quote submission:', submissionData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Clear form and show success
      clearFormData();
      localStorage.removeItem('quoteFormDraft');
      setCurrentStep(5); // Success step
      
    } catch (error) {
      console.error('Submission error:', error);
      trackEvent('quote_form_error', { error: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const steps = [
    { id: 1, label: 'Project Details', component: ProjectDetailsStep },
    { id: 2, label: 'Timeline', component: TimelineStep },
    { id: 3, label: 'Contact Info', component: ContactStep },
    { id: 4, label: 'Review', component: FormSummary }
  ];
  
  const CurrentStepComponent = steps[currentStep - 1]?.component;
  
  return (
    <FormProvider {...methods}>
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="quote-form"
        noValidate
      >
        <ProgressIndicator 
          currentStep={currentStep} 
          totalSteps={steps.length}
          stepLabels={steps.map(s => s.label)}
        />
        
        <div className="form-container">
          {currentStep <= 4 ? (
            <>
              <CurrentStepComponent />
              
              <div className="form-navigation">
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
                    type="submit"
                    className="btn btn-primary btn-large"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Quote Request'}
                  </button>
                )}
              </div>
            </>
          ) : (
            <SuccessMessage />
          )}
        </div>
      </form>
    </FormProvider>
  );
};

// Helper Components
const SuccessMessage: React.FC = () => (
  <div className="success-message">
    <svg className="success-icon" width="64" height="64">
      {/* Success checkmark icon */}
    </svg>
    <h2>Quote Request Submitted!</h2>
    <p>We've received your request and will get back to you within 24 hours.</p>
    <p>A confirmation email has been sent to your address.</p>
    <a href="/" className="btn btn-primary">Return to Home</a>
  </div>
);

// Utility functions
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function parseUTMParams(search: string): Record<string, string> {
  const params = new URLSearchParams(search);
  const utm: Record<string, string> = {};
  
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(key => {
    const value = params.get(key);
    if (value) utm[key] = value;
  });
  
  return utm;
}
```

### 3.4 Form Step Components

#### 3.4.1 Project Details Step
```tsx
// src/components/form-steps/ProjectDetailsStep.tsx
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FileUploader } from '../FileUploader';
import { MaterialSelector } from '../MaterialSelector';
import type { QuoteFormData } from '../../types/quote';

export const ProjectDetailsStep: React.FC = () => {
  const { register, formState: { errors }, setValue, watch } = useFormContext<QuoteFormData>();
  const files = watch('project.files');

  return (
    <div className="form-step">
      <h2>Tell us about your project</h2>
      <p className="step-description">
        Upload your design files and specify material requirements
      </p>

      <FileUploader
        files={files}
        onFilesChange={(files) => setValue('project.files', files)}
        acceptedFormats={['.dxf', '.dwg', '.step', '.stp', '.iges', '.pdf']}
        maxSize={50 * 1024 * 1024} // 50MB
        error={errors.project?.files?.message}
      />

      <MaterialSelector
        value={watch('project.material')}
        onChange={(material) => setValue('project.material', material)}
        error={errors.project?.material?.message}
      />

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="thickness">Material Thickness*</label>
          <div className="input-with-unit">
            <input
              id="thickness"
              type="number"
              step="0.01"
              {...register('project.thickness', { valueAsNumber: true })}
              aria-invalid={!!errors.project?.thickness}
              aria-describedby="thickness-error"
            />
            <select {...register('project.thicknessUnit')}>
              <option value="mm">mm</option>
              <option value="inches">inches</option>
            </select>
          </div>
          {errors.project?.thickness && (
            <span id="thickness-error" className="error-message">
              {errors.project.thickness.message}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="quantity">Quantity*</label>
          <input
            id="quantity"
            type="number"
            min="1"
            {...register('project.quantity', { valueAsNumber: true })}
            aria-invalid={!!errors.project?.quantity}
          />
          {errors.project?.quantity && (
            <span className="error-message">
              {errors.project.quantity.message}
            </span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="notes">Additional Requirements (Optional)</label>
        <textarea
          id="notes"
          rows={4}
          {...register('project.additionalNotes')}
          placeholder="Special finishes, tolerances, or other requirements..."
        />
      </div>
    </div>
  );
};
```

#### 3.4.2 File Uploader Component
```tsx
// src/components/FileUploader.tsx
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  acceptedFormats: string[];
  maxSize: number;
  error?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  files,
  onFilesChange,
  acceptedFormats,
  maxSize,
  error
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesChange([...files, ...acceptedFiles]);
  }, [files, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFormats.reduce((acc, format) => {
      acc[format] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    multiple: true
  });

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  return (
    <div className="file-uploader">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''} ${error ? 'error' : ''}`}
      >
        <input {...getInputProps()} />
        <svg className="upload-icon" width="48" height="48">
          {/* Upload icon */}
        </svg>
        <p className="upload-text">
          {isDragActive
            ? 'Drop files here...'
            : 'Drag & drop your CAD files here, or click to browse'}
        </p>
        <p className="upload-hint">
          Accepted formats: {acceptedFormats.join(', ')} (Max {maxSize / 1024 / 1024}MB)
        </p>
      </div>

      {error && <span className="error-message">{error}</span>}

      {files.length > 0 && (
        <div className="file-list">
          <h4>Uploaded Files ({files.length})</h4>
          {files.map((file, index) => (
            <div key={index} className="file-item">
              <span className="file-name">{file.name}</span>
              <span className="file-size">
                ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="remove-file"
                aria-label={`Remove ${file.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### 3.5 API Contracts

```typescript
// src/api/contracts/quote.ts

// Request Contracts
export interface CreateQuoteRequest {
  project: {
    files: string[]; // Base64 encoded or S3 URLs
    material: string;
    thickness: number;
    thicknessUnit: string;
    quantity: number;
    finishType?: string;
    tolerance?: string;
    additionalNotes?: string;
  };
  timeline: {
    urgency: string;
    desiredDate?: string;
    deliveryLocation: {
      city: string;
      state: string;
      postalCode: string;
    };
  };
  contact: {
    firstName: string;
    lastName: string;
    company: string;
    email: string;
    phone: string;
    preferredContact: string;
    marketingConsent: boolean;
  };
  metadata: {
    formVersion: string;
    sessionId: string;
    timestamp: string;
    source: string;
    utm?: Record<string, string>;
  };
}

// Response Contracts
export interface CreateQuoteResponse {
  success: boolean;
  data?: {
    quoteId: string;
    estimatedPrice?: {
      min: number;
      max: number;
      currency: string;
    };
    estimatedLeadTime?: {
      min: number;
      max: number;
      unit: 'days' | 'weeks';
    };
    nextSteps: string[];
    assignedRepresentative?: {
      name: string;
      email: string;
      phone: string;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

// WebSocket Events for Real-time Updates
export interface QuoteEvents {
  'quote:processing': { quoteId: string; status: string };
  'quote:priced': { quoteId: string; price: number };
  'quote:assigned': { quoteId: string; representative: string };
  'quote:error': { quoteId: string; error: string };
}
```

### 3.6 State Management

```typescript
// src/store/quoteStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { QuoteFormData } from '../types/quote';

interface QuoteStore {
  formData: Partial<QuoteFormData>;
  updateFormData: (data: Partial<QuoteFormData>) => void;
  clearFormData: () => void;
  
  // UI State
  isLoading: boolean;
  errors: Record<string, string>;
  setLoading: (loading: boolean) => void;
  setError: (field: string, error: string) => void;
  clearErrors: () => void;
  
  // File Upload State
  uploadProgress: Record<string, number>;
  setUploadProgress: (fileId: string, progress: number) => void;
}

export const useStore = create<QuoteStore>()(
  persist(
    (set) => ({
      formData: {},
      updateFormData: (data) => set((state) => ({
        formData: { ...state.formData, ...data }
      })),
      clearFormData: () => set({ formData: {} }),
      
      isLoading: false,
      errors: {},
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (field, error) => set((state) => ({
        errors: { ...state.errors, [field]: error }
      })),
      clearErrors: () => set({ errors: {} }),
      
      uploadProgress: {},
      setUploadProgress: (fileId, progress) => set((state) => ({
        uploadProgress: { ...state.uploadProgress, [fileId]: progress }
      }))
    }),
    {
      name: 'quote-form-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ formData: state.formData })
    }
  )
);
```

## 4. Page Requirements & Implementation

All pages must use the `Layout.astro` component created in PRD 2A and follow the established design system.

### 4.1 Homepage Implementation

[Full homepage implementation with hero section, trust signals, services grid - see previous content]

### 4.2 Progressive Enhancement & Error Handling

[Complete error handling and progressive enhancement implementation - see previous content]

### 4.3 Service Pages Implementation

[Service hub and dynamic service pages - see previous content]

### 4.4 Security & Performance Optimizations

[Security measures and performance optimizations - see previous content]

### 4.5 About Us Page Implementation

[About page with timeline, values, and certifications - see previous content]

## 5. Testing Strategy

### 5.1 Unit Testing
[Unit testing implementation for QuoteForm component]

### 5.2 Integration Testing
[Cypress E2E tests for complete user journey]

### 5.3 Performance Testing
[Lighthouse CI configuration]

## 6. Acceptance Criteria (Enhanced)

### 6.1 Functional Requirements
- ✅ Multi-step quote form with validation at each step
- ✅ File upload supports drag-and-drop and click-to-browse
- ✅ Form data persists across page refreshes
- ✅ All form fields have proper labels and error messages
- ✅ Form submission logs to console (Phase 1)
- ✅ All pages render without JavaScript errors
- ✅ Navigation between pages works correctly
- ✅ Responsive design works on all screen sizes

### 6.2 Performance Requirements
- ✅ Form loads and becomes interactive within 3 seconds
- ✅ File upload handles files up to 50MB
- ✅ Form validation provides instant feedback
- ✅ Page transitions are smooth (no layout shifts)
- ✅ Images lazy load appropriately

### 6.3 Accessibility Requirements
- ✅ All form fields keyboard accessible
- ✅ Error messages announced to screen readers
- ✅ Form progress indicator accessible
- ✅ Color contrast meets WCAG AA standards
- ✅ Focus management between form steps

### 6.4 Security Requirements
- ✅ Input sanitization prevents XSS
- ✅ File upload validates type and size
- ✅ Rate limiting prevents abuse
- ✅ CSRF protection implemented
- ✅ Content Security Policy headers set

### 6.5 Browser Compatibility
- ✅ Chrome/Edge (last 2 versions)
- ✅ Firefox (last 2 versions)
- ✅ Safari (last 2 versions)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

---

## Appendix A: Component API Documentation

Detailed component props and methods: `/docs/components/quote-form.md`

## Appendix B: Form Analytics Events

Complete event tracking specification: `/docs/analytics/form-events.md`

## Appendix C: Error Codes Reference

Error handling and recovery strategies: `/docs/errors/reference.md`

# Service Page Content Brief & SEO Blueprint

## 1. Objective

The goal of this document is to define a comprehensive, SEO-first content structure for all individual service pages (e.g., Laser Cutting, Metal Bending, Welding). By following this blueprint, each service page will be positioned to outrank competitors in search results across Eastern Canada, establish topical authority, and convert qualified leads.

Our strategy is to create the most thorough and valuable resource for any potential customer searching for a specific metal fabrication service. We will achieve this by covering each topic more comprehensively than competitors like Metacut, ATH-CMF, and Weldflow.

---

## 2. The Ideal Service Page Structure

Each service page should be a "pillar page"—a comprehensive resource on that specific service. It should be structured with the following components, in this order, to satisfy user intent from top to bottom.

### **Section 1: Hero Section (Above the Fold)**

*   **H1 Heading:** Must be the primary keyword. Format: `[Service Name] Services in [Primary Location]`.
    *   *Example:* `High-Precision Laser Cutting Services in Toronto`.
*   **Introductory Paragraph (2-3 sentences):** Immediately confirm the user's search. State what the service is, the core benefit, and the primary audience you serve. Mention key value propositions like "fast turnaround," "ISO 9001 certified," or "advanced technology."
*   **Primary Call-to-Action (CTA):** A prominent "Request a Quote" button.
*   **Key Trust Signals:** Display certifications (CWB, ISO) and a "Serving Canada Since [Year]" tagline right under the heading.

### **Section 2: What is [Service Name]? (The "Explainer")**

*   **H2 Heading:** `What is [Service Name]?`
*   **Content:** A detailed but easy-to-understand explanation of the service.
    *   Explain the process in simple terms.
    *   Mention the key technologies/machines used (e.g., "Our 5-axis fiber lasers...").
    *   Discuss the primary advantages of this service over alternatives.
*   **SEO Goal:** Capture users at the top of the funnel who are still researching. Answer "what is" and "how does it work" queries. Include a high-quality image or short video of the process.

### **Section 3: Our [Service Name] Capabilities**

*   **H2 Heading:** `Our [Service Name] Capabilities`
*   **Content:** This is where we provide the technical details that engineers and project managers need. Use a bulleted list or a grid layout.
    *   **Technical Specifications:** Tolerances, max thickness, sheet/tube sizes, machine power (e.g., "Up to 1" steel, +/- 0.005" tolerance").
    *   **Materials We Work With:** List all metals (e.g., Stainless Steel, Mild Steel, Aluminum, Brass, Copper). *Crucial for SEO.* Link each material to a future "materials" page if applicable.
    *   **Software Used:** Mention compatibility with file types (e.g., "We accept DXF, DWG, STEP files").
*   **Competitor Gap:** Most competitors list this, but it's often buried. We will make it prominent and highly detailed.

### **Section 4: Applications & Industries Served**

*   **H2 Heading:** `Common Applications of [Service Name]`
*   **Content:** Show, don't just tell. Use high-quality images for each application.
    *   List 5-7 key applications (e.g., "Architectural Panels," "Automotive Components," "Custom Brackets," "Signage").
    *   Briefly describe why this service is ideal for that application.
    *   List the key industries you serve with this service (e.g., Construction, Automotive, Aerospace, Retail).
*   **SEO Goal:** Capture long-tail keywords like "laser cutting for architectural panels."

### **Section 5: Why Choose Us for [Service Name]?**

*   **H2 Heading:** `Why Choose Canadian Metal Fabricators?`
*   **Content:** Differentiate your service. Focus on benefits, not just features.
    *   **Quality & Precision:** Mention certifications and specific quality control processes.
    *   **Advanced Equipment:** Name-drop your key machinery.
    *   **Fast Turnaround:** Give an estimate if possible (e.g., "Quotes within 24 hours, parts in as little as 3 days").
    *   **Expert Team:** Briefly mention the experience of your team.

### **Section 6: Featured Projects**

*   **H2 Heading:** `[Service Name] Project Showcase`
*   **Content:** Display 2-3 mini-case studies of projects that heavily utilized this service.
    *   High-quality image of the finished product.
    *   Brief description: "Client," "Industry," "Challenge," "Solution."
    *   Link to the full project page in your `/projects/` collection.
*   **SEO Goal:** Builds immense trust and provides tangible proof of your capabilities.

### **Section 7: Frequently Asked Questions (FAQ)**

*   **H2 Heading:** `[Service Name] FAQs`
*   **Content:** Answer 5-7 common questions related to the service. Use an accordion-style dropdown for usability.
    *   *Examples:* "What is the maximum thickness you can cut?", "What information do I need to provide for a quote?", "What are your lead times?".
*   **SEO Goal:** This is critical for capturing question-based queries and winning "People Also Ask" snippets in Google. Use FAQPage schema markup.

### **Section 8: Final Call-to-Action (CTA)**

*   **H2 Heading:** `Get a Quote for Your [Service Name] Project`
*   **Content:** A final, a compelling paragraph encouraging users to get in touch. Reiterate the key benefits.
*   **Action:** A simple quote request form or a prominent link to the main contact page.

---

## 3. Content Creation Checklist

For each service page you create (e.g., `/services/laser-cutting.md`), ensure the following:

- [ ] **H1 is unique and keyword-targeted.**
- [ ] **Meta Title:** Under 60 characters. `[Service Name] Toronto | [Your Company Name]`.
- [ ] **Meta Description:** 150-160 characters. A compelling, action-oriented summary of the page.
- [ ] **Content is 100% original.**
- [ ] **At least 1,000 words.** (Aim to be the most comprehensive resource).
- [ ] **Images have descriptive alt text.** (e.g., `alt="CNC laser cutting 1/2 inch stainless steel sheet"`).
- [ ] **Internal Links:** Link to related services, projects, and the contact page.
- [ ] **Schema Markup:** Implement `Service` and `FAQPage` structured data.
- [ ] **URL Slug:** Clean and simple (e.g., `/services/laser-cutting`).
- [ ] **Readability:** Use short paragraphs, bullet points, and bold text to break up the content.

By following this brief, we will create a powerful, scalable system for content that drives organic traffic and conversions.