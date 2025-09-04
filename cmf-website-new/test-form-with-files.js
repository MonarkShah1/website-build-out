import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

async function testFormSubmissionWithFiles() {
  // Create a test file with accepted extension
  const testFileName = 'test-drawing.pdf';
  const testFileContent = Buffer.from('%PDF-1.4\nTest CAD drawing for CMF quote submission.');
  const testFilePath = path.join(__dirname, testFileName);
  
  // Write test file
  fs.writeFileSync(testFilePath, testFileContent);
  
  // Create a File-like object for testing
  const testFile = new File([testFileContent], testFileName, {
    type: 'application/pdf',
    lastModified: Date.now(),
  });
  
  const testData = {
    contact: {
      firstName: 'Jane',
      lastName: 'FileTest',
      email: `jane.filetest${Date.now()}@cmftest.com`,
      phone: '416-555-9876',
      company: 'FileTest Manufacturing Co',
      jobTitle: 'Engineering Manager'
    },
    project: {
      projectName: 'Custom Enclosure with CAD Files',
      projectType: 'custom-fabrication',
      material: 'aluminum',
      quantity: 50,
      requiredDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      budget: '10k-25k',
      description: 'Custom aluminum enclosure based on attached CAD drawings',
      specifications: 'Anodized finish, precision tolerances as per drawings'
    },
    services: {
      laserCutting: true,
      metalBending: true,
      welding: true,
      assembly: true,
      finishing: true,
      design: false,
      other: 'Anodizing required'
    },
    files: [
      {
        id: 'test-file-1',
        name: testFileName,
        size: testFileContent.length,
        type: 'application/pdf',
        uploadedAt: new Date().toISOString(),
        status: 'success',
        url: 'blob://test'
      }
    ],
    metadata: {
      submittedAt: new Date().toISOString(),
      ipAddress: '127.0.0.1'
    }
  };

  console.log('Testing form submission with files...');
  console.log('Test email:', testData.contact.email);
  console.log('Files included:', testData.files.length);
  
  try {
    // Create FormData
    const formData = new FormData();
    formData.append('data', JSON.stringify(testData));
    
    // Add the actual file
    const fileBlob = new Blob([testFileContent], { type: 'application/pdf' });
    formData.append('file_0', fileBlob, testFileName);
    
    const response = await fetch('http://localhost:4321/api/submit-quote', {
      method: 'POST',
      body: formData
      // Don't set Content-Type - browser will set it with boundary
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Form with files submitted successfully!');
      console.log('Response:', JSON.stringify(result, null, 2));
      
      if (result.hubspotContactId) {
        console.log(`\n📧 Contact created in HubSpot: ${result.hubspotContactId}`);
        console.log(`View in HubSpot: https://app.hubspot.com/contacts/47864957/contact/${result.hubspotContactId}`);
      }
      
      if (result.hubspotDealId && result.hubspotDealId !== 'pending') {
        console.log(`\n💼 Deal created in HubSpot: ${result.hubspotDealId}`);
        console.log(`View in HubSpot: https://app.hubspot.com/contacts/47864957/deal/${result.hubspotDealId}`);
        console.log('\n📎 File information has been included in the deal description');
      }
      
      // Check if file was saved
      const uploadsDir = path.join(__dirname, 'uploads', result.quoteId);
      if (fs.existsSync(uploadsDir)) {
        const savedFiles = fs.readdirSync(uploadsDir);
        console.log(`\n💾 Files saved locally in: ${uploadsDir}`);
        console.log('Saved files:', savedFiles);
      }
    } else {
      console.error('❌ Form submission failed');
      console.error('Status:', response.status);
      console.error('Response:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('❌ Error submitting form:', error.message);
  } finally {
    // Clean up test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  }
}

testFormSubmissionWithFiles();