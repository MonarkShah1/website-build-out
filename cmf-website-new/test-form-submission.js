import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

async function testFormSubmission() {
  const testData = {
    contact: {
      firstName: 'John',
      lastName: 'TestUser',
      email: `john.test${Date.now()}@cmftest.com`,
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
      specifications: 'Tolerance: ±0.005", Surface finish: 32 Ra'
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
      submittedAt: new Date().toISOString(),
      ipAddress: '127.0.0.1'
    }
  };

  console.log('Testing form submission...');
  console.log('Test email:', testData.contact.email);
  
  try {
    const response = await fetch('http://localhost:4321/api/submit-quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Form submitted successfully!');
      console.log('Response:', JSON.stringify(result, null, 2));
      
      if (result.hubspotContactId) {
        console.log(`\n📧 Contact created in HubSpot: ${result.hubspotContactId}`);
        console.log(`View in HubSpot: https://app.hubspot.com/contacts/47864957/contact/${result.hubspotContactId}`);
      }
      
      if (result.hubspotDealId && result.hubspotDealId !== 'pending') {
        console.log(`\n💼 Deal created in HubSpot: ${result.hubspotDealId}`);
        console.log(`View in HubSpot: https://app.hubspot.com/contacts/47864957/deal/${result.hubspotDealId}`);
      }
    } else {
      console.error('❌ Form submission failed');
      console.error('Status:', response.status);
      console.error('Response:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('❌ Error submitting form:', error.message);
  }
}

testFormSubmission();