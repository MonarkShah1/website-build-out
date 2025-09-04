import { Client } from '@hubspot/api-client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const apiKey = process.env.HUBSPOT_API_KEY;
console.log('Testing HubSpot Connection...');
console.log('API Key loaded:', apiKey ? `Yes (${apiKey.substring(0, 10)}...)` : 'No');

if (!apiKey || apiKey === 'your_private_api_key_here') {
  console.error('❌ API Key not configured properly');
  process.exit(1);
}

const client = new Client({ accessToken: apiKey.trim() });

async function testConnection() {
  try {
    // Test 1: Get account info
    console.log('\n1. Testing API connection...');
    const accountInfo = await client.apiRequest({
      method: 'GET',
      path: '/account-info/v3/details'
    });
    console.log('✅ API connection successful!');
    console.log('Portal ID:', accountInfo.body.portalId);
    
    // Test 2: List recent contacts
    console.log('\n2. Fetching recent contacts...');
    const contacts = await client.crm.contacts.basicApi.getPage(5);
    console.log(`✅ Found ${contacts.results.length} contacts`);
    
    if (contacts.results.length > 0) {
      console.log('Recent contacts:');
      contacts.results.forEach((contact, i) => {
        console.log(`  ${i + 1}. ${contact.properties.firstname || 'N/A'} ${contact.properties.lastname || 'N/A'} - ${contact.properties.email}`);
      });
    }
    
    // Test 3: Create test contact
    console.log('\n3. Creating test contact...');
    const testEmail = `test_${Date.now()}@cmftest.com`;
    
    try {
      const newContact = await client.crm.contacts.basicApi.create({
        properties: {
          email: testEmail,
          firstname: 'Test',
          lastname: 'Contact',
          company: 'CMF Test Company',
          lifecyclestage: 'lead'
        }
      });
      console.log('✅ Test contact created successfully!');
      console.log('Contact ID:', newContact.id);
      console.log('Email:', testEmail);
      
      // Clean up - delete test contact
      console.log('\n4. Cleaning up test contact...');
      await client.crm.contacts.basicApi.archive(newContact.id);
      console.log('✅ Test contact deleted');
      
    } catch (error) {
      if (error.code === 409) {
        console.log('⚠️  Contact already exists (expected for duplicate tests)');
      } else {
        throw error;
      }
    }
    
    console.log('\n🎉 All tests passed! HubSpot integration is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.body) {
      console.error('Details:', JSON.stringify(error.body, null, 2));
    }
    process.exit(1);
  }
}

testConnection();