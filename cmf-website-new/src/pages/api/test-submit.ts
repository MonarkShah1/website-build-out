import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('=== Test Submit Started ===');
    
    // Create minimal hero form data
    const testFormData = {
      contact: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '416-555-0000',
        company: 'Test Company',
        jobTitle: '',
      },
      project: {
        projectName: 'Test Project',
        description: 'This is a test project description for debugging purposes.',
        projectType: 'custom-fabrication',
        material: 'steel',
        quantity: 1,
        requiredDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        thickness: '0.25',
        budget: '1k-5k',
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
      tracking: {
        hutk: 'test-hutk',
        pageUri: 'https://test.com',
        pageName: 'Test Page',
      }
    };

    console.log('Test form data created:', JSON.stringify(testFormData, null, 2));

    // Import the schema to test validation
    const { quoteFormSchema } = await import('../../schemas/quoteFormSchema');
    
    console.log('Testing schema validation...');
    const validationResult = quoteFormSchema.safeParse(testFormData);
    
    if (!validationResult.success) {
      console.error('Validation failed:', validationResult.error.errors);
      return new Response(JSON.stringify({
        success: false,
        step: 'validation',
        errors: validationResult.error.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Validation passed! Testing HubSpot submission...');

    // Test HubSpot submission
    const { submitQuoteToHubSpot } = await import('../../utils/hubspot');
    
    const hubspotResult = await submitQuoteToHubSpot(
      validationResult.data,
      [],
      {
        hutk: 'test-hutk',
        pageUri: 'https://test.com',
        pageName: 'Test Page'
      }
    );

    console.log('HubSpot submission successful:', hubspotResult);

    return new Response(JSON.stringify({
      success: true,
      step: 'completed',
      hubspotResult,
      message: 'Test submission completed successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Test submission error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'Unknown error');
    
    return new Response(JSON.stringify({
      success: false,
      step: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};