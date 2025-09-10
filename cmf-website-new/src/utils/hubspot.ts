import { Client } from '@hubspot/api-client';
import type { 
  HubSpotContact, 
  HubSpotDeal, 
  QuoteFormData,
  HubSpotFormSubmission 
} from '../types/quote';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Initialize HubSpot client
const getHubSpotClient = () => {
  // In server-side code, use process.env for private environment variables
  const accessToken = process.env.HUBSPOT_API_KEY || import.meta.env.HUBSPOT_API_KEY;
  
  if (!accessToken || accessToken === 'your_private_api_key_here' || accessToken.startsWith('your_private')) {
    console.error('HubSpot API key is not configured or is still the placeholder value.');
    console.error('Please update HUBSPOT_API_KEY in your .env.local file with your actual API key.');
    throw new Error('HubSpot API key is not configured');
  }
  
  console.log('HubSpot client initialized with token:', accessToken.substring(0, 10) + '...');
  
  // Use accessToken parameter (not apiKey) for Client initialization
  return new Client({ 
    accessToken: accessToken.trim(),
    numberOfApiCallRetries: 3
  });
};

// Map form data to HubSpot contact properties
export const mapToHubSpotContact = (formData: QuoteFormData): HubSpotContact => {
  return {
    properties: {
      email: formData.contact.email,
      firstname: formData.contact.firstName,
      lastname: formData.contact.lastName,
      phone: formData.contact.phone,
      company: formData.contact.company,
      jobtitle: formData.contact.jobTitle || '',
      
      // Use standard HubSpot properties instead of custom ones
      hs_lead_status: 'NEW',
      lifecyclestage: 'lead',
    },
  };
};

// Map form data to HubSpot deal properties
export const mapToHubSpotDeal = (
  formData: QuoteFormData,
  contactId: string
): HubSpotDeal => {
  // Calculate estimated deal value based on budget range
  const dealAmount = calculateDealAmount(formData.project.budget);
  
  // Calculate close date (30 days from required date)
  const closeDate = new Date(formData.project.requiredDate);
  closeDate.setDate(closeDate.getDate() + 30);
  
  return {
    properties: {
      dealname: `${formData.contact.company} - ${formData.project.projectName}`,
      pipeline: 'default', // Update with your pipeline ID
      dealstage: 'appointmentscheduled', // Update with your stage ID
      amount: dealAmount,
      closedate: closeDate.toISOString(),
      
      // Custom properties (these need to be created in HubSpot)
      project_type: formData.project.projectType,
      material_type: formData.project.material,
      quantity: formData.project.quantity,
      description: formData.project.description,
      specifications: formData.project.specifications || '',
      required_date: formData.project.requiredDate,
      
      // Services requested
      service_laser_cutting: formData.services.laserCutting,
      service_metal_bending: formData.services.metalBending,
      service_welding: formData.services.welding,
      service_assembly: formData.services.assembly,
      service_finishing: formData.services.finishing,
      service_design: formData.services.design,
      service_other: formData.services.other || '',
    },
    associations: [
      {
        to: {
          id: contactId,
        },
        types: [
          {
            associationCategory: 'HUBSPOT_DEFINED' as const,
            associationTypeId: 3, // Contact to Deal association
          },
        ],
      },
    ],
  };
};

// Calculate estimated deal amount from budget range
const calculateDealAmount = (budget?: string): number => {
  const budgetMap: Record<string, number> = {
    'under-1k': 750,
    '1k-5k': 3000,
    '5k-10k': 7500,
    '10k-25k': 17500,
    '25k-50k': 37500,
    '50k-100k': 75000,
    'over-100k': 150000,
  };
  
  return budget ? budgetMap[budget] || 0 : 0;
};

// Create or update contact in HubSpot
export const createOrUpdateContact = async (
  formData: QuoteFormData
): Promise<string> => {
  const client = getHubSpotClient();
  
  try {
    // Simplify - just create the contact with basic properties
    const simpleContactData = {
      properties: {
        email: formData.contact.email,
        firstname: formData.contact.firstName,
        lastname: formData.contact.lastName,
        phone: formData.contact.phone || '',
        company: formData.contact.company || '',
        jobtitle: formData.contact.jobTitle || '',
        lifecyclestage: 'lead',
      },
    };
    
    console.log('Creating contact with data:', JSON.stringify(simpleContactData, null, 2));
    
    // Create new contact
    const response = await client.crm.contacts.basicApi.create(simpleContactData);
    console.log('Contact created successfully! ID:', response.id);
    return response.id;
    
  } catch (error: any) {
    // Check if it's a duplicate contact error
    if (error.code === 409 && error.body?.message?.includes('Contact already exists')) {
      // Extract the existing contact ID from the error message
      const match = error.body.message.match(/Existing ID: (\d+)/);
      if (match && match[1]) {
        const existingId = match[1];
        console.log('Contact already exists with ID:', existingId);
        console.log('SUCCESS - Using existing contact');
        return existingId;
      }
    }
    
    console.error('Error creating HubSpot contact:', error);
    console.error('Error details:', error.body || error.message);
    throw new Error('Failed to create contact in HubSpot');
  }
};

// Create deal in HubSpot
export const createDeal = async (
  formData: QuoteFormData,
  contactId: string
): Promise<string> => {
  const client = getHubSpotClient();
  
  // Simplified deal with only standard HubSpot properties
  const dealAmount = calculateDealAmount(formData.project.budget);
  const closeDate = new Date(formData.project.requiredDate);
  closeDate.setDate(closeDate.getDate() + 30);
  
  const simpleDealData = {
    properties: {
      dealname: `${formData.contact.company} - ${formData.project.projectName}`,
      pipeline: 'default',
      dealstage: 'qualifiedtobuy', // Using valid stage for default pipeline
      amount: dealAmount.toString(),
      closedate: closeDate.toISOString().split('T')[0], // YYYY-MM-DD format
      description: `Project: ${formData.project.projectType}\n` +
                  `Material: ${formData.project.material}\n` +
                  `Quantity: ${formData.project.quantity}\n` +
                  `Description: ${formData.project.description}\n` +
                  `Services: ${Object.entries(formData.services)
                    .filter(([_, value]) => value)
                    .map(([key, _]) => key)
                    .join(', ')}`,
    },
    associations: [
      {
        to: {
          id: contactId,
        },
        types: [
          {
            associationCategory: 'HUBSPOT_DEFINED' as const,
            associationTypeId: 3, // Contact to Deal association
          },
        ],
      },
    ],
  };
  
  try {
    console.log('Creating deal with data:', JSON.stringify(simpleDealData, null, 2));
    const response = await client.crm.deals.basicApi.create(simpleDealData);
    console.log('Deal created successfully! ID:', response.id);
    return response.id;
  } catch (error: any) {
    console.error('Error creating HubSpot deal:', error);
    console.error('Error details:', error.body || error.message);
    throw new Error('Failed to create deal in HubSpot');
  }
};

// Upload file to HubSpot
export const uploadFileToHubSpot = async (
  file: File,
  contactId: string
): Promise<string> => {
  const client = getHubSpotClient();
  
  try {
    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);
    
    // Upload file
    const response = await client.files.filesApi.upload(
      {
        data: fileBuffer,
        name: file.name,
      },
      undefined,
      JSON.stringify({
        access: 'PRIVATE',
        overwrite: false,
        duplicateValidationStrategy: 'NONE',
        duplicateValidationScope: 'ENTIRE_PORTAL',
      })
    );
    
    // Associate file with contact
    if (response.id && contactId) {
      await associateFileWithContact(response.id, contactId);
    }
    
    return response.id;
  } catch (error) {
    console.error('Error uploading file to HubSpot:', error);
    throw new Error('Failed to upload file to HubSpot');
  }
};

// Associate file with contact
const associateFileWithContact = async (
  fileId: string,
  contactId: string
): Promise<void> => {
  const client = getHubSpotClient();
  
  try {
    // Note: File associations are handled differently in HubSpot API v3
    // For now, we'll skip the association as it requires specific configuration
  } catch (error) {
    console.error('Error associating file with contact:', error);
    // Non-critical error, don't throw
  }
};

// Submit form data to HubSpot Forms API (for tracking and analytics)
export const submitToHubSpotForms = async (
  formData: QuoteFormData,
  pageContext: { 
    pageUri: string; 
    pageName: string;
    hutk?: string | null;
  }
): Promise<void> => {
  const portalId = process.env.PUBLIC_HUBSPOT_PORTAL_ID || import.meta.env.PUBLIC_HUBSPOT_PORTAL_ID;
  const formGuid = process.env.PUBLIC_HUBSPOT_FORM_GUID || import.meta.env.PUBLIC_HUBSPOT_FORM_GUID;
  
  if (!portalId || !formGuid) {
    console.warn('HubSpot Forms API not configured');
    return;
  }
  
  console.log('Submitting to HubSpot Forms API...');
  console.log('Portal ID:', portalId);
  console.log('Form GUID:', formGuid);
  console.log('Has tracking cookie:', !!pageContext.hutk);
  
  // Build submission without objectTypeId (not needed for v3 API)
  const submission = {
    fields: [
      { name: 'email', value: formData.contact.email },
      { name: 'firstname', value: formData.contact.firstName },
      { name: 'lastname', value: formData.contact.lastName },
      { name: 'phone', value: formData.contact.phone },
      { name: 'company', value: formData.contact.company },
      { name: 'jobtitle', value: formData.contact.jobTitle || '' },
      // Combine project details into message field
      { name: 'message', value: 
        `Project: ${formData.project.projectName}\n` +
        `Type: ${formData.project.projectType}\n` +
        `Material: ${formData.project.material}\n` +
        `Quantity: ${formData.project.quantity}\n` +
        `Budget: ${formData.project.budget || 'Not specified'}\n` +
        `Required Date: ${formData.project.requiredDate}\n` +
        `Description: ${formData.project.description}` 
      },
    ],
    context: {
      hutk: pageContext.hutk || undefined, // HubSpot tracking cookie - CRITICAL for analytics
      pageUri: pageContext.pageUri || 'https://canadianmetalfab.com/get-quote',
      pageName: pageContext.pageName || 'Get Quote Form',
      // Don't include ipAddress if it's 'unknown' or invalid
      ...(formData.metadata?.ipAddress && formData.metadata.ipAddress !== 'unknown' 
        ? { ipAddress: formData.metadata.ipAddress }
        : {}),
    },
    legalConsentOptions: {
      consent: {
        consentToProcess: true,
        text: 'I agree to allow Canadian Metal Fabricators to store and process my personal data.',
        communications: [
          {
            value: true,
            subscriptionTypeId: 999999, // Replace with your subscription type ID
            text: 'I agree to receive marketing communications from Canadian Metal Fabricators.',
          },
        ],
      },
    },
  };
  
  try {
    const response = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('HubSpot Forms API error:', response.status, errorText);
      throw new Error(`HubSpot Forms API error: ${response.statusText}`);
    } else {
      const result = await response.json();
      console.log('Form submission successful:', result);
    }
  } catch (error) {
    console.error('Error submitting to HubSpot Forms:', error);
    // Non-critical error, don't throw
  }
};

// Create a complete quote submission in HubSpot
export const submitQuoteToHubSpot = async (
  formData: QuoteFormData,
  files: File[] = [],
  trackingData?: { hutk?: string | null; pageUri?: string; pageName?: string }
): Promise<{ contactId: string; dealId: string; fileIds: string[] }> => {
  try {
    // 1. Create or update contact
    console.log('Step 1: Creating/updating contact...');
    const contactId = await createOrUpdateContact(formData);
    console.log('Contact ID:', contactId);
    
    // 2. Create deal with file information
    console.log('Step 2: Creating deal...');
    let dealId = 'pending';
    try {
      // Add file names to the form data for the deal description
      const formDataWithFiles = {
        ...formData,
        fileNames: files.map(f => f.name),
      };
      dealId = await createDealWithFiles(formDataWithFiles, contactId, files);
      console.log('Deal created with ID:', dealId);
    } catch (dealError) {
      console.error('Failed to create deal:', dealError);
      // Continue even if deal creation fails
    }
    
    // 3. Skip HubSpot file upload (API issues) - files are saved locally instead
    const fileIds: string[] = [];
    if (files && files.length > 0) {
      console.log(`Step 3: ${files.length} file(s) saved locally (HubSpot file upload disabled)`);
      // File information is included in the deal description instead
    }
    
    // 4. Submit to HubSpot Forms API for tracking
    console.log('Step 4: Submitting to Forms API...');
    try {
      await submitToHubSpotForms(formData, {
        hutk: trackingData?.hutk || null,
        pageUri: trackingData?.pageUri || '/get-quote',
        pageName: trackingData?.pageName || 'Get Quote Form'
      });
      console.log('Form submission tracked');
    } catch (formError) {
      console.error('Failed to track form submission:', formError);
      // Non-critical, continue
    }
    
    return { contactId, dealId, fileIds };
  } catch (error) {
    console.error('Error submitting quote to HubSpot:', error);
    throw error;
  }
};

// Create deal with file information
const createDealWithFiles = async (
  formData: QuoteFormData & { fileNames?: string[] },
  contactId: string,
  files: File[] = []
): Promise<string> => {
  const client = getHubSpotClient();
  
  // Simplified deal with only standard HubSpot properties
  const dealAmount = calculateDealAmount(formData.project.budget);
  const closeDate = new Date(formData.project.requiredDate);
  closeDate.setDate(closeDate.getDate() + 30);
  
  // Build description with file information
  let description = `Project: ${formData.project.projectType}\n` +
                   `Material: ${formData.project.material}\n` +
                   `Quantity: ${formData.project.quantity}\n` +
                   `Description: ${formData.project.description}\n` +
                   `Services: ${Object.entries(formData.services)
                     .filter(([_, value]) => value)
                     .map(([key, _]) => key)
                     .join(', ')}`;
  
  if (files && files.length > 0) {
    description += `\n\nAttached Files (${files.length}):\n`;
    files.forEach(file => {
      description += `- ${file.name} (${(file.size / 1024).toFixed(2)} KB)\n`;
    });
  }
  
  const simpleDealData = {
    properties: {
      dealname: `${formData.contact.company} - ${formData.project.projectName}`,
      pipeline: 'default',
      dealstage: 'qualifiedtobuy', 
      amount: dealAmount.toString(),
      closedate: closeDate.toISOString().split('T')[0],
      description,
    },
    associations: [
      {
        to: {
          id: contactId,
        },
        types: [
          {
            associationCategory: 'HUBSPOT_DEFINED' as const,
            associationTypeId: 3,
          },
        ],
      },
    ],
  };
  
  try {
    console.log('Creating deal with file information...');
    const response = await client.crm.deals.basicApi.create(simpleDealData);
    console.log('Deal created successfully! ID:', response.id);
    return response.id;
  } catch (error: any) {
    console.error('Error creating HubSpot deal:', error);
    console.error('Error details:', error.body || error.message);
    throw new Error('Failed to create deal in HubSpot');
  }
};

// Generate a unique quote ID
export const generateQuoteId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `CMF-${timestamp}-${random}`.toUpperCase();
};