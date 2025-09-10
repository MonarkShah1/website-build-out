import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

// Generate test data
function generateTestData() {
  const timestamp = Date.now();
  return {
    contact: {
      firstName: 'John',
      lastName: 'TestUser',
      email: `john.test${timestamp}@cmftest.com`,
      phone: '416-555-0123',
      company: 'Test Manufacturing Inc',
      jobTitle: 'Project Manager'
    },
    project: {
      projectName: 'Custom Metal Brackets',
      projectType: 'custom-fabrication',
      material: 'stainless-steel',
      quantity: 100,
      requiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      budget: '5k-10k',
      description: 'Need custom brackets for industrial equipment mounting',
      specifications: ''
    },
    services: {
      laserCutting: true,
      metalBending: true,
      welding: false,
      assembly: true,
      finishing: true,
      design: false,
      other: 'Powder coating required'
    },
    files: [],
    metadata: {
      source: 'test-script',
      submittedAt: new Date().toISOString()
    }
  };
}

async function testQuoteSubmission() {
  console.log('=== Testing Quote Form Submission ===\n');
  
  const testData = generateTestData();
  console.log('Test Data:');
  console.log(`- Email: ${testData.contact.email}`);
  console.log(`- Company: ${testData.contact.company}`);
  console.log(`- Project: ${testData.project.projectName}`);
  console.log(`- Budget: ${testData.project.budget}`);
  console.log(`- Required Date: ${testData.project.requiredDate}\n`);
  
  try {
    // Test the API endpoint
    const response = await fetch('http://localhost:4321/api/submit-quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Quote submission successful!');
      console.log(`- Quote ID: ${result.quoteId}`);
      console.log(`- Message: ${result.message}`);
      
      if (result.hubspotContactId) {
        console.log(`- HubSpot Contact ID: ${result.hubspotContactId}`);
      }
      if (result.hubspotDealId) {
        console.log(`- HubSpot Deal ID: ${result.hubspotDealId}`);
      }
      
      console.log('\n📊 Next Steps:');
      console.log('1. Check HubSpot Contacts for:', testData.contact.email);
      console.log('2. Check HubSpot Deals for:', `${testData.contact.company} - ${testData.project.projectName}`);
      console.log('3. Check HubSpot Forms analytics for submission');
      
    } else {
      console.error('❌ Quote submission failed!');
      console.error('Response:', result);
      
      if (result.errors) {
        console.error('\nValidation Errors:');
        Object.entries(result.errors).forEach(([field, error]) => {
          console.error(`  - ${field}: ${error}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error submitting quote:', error.message);
    console.error('\n⚠️  Make sure the dev server is running:');
    console.error('   npm run dev');
  }
}

// Test directly to HubSpot Forms API
async function testDirectHubSpotForm() {
  console.log('\n=== Testing Direct HubSpot Forms API ===\n');
  
  const portalId = process.env.PUBLIC_HUBSPOT_PORTAL_ID;
  const formGuid = process.env.PUBLIC_HUBSPOT_FORM_GUID;
  
  if (!portalId || !formGuid) {
    console.log('⚠️  Forms API not configured');
    return;
  }
  
  const timestamp = Date.now();
  const formData = {
    fields: [
      { name: 'email', value: `direct.test${timestamp}@cmftest.com` },
      { name: 'firstname', value: 'Direct' },
      { name: 'lastname', value: 'Test' },
      { name: 'phone', value: '416-555-9999' },
      { name: 'company', value: 'Direct Test Company' },
      { name: 'message', value: 'This is a direct test submission to verify Forms API' }
    ],
    context: {
      pageUri: 'http://localhost:4321/get-quote',
      pageName: 'Get Quote - Test'
    }
  };
  
  try {
    const response = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      }
    );
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Direct form submission successful!');
      console.log('Response:', result);
      console.log('\n📊 Check HubSpot Forms analytics for this submission');
    } else {
      console.error('❌ Direct form submission failed!');
      console.error('Status:', response.status, response.statusText);
      const error = await response.text();
      console.error('Error:', error);
    }
    
  } catch (error) {
    console.error('❌ Error with direct submission:', error.message);
  }
}

// Run tests
async function runAllTests() {
  // Test our API endpoint
  await testQuoteSubmission();
  
  // Test direct HubSpot Forms API
  await testDirectHubSpotForm();
  
  console.log('\n=== Tests Complete ===');
}

runAllTests();