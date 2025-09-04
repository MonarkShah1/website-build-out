import { z } from 'zod';

// Contact Information Schema (Step 1)
export const contactSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),
  
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),
  
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase(),
  
  phone: z.string()
    .min(1, 'Phone number is required')
    .regex(
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
      'Please enter a valid phone number'
    ),
  
  company: z.string()
    .min(1, 'Company name is required')
    .max(100, 'Company name must be less than 100 characters'),
  
  jobTitle: z.string()
    .max(100, 'Job title must be less than 100 characters')
    .optional(),
});

// Project Details Schema (Step 2)
export const projectSchema = z.object({
  projectName: z.string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters'),
  
  projectType: z.enum(
    ['prototype', 'small-batch', 'large-production', 'custom-fabrication', 'repair-modification', 'other'],
    { errorMap: () => ({ message: 'Please select a project type' })}
  ),
  
  material: z.enum(
    ['steel', 'stainless-steel', 'aluminum', 'copper', 'brass', 'titanium', 'other'],
    { errorMap: () => ({ message: 'Please select a material type' })}
  ),
  
  thickness: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Please enter a valid thickness')
    .optional()
    .transform((val) => val === '' ? undefined : val),
  
  quantity: z.number()
    .min(1, 'Quantity must be at least 1')
    .max(999999, 'Quantity is too large'),
  
  requiredDate: z.string()
    .min(1, 'Required date is needed')
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, 'Date must be today or in the future'),
  
  budget: z.enum(
    ['under-1k', '1k-5k', '5k-10k', '10k-25k', '25k-50k', '50k-100k', 'over-100k'],
    { errorMap: () => ({ message: 'Please select a budget range' })}
  ).optional(),
  
  description: z.string()
    .min(10, 'Please provide at least 10 characters of description')
    .max(2000, 'Description must be less than 2000 characters'),
  
  specifications: z.string()
    .max(2000, 'Specifications must be less than 2000 characters')
    .optional(),
});

// File Upload Schema (Step 3)
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ACCEPTED_FILE_TYPES = [
  '.pdf',
  '.dwg',
  '.dxf',
  '.step',
  '.stp',
  '.stl',
  '.iges',
  '.igs',
  '.sat',
  '.x_t',
  '.x_b',
  '.png',
  '.jpg',
  '.jpeg',
  '.zip',
  '.rar',
];

export const fileSchema = z.object({
  id: z.string(),
  name: z.string()
    .refine((name) => {
      const ext = name.toLowerCase().match(/\.[^.]+$/)?.[0];
      return ext ? ACCEPTED_FILE_TYPES.includes(ext) : false;
    }, 'File type not supported. Please upload CAD files or PDFs.'),
  
  size: z.number()
    .max(MAX_FILE_SIZE, 'File size must be less than 25MB'),
  
  type: z.string(),
  url: z.string().optional(), // Removed .url() validation to allow blob URLs
  preview: z.string().optional(),
  uploadedAt: z.union([z.date(), z.string()]), // Accept both Date and string
  status: z.enum(['uploading', 'success', 'error']),
  errorMessage: z.string().optional(),
});

export const filesSchema = z.array(fileSchema)
  .min(0)
  .max(10, 'You can upload a maximum of 10 files');

// Services Schema (Step 4)
export const servicesSchema = z.object({
  laserCutting: z.boolean(),
  metalBending: z.boolean(),
  welding: z.boolean(),
  assembly: z.boolean(),
  finishing: z.boolean(),
  design: z.boolean(),
  other: z.string()
    .max(200, 'Other services description must be less than 200 characters')
    .optional(),
}).refine(
  (data) => {
    // At least one service must be selected
    return data.laserCutting || 
           data.metalBending || 
           data.welding || 
           data.assembly || 
           data.finishing || 
           data.design || 
           (data.other && data.other.length > 0);
  },
  { message: 'Please select at least one service' }
);

// Metadata Schema
export const metadataSchema = z.object({
  source: z.string().optional(),
  referrer: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmMedium: z.string().optional(),
  utmSource: z.string().optional(),
  submittedAt: z.string().optional(),
  ipAddress: z.string().optional(),
});

// Complete Quote Form Schema
export const quoteFormSchema = z.object({
  contact: contactSchema,
  project: projectSchema,
  files: filesSchema,
  services: servicesSchema,
  metadata: metadataSchema.optional(),
});

// Step validation schemas for progressive validation
export const stepSchemas = {
  1: contactSchema,
  2: projectSchema,
  3: filesSchema,
  4: servicesSchema,
};

// Helper function to validate a specific step
export const validateStep = (step: number, data: any) => {
  const schema = stepSchemas[step as keyof typeof stepSchemas];
  if (!schema) return { success: true, errors: {} };
  
  try {
    schema.parse(data);
    return { success: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
};

// Helper function to get default values
export const getDefaultValues = () => ({
  contact: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
  },
  project: {
    projectName: '',
    projectType: undefined,
    material: undefined,
    thickness: '',
    quantity: 1,
    requiredDate: '',
    budget: undefined,
    description: '',
    specifications: '',
  },
  files: [],
  services: {
    laserCutting: false,
    metalBending: false,
    welding: false,
    assembly: false,
    finishing: false,
    design: false,
    other: '',
  },
  metadata: {
    source: typeof window !== 'undefined' ? window.location.href : '',
    referrer: typeof document !== 'undefined' ? document.referrer : '',
    submittedAt: new Date().toISOString(),
  },
});

// Type exports
export type ContactFormData = z.infer<typeof contactSchema>;
export type ProjectFormData = z.infer<typeof projectSchema>;
export type FilesFormData = z.infer<typeof filesSchema>;
export type ServicesFormData = z.infer<typeof servicesSchema>;
export type QuoteFormData = z.infer<typeof quoteFormSchema>;