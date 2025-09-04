export interface QuoteFormData {
  // Step 1: Contact Information
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
    jobTitle?: string;
  };

  // Step 2: Project Details
  project: {
    projectName: string;
    projectType: ProjectType;
    material: MaterialType;
    thickness?: string;
    quantity: number;
    requiredDate: string;
    budget?: BudgetRange;
    description: string;
    specifications?: string;
  };

  // Step 3: File Uploads
  files: UploadedFile[];

  // Step 4: Additional Services
  services: {
    laserCutting: boolean;
    metalBending: boolean;
    welding: boolean;
    assembly: boolean;
    finishing: boolean;
    design: boolean;
    other?: string;
  };

  // Metadata
  metadata?: {
    source?: string;
    referrer?: string;
    utmCampaign?: string;
    utmMedium?: string;
    utmSource?: string;
    submittedAt?: string;
    ipAddress?: string;
  };
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  preview?: string;
  uploadedAt: Date;
  status: 'uploading' | 'success' | 'error';
  errorMessage?: string;
}

export type ProjectType = 
  | 'prototype'
  | 'small-batch'
  | 'large-production'
  | 'custom-fabrication'
  | 'repair-modification'
  | 'other';

export type MaterialType =
  | 'steel'
  | 'stainless-steel'
  | 'aluminum'
  | 'copper'
  | 'brass'
  | 'titanium'
  | 'other';

export type BudgetRange =
  | 'under-1k'
  | '1k-5k'
  | '5k-10k'
  | '10k-25k'
  | '25k-50k'
  | '50k-100k'
  | 'over-100k';

export interface QuoteFormState {
  currentStep: number;
  formData: QuoteFormData;
  isSubmitting: boolean;
  hasError: boolean;
  errorMessage?: string;
  submissionId?: string;
  lastSavedAt?: Date;
}

export interface StepValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface HubSpotFormSubmission {
  portalId: string;
  formGuid: string;
  fields: HubSpotField[];
  context: {
    pageUri: string;
    pageName: string;
    ipAddress?: string;
    hutk?: string;
  };
  legalConsentOptions?: {
    consent: {
      consentToProcess: boolean;
      text: string;
      communications: Array<{
        value: boolean;
        subscriptionTypeId: number;
        text: string;
      }>;
    };
  };
}

export interface HubSpotField {
  objectTypeId: string;
  name: string;
  value: string;
}

export interface HubSpotContact {
  properties: {
    email: string;
    firstname: string;
    lastname: string;
    phone?: string;
    company?: string;
    jobtitle?: string;
    [key: string]: string | number | boolean | undefined;
  };
}

export interface HubSpotDeal {
  properties: {
    dealname: string;
    pipeline?: string;
    dealstage?: string;
    amount?: number;
    closedate?: string;
    project_type?: string;
    material_type?: string;
    quantity?: number;
    description?: string;
    [key: string]: string | number | boolean | undefined;
  };
  associations?: Array<{
    to: {
      id: string;
    };
    types: Array<{
      associationCategory: string;
      associationTypeId: number;
    }>;
  }>;
}

export interface QuoteSubmissionResponse {
  success: boolean;
  quoteId?: string;
  message?: string;
  errors?: Record<string, string>;
  hubspotContactId?: string;
  hubspotDealId?: string;
}