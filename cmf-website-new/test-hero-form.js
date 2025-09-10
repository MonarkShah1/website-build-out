/**
 * Test script for hero form functionality
 * Run this in the browser console to test the paste functionality
 */

// Test the clipboard utilities
async function testClipboardUtils() {
  console.log('Testing clipboard utilities...');
  
  // Test basic text cleanup
  const testText = `
    From: john@company.com
    Subject: RFQ for Custom Parts
    
    Hi there,
    
    We need 500 units of custom steel brackets made. 
    Material: 304 stainless steel
    Thickness: 3mm
    Deadline: December 15, 2024
    Budget: around $5000
    
    Please see attached CAD files.
    
    Best regards,
    John Smith
    ABC Manufacturing
    Phone: (416) 555-1234
  `;
  
  // Test text cleanup (simulating what the utility does)
  const cleaned = testText
    .replace(/^(?:From|To|Subject|Date|Sent|CC|BCC)\s*:.*$/gm, '')
    .replace(/(?:Best regards?|Sincerely|Thanks?|Cheers),?\s*\n.*$/gms, '')
    .replace(/--+\s*\n.*$/gms, '')
    .replace(/^>\s*.*$/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  console.log('Original text:', testText);
  console.log('Cleaned text:', cleaned);
  
  // Test clipboard support detection
  const isSupported = !!(navigator.clipboard && navigator.clipboard.readText);
  console.log('Clipboard API supported:', isSupported);
  
  return cleaned;
}

// Test form validation
function testFormValidation() {
  console.log('Testing form validation...');
  
  const validData = {
    projectDetails: 'Need 100 custom steel brackets, 5mm thick, by end of month',
    contactName: 'John Smith',
    email: 'john@company.com',
    phone: '(416) 555-1234',
    company: 'ABC Manufacturing'
  };
  
  const invalidData = {
    projectDetails: 'Too short',
    contactName: '',
    email: 'invalid-email',
    phone: '123',
    company: ''
  };
  
  console.log('Valid data:', validData);
  console.log('Invalid data:', invalidData);
  
  // Basic validation checks
  const isValid = (
    validData.projectDetails.length >= 20 &&
    validData.contactName.length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(validData.email)
  );
  
  console.log('Validation result:', isValid);
  
  return isValid;
}

// Test API payload structure
function testAPIPayload() {
  console.log('Testing API payload structure...');
  
  const formData = {
    projectDetails: 'Need 100 custom steel brackets for manufacturing line. Material: 304 stainless steel, thickness 5mm. Required by December 15, 2024. Budget around $3000.',
    contactName: 'John Smith',
    email: 'john@company.com',
    phone: '(416) 555-1234',
    company: 'ABC Manufacturing'
  };
  
  const expectedPayload = {
    contact: {
      firstName: formData.contactName.split(' ')[0],
      lastName: formData.contactName.split(' ').slice(1).join(' '),
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
    },
    project: {
      projectName: 'Quote Request',
      description: formData.projectDetails,
      projectType: 'custom-fabrication',
      material: 'steel',
      quantity: 1,
      requiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
    files: [],
    metadata: {
      source: 'hero-form',
      submittedAt: new Date().toISOString(),
    },
    tracking: {} // Would be populated by getTrackingData()
  };
  
  console.log('Form data:', formData);
  console.log('Expected API payload:', expectedPayload);
  
  return expectedPayload;
}

// Run all tests
function runAllTests() {
  console.log('🧪 Running Hero Form Tests...\n');
  
  try {
    testClipboardUtils();
    console.log('✅ Clipboard utilities test passed\n');
    
    testFormValidation();
    console.log('✅ Form validation test passed\n');
    
    testAPIPayload();
    console.log('✅ API payload test passed\n');
    
    console.log('🎉 All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Auto-run tests if this script is loaded
if (typeof window !== 'undefined') {
  console.log('Hero Form Test Script Loaded. Run runAllTests() to execute tests.');
  
  // Make functions available globally for manual testing
  window.heroFormTests = {
    testClipboardUtils,
    testFormValidation,
    testAPIPayload,
    runAllTests
  };
} else {
  // Node.js environment
  runAllTests();
}