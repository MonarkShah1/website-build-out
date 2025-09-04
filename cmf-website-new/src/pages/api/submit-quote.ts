import type { APIRoute } from 'astro';
import { quoteFormSchema } from '../../schemas/quoteFormSchema';
import { submitQuoteToHubSpot, generateQuoteId } from '../../utils/hubspot';
import type { QuoteSubmissionResponse } from '../../types/quote';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs/promises';
import { existsSync } from 'fs';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// This endpoint needs to be server-rendered
export const prerender = false;

// CORS headers for API responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle preflight requests
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
};

// Handle quote form submission
export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse request body
    const contentType = request.headers.get('content-type');
    let formData;
    let files: File[] = [];
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle multipart form data with files
      const data = await request.formData();
      
      // Extract JSON data
      const jsonData = data.get('data');
      if (typeof jsonData !== 'string') {
        return createErrorResponse('Invalid form data', 400);
      }
      
      formData = JSON.parse(jsonData);
      
      // Extract files
      for (const [key, value] of data.entries()) {
        if (key.startsWith('file_') && value instanceof File) {
          files.push(value);
        }
      }
    } else {
      // Handle regular JSON submission
      formData = await request.json();
    }
    
    // Add metadata
    formData.metadata = {
      ...formData.metadata,
      submittedAt: new Date().toISOString(),
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
    };
    
    // Transform file dates from strings to Date objects if needed
    if (formData.files && Array.isArray(formData.files)) {
      formData.files = formData.files.map((file: any) => ({
        ...file,
        uploadedAt: typeof file.uploadedAt === 'string' 
          ? new Date(file.uploadedAt) 
          : file.uploadedAt
      }));
    }
    
    // Validate form data
    const validationResult = quoteFormSchema.safeParse(formData);
    
    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.errors.forEach((error) => {
        const path = error.path.join('.');
        errors[path] = error.message;
      });
      
      // Log validation errors for debugging
      console.error('Validation errors:', errors);
      console.error('Form data that failed validation:', JSON.stringify(formData, null, 2));
      
      return createErrorResponse('Validation failed', 400, errors);
    }
    
    // Generate quote ID
    const quoteId = generateQuoteId();
    
    // Save files locally if provided
    const savedFiles: { name: string; path: string; size: number }[] = [];
    if (files.length > 0) {
      const uploadsDir = path.resolve(process.cwd(), 'uploads', quoteId);
      
      // Create directory for this quote
      if (!existsSync(uploadsDir)) {
        await fs.mkdir(uploadsDir, { recursive: true });
      }
      
      // Save each file
      for (const file of files) {
        try {
          const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const filePath = path.join(uploadsDir, fileName);
          const buffer = Buffer.from(await file.arrayBuffer());
          
          await fs.writeFile(filePath, buffer);
          savedFiles.push({
            name: file.name,
            path: filePath,
            size: file.size,
          });
          
          console.log(`File saved: ${fileName} to ${filePath}`);
        } catch (fileError) {
          console.error(`Failed to save file ${file.name}:`, fileError);
        }
      }
    }
    
    // Submit to HubSpot
    let hubspotContactId: string | undefined;
    let hubspotDealId: string | undefined;
    
    try {
      const hubspotResult = await submitQuoteToHubSpot(
        validationResult.data,
        files
      );
      
      hubspotContactId = hubspotResult.contactId;
      hubspotDealId = hubspotResult.dealId;
    } catch (hubspotError) {
      // Log HubSpot error but don't fail the entire submission
      console.error('HubSpot submission error:', hubspotError);
      
      // You might want to implement a fallback here
      // such as sending an email or saving to a database
      await handleFallbackSubmission(validationResult.data, quoteId, savedFiles);
    }
    
    // Send email notification with file information
    await sendEmailNotification(validationResult.data, quoteId, savedFiles);
    
    // Create success response
    const response: QuoteSubmissionResponse = {
      success: true,
      quoteId,
      message: `Thank you for your quote request! Your reference number is ${quoteId}. We'll contact you within 24 hours.`,
      hubspotContactId,
      hubspotDealId,
    };
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
    
  } catch (error) {
    console.error('Quote submission error:', error);
    
    return createErrorResponse(
      'An error occurred while processing your request. Please try again.',
      500
    );
  }
};

// Create error response
function createErrorResponse(
  message: string,
  status: number,
  errors?: Record<string, string>
): Response {
  const response: QuoteSubmissionResponse = {
    success: false,
    message,
    errors,
  };
  
  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

// Fallback submission handler (when HubSpot fails)
async function handleFallbackSubmission(
  formData: any,
  quoteId: string,
  savedFiles?: { name: string; path: string; size: number }[]
): Promise<void> {
  // Save submission data to a JSON file as backup
  const backupDir = path.resolve(process.cwd(), 'uploads', 'backups');
  
  if (!existsSync(backupDir)) {
    await fs.mkdir(backupDir, { recursive: true });
  }
  
  const backupData = {
    quoteId,
    formData,
    savedFiles,
    submittedAt: new Date().toISOString(),
  };
  
  const backupPath = path.join(backupDir, `${quoteId}.json`);
  await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));
  
  console.log(`Backup saved to: ${backupPath}`);
}

// Send email notification
async function sendEmailNotification(
  formData: any,
  quoteId: string,
  savedFiles?: { name: string; path: string; size: number }[]
): Promise<void> {
  const notificationEmail = process.env.NOTIFICATION_EMAIL || import.meta.env.NOTIFICATION_EMAIL;
  
  if (!notificationEmail) {
    console.log('Email notifications not configured');
    return;
  }
  
  // Email template
  const emailHtml = `
    <h2>New Quote Request - ${quoteId}</h2>
    
    <h3>Contact Information</h3>
    <ul>
      <li><strong>Name:</strong> ${formData.contact.firstName} ${formData.contact.lastName}</li>
      <li><strong>Email:</strong> ${formData.contact.email}</li>
      <li><strong>Phone:</strong> ${formData.contact.phone}</li>
      <li><strong>Company:</strong> ${formData.contact.company}</li>
      <li><strong>Job Title:</strong> ${formData.contact.jobTitle || 'N/A'}</li>
    </ul>
    
    <h3>Project Details</h3>
    <ul>
      <li><strong>Project Name:</strong> ${formData.project.projectName}</li>
      <li><strong>Project Type:</strong> ${formData.project.projectType}</li>
      <li><strong>Material:</strong> ${formData.project.material}</li>
      <li><strong>Quantity:</strong> ${formData.project.quantity}</li>
      <li><strong>Required Date:</strong> ${formData.project.requiredDate}</li>
      <li><strong>Budget:</strong> ${formData.project.budget || 'Not specified'}</li>
    </ul>
    
    <h3>Description</h3>
    <p>${formData.project.description}</p>
    
    <h3>Services Requested</h3>
    <ul>
      ${formData.services.laserCutting ? '<li>Laser Cutting</li>' : ''}
      ${formData.services.metalBending ? '<li>Metal Bending</li>' : ''}
      ${formData.services.welding ? '<li>Welding</li>' : ''}
      ${formData.services.assembly ? '<li>Assembly</li>' : ''}
      ${formData.services.finishing ? '<li>Finishing</li>' : ''}
      ${formData.services.design ? '<li>Design</li>' : ''}
      ${formData.services.other ? `<li>Other: ${formData.services.other}</li>` : ''}
    </ul>
    
    <h3>Files Attached</h3>
    <p>${savedFiles ? savedFiles.length : formData.files.length} file(s) uploaded</p>
    ${savedFiles && savedFiles.length > 0 ? `
    <ul>
      ${savedFiles.map(file => 
        `<li>${file.name} (${(file.size / 1024).toFixed(2)} KB)</li>`
      ).join('')}
    </ul>` : ''}
    
    <hr>
    <p><small>Submitted on ${new Date().toLocaleString()}</small></p>
  `;
  
  // Here you would integrate with your email service
  // Options: SendGrid, AWS SES, Postmark, etc.
  
  // For development, just log it
  if (import.meta.env.DEV) {
    console.log('Email notification would be sent to:', notificationEmail);
    console.log('Email content:', emailHtml);
  } else {
    // In production, send actual email
    // await sendEmail({
    //   to: notificationEmail,
    //   subject: `New Quote Request - ${quoteId}`,
    //   html: emailHtml,
    // });
  }
}