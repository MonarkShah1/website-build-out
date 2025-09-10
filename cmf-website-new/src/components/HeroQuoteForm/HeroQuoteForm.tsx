import React, { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDropzone } from 'react-dropzone';
import { readClipboard, isClipboardSupported, pasteIntoTextarea } from '../../utils/clipboardUtils';
import { getTrackingData } from '../../utils/hubspot-tracking';
import './HeroQuoteForm.css';

// Simplified schema for hero form
const heroQuoteSchema = z.object({
  projectDetails: z.string().min(10, 'Please provide more details about your project'),
  contactName: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  company: z.string().optional(),
});

type HeroQuoteFormData = z.infer<typeof heroQuoteSchema>;

interface HeroQuoteFormProps {
  onSubmit?: (data: HeroQuoteFormData) => void;
  className?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  url: string;
}

const HeroQuoteForm: React.FC<HeroQuoteFormProps> = ({ onSubmit, className = '' }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [componentError, setComponentError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Error boundary
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('❌ Component error caught:', event.error);
      setComponentError(event.error?.message || 'Unknown error');
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  const form = useForm<HeroQuoteFormData>({
    resolver: zodResolver(heroQuoteSchema),
    mode: 'onBlur',
    defaultValues: {
      projectDetails: '',
      contactName: '',
      email: '',
      phone: '',
      company: ''
    }
  });
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = form;
  
  // Component mounted logging
  React.useEffect(() => {
    console.log('🏁 HeroQuoteForm component mounted and ready!');
  }, []);

  // Watch project details to show character count
  const projectDetails = watch('projectDetails', '');

  const handlePasteClick = async () => {
    if (textareaRef.current) {
      const success = await pasteIntoTextarea(textareaRef.current, true);
      if (success) {
        setPasteSuccess(true);
        // Update form state and trigger validation
        setValue('projectDetails', textareaRef.current.value, { 
          shouldDirty: true, 
          shouldTouch: true, 
          shouldValidate: true 
        });
        setTimeout(() => setPasteSuccess(false), 2000);
      } else {
        // Fallback: focus textarea for manual paste
        textareaRef.current.focus();
      }
    }
  };

  // File upload handlers
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('📁 Files dropped:', acceptedFiles.length);
    try {
      const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        file,
        url: URL.createObjectURL(file),
      }));
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
      console.log('✅ Files processed successfully');
    } catch (error) {
      console.error('❌ File processing error:', error);
    }
  }, []);

  const dropzoneConfig = {
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    noClick: false,
    noKeyboard: false
  };
  
  let getRootProps: any = () => ({});
  let getInputProps: any = () => ({});
  let isDragActive = false;
  
  try {
    const dropzone = useDropzone(dropzoneConfig);
    getRootProps = dropzone.getRootProps;
    getInputProps = dropzone.getInputProps;
    isDragActive = dropzone.isDragActive;
  } catch (error) {
    console.warn('⚠️ Dropzone initialization failed:', error);
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const handleFormSubmit = async (data: HeroQuoteFormData) => {
    console.log('🚀 Form submission started', data);
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      console.log('✅ Form data validation passed');
      console.log('📁 Uploaded files count:', uploadedFiles.length);
      // Get tracking data
      console.log('🔍 Getting tracking data...');
      const trackingData = getTrackingData();
      console.log('📊 Tracking data retrieved:', trackingData);
      
      // Prepare file data for submission
      const fileData = uploadedFiles.map(file => ({
        id: file.id,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        status: 'success' as const, // Use 'success' instead of 'uploaded'
      }));
      
      // Prepare submission data
      const nameParts = data.contactName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Unknown';
      
      // Format phone number to match validation pattern
      const formatPhone = (phone: string) => {
        if (!phone) return '416-555-0000'; // Default Toronto number
        // Remove all non-digits
        const digits = phone.replace(/\D/g, '');
        // Format as XXX-XXX-XXXX
        if (digits.length >= 10) {
          return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
        }
        return '416-555-0000'; // Fallback if invalid
      };
      
      const submissionData = {
        contact: {
          firstName: firstName,
          lastName: lastName,
          email: data.email,
          phone: formatPhone(data.phone || ''),
          company: data.company || 'Individual',
        },
        project: {
          projectName: 'Hero Form Quote Request',
          description: data.projectDetails,
          projectType: 'custom-fabrication',
          material: 'steel', // default
          quantity: 1, // default
          requiredDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 45 days from now
        },
        services: {
          laserCutting: true,
          metalBending: false,
          welding: false,
          assembly: false,
          finishing: false,
          design: false,
          other: '',
        },
        files: fileData,
        metadata: {
          source: 'hero-form',
          submittedAt: new Date().toISOString(),
        },
        tracking: trackingData,
      };

      // Create FormData if we have files
      let body: FormData | string;
      let headers: Record<string, string> = {};
      
      if (uploadedFiles.length > 0) {
        const formData = new FormData();
        formData.append('data', JSON.stringify(submissionData));
        
        uploadedFiles.forEach((file, index) => {
          formData.append(`file_${index}`, file.file, file.name);
        });
        
        body = formData;
      } else {
        body = JSON.stringify(submissionData);
        headers['Content-Type'] = 'application/json';
      }

      // Submit to existing API
      console.log('🌐 Making API request to /api/submit-quote', {
        method: 'POST',
        hasFiles: uploadedFiles.length > 0,
        headers: Object.keys(headers)
      });
      
      const response = await fetch('/api/submit-quote', {
        method: 'POST',
        body,
        headers,
      });
      
      console.log('📡 API response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP error response:', { 
          status: response.status, 
          statusText: response.statusText, 
          body: errorText 
        });
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('📋 API result parsed:', result);

      if (result.success) {
        console.log('🎉 Form submission successful!', { quoteId: result.quoteId });
        setSubmitStatus('success');
        setSubmitMessage(result.message || 'Quote request submitted successfully!');
        
        // Clear form and files
        console.log('🧹 Clearing form and files');
        reset();
        uploadedFiles.forEach(file => URL.revokeObjectURL(file.url));
        setUploadedFiles([]);
        
        if (onSubmit) {
          console.log('🔄 Calling onSubmit callback');
          onSubmit(data);
        }
      } else {
        console.error('💥 Form submission failed:', result);
        setSubmitStatus('error');
        setSubmitMessage(result.message || 'Failed to submit quote request. Please try again.');
      }
    } catch (error) {
      console.error('🚨 Form submission error:', error);
      setSubmitStatus('error');
      
      if (error instanceof Error) {
        setSubmitMessage(`Error: ${error.message}`);
      } else {
        setSubmitMessage('Network error. Please check your connection and try again.');
      }
    } finally {
      console.log('🏁 Form submission completed');
      setIsSubmitting(false);
    }
  };

  // Show error state if component failed
  if (componentError) {
    return (
      <div className={`hero-quote-form error ${className}`}>
        <div className="form-header">
          <h2>Form Error</h2>
          <p>There was an issue loading the form. Please refresh the page or contact us directly.</p>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '1rem' }}>Error: {componentError}</p>
          <a href="tel:+14165550123" style={{ 
            display: 'inline-block', 
            marginTop: '1rem', 
            padding: '0.75rem 1.5rem', 
            background: '#0052cc', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '6px' 
          }}>
            📞 Call (416) 555-0123
          </a>
        </div>
      </div>
    );
  }
  
  if (submitStatus === 'success') {
    return (
      <div className={`hero-quote-form success ${className}`}>
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h3>Quote Request Sent!</h3>
          <p>{submitMessage || "We'll review your request and get back to you within 24 hours."}</p>
          <button 
            className="btn-reset"
            onClick={() => {
              setSubmitStatus('idle');
              setSubmitMessage('');
            }}
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`hero-quote-form ${className}`}>
      <div className="form-header">
        <h2>Get Your Quote in Seconds</h2>
        <p>Paste your project details or RFQ email below</p>
      </div>
      
      <form onSubmit={(e) => {
        console.log('📄 Form onSubmit triggered!');
        return handleSubmit((data) => {
          console.log('📨 handleSubmit callback called with data:', data);
          return handleFormSubmit(data);
        })(e);
      }} className="hero-form">
        {/* Primary paste area */}
        <div className="form-group paste-group">
          <label htmlFor="projectDetails" className="sr-only">
            Project Details
          </label>
          <div className="paste-container">
            <textarea
              {...register('projectDetails', { required: 'Please provide more details about your project' })}
              ref={(e) => {
                register('projectDetails').ref(e);
                textareaRef.current = e;
              }}
              id="projectDetails"
              className={`paste-textarea ${errors.projectDetails ? 'error' : ''}`}
              placeholder="Paste your project details or RFQ email here... Or describe what you need fabricated."
              rows={8}
            />
            <div className="paste-toolbar">
              {isClipboardSupported() && (
                <button
                  type="button"
                  onClick={handlePasteClick}
                  className={`paste-btn ${pasteSuccess ? 'success' : ''}`}
                  title="Paste from clipboard"
                >
                  {pasteSuccess ? '✓ Pasted!' : '📋 Paste from Clipboard'}
                </button>
              )}
              <div className="char-count">
                {projectDetails.length}/2000
              </div>
            </div>
          </div>
          {errors.projectDetails && (
            <span className="error-message">{errors.projectDetails.message}</span>
          )}
        </div>

        {/* File upload area */}
        <div className="form-group file-upload-group">
          <div
            {...getRootProps()}
            className={`file-dropzone ${
              isDragActive ? 'drag-active' : ''
            } ${
              uploadedFiles.length > 0 ? 'has-files' : ''
            }`}
          >
            <input {...getInputProps()} />
            <div className="dropzone-content">
              {isDragActive ? (
                <>
                  <div className="upload-icon">📁</div>
                  <p>Drop files here...</p>
                </>
              ) : (
                <>
                  <div className="upload-icon">📎</div>
                  <p><strong>Click to upload</strong> or drag files here</p>
                  <p className="upload-hint">CAD files, drawings, images, PDFs (Max 10MB each)</p>
                </>
              )}
            </div>
          </div>
          
          {/* File list */}
          {uploadedFiles.length > 0 && (
            <div className="uploaded-files">
              <h4>Uploaded Files ({uploadedFiles.length}):</h4>
              <ul className="file-list">
                {uploadedFiles.map(file => (
                  <li key={file.id} className="file-item">
                    <div className="file-info">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">({Math.round(file.size / 1024)}KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="remove-file"
                      aria-label={`Remove ${file.name}`}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Contact fields */}
        <div className="form-row">
          <div className="form-group">
            <input
              {...register('contactName')}
              type="text"
              placeholder="Your Name *"
              className={errors.contactName ? 'error' : ''}
            />
            {errors.contactName && (
              <span className="error-message">{errors.contactName.message}</span>
            )}
          </div>
          <div className="form-group">
            <input
              {...register('email')}
              type="email"
              placeholder="Email Address *"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <input
              {...register('phone')}
              type="tel"
              placeholder="Phone Number (Optional)"
            />
          </div>
          <div className="form-group">
            <input
              {...register('company')}
              type="text"
              placeholder="Company (Optional)"
            />
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`submit-btn ${isSubmitting ? 'loading' : ''} ${submitStatus === 'error' ? 'error' : ''}`}
          onClick={(e) => {
            console.log('🔴 Submit button clicked!');
            
            const currentValues = form.getValues();
            const currentErrors = errors;
            const hasErrors = Object.keys(currentErrors).length > 0;
            
            console.log('📊 Form State Analysis:', {
              isSubmitting,
              submitStatus,
              hasErrors,
              errorsCount: Object.keys(currentErrors).length,
              filesCount: uploadedFiles.length,
              formIsValid: form.formState.isValid,
              formIsDirty: form.formState.isDirty,
              formIsTouched: form.formState.isTouched
            });
            
            console.log('📝 Current Form Values:', currentValues);
            
            if (hasErrors) {
              console.warn('⚠️ VALIDATION ERRORS DETECTED:', currentErrors);
              console.log('🔍 Detailed Error Analysis:');
              Object.entries(currentErrors).forEach(([field, error]) => {
                console.log(`   ❌ ${field}: ${error?.message} (value: "${currentValues[field as keyof typeof currentValues]}")`);
              });
            }
            
            // Manual validation check
            try {
              heroQuoteSchema.parse(currentValues);
              console.log('✅ Manual schema validation passed');
            } catch (validationError: any) {
              console.error('❌ Manual schema validation failed:', validationError.errors);
            }
          }}
        >
          {isSubmitting ? (
            <>
              <span className="loading-spinner"></span>
              Sending...
            </>
          ) : (
            'Get Your Quote Now'
          )}
        </button>

        {submitStatus === 'error' && (
          <div className="error-message">
            {submitMessage || 'Something went wrong. Please try again or call us at (416) 555-0123.'}
          </div>
        )}

        <div className="form-note">
          <p>✓ Secure & confidential • ✓ Response within 24 hours • ✓ No spam guaranteed</p>
        </div>
        
        {/* Debug info - only show in development */}
        {import.meta.env.DEV && (
          <details className="debug-info" style={{ marginTop: '1rem' }}>
            <summary style={{ cursor: 'pointer', color: '#666', fontSize: '12px' }}>🔍 Debug Information</summary>
            <div style={{ fontSize: '11px', background: '#f5f5f5', padding: '10px', borderRadius: '4px', maxHeight: '200px', overflow: 'auto', marginTop: '5px' }} id="debug-log">
              Check browser console for detailed logs
            </div>
          </details>
        )}
      </form>
    </div>
  );
};

export default HeroQuoteForm;