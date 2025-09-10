import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      PUBLIC_ENV: process.env.PUBLIC_ENV || import.meta.env.PUBLIC_ENV,
    },
    hubspot: {
      hasApiKey: !!(process.env.HUBSPOT_API_KEY || import.meta.env.HUBSPOT_API_KEY),
      apiKeyPrefix: process.env.HUBSPOT_API_KEY 
        ? process.env.HUBSPOT_API_KEY.substring(0, 10) + '...' 
        : (import.meta.env.HUBSPOT_API_KEY 
          ? import.meta.env.HUBSPOT_API_KEY.substring(0, 10) + '...' 
          : 'NOT_FOUND'),
      hasPortalId: !!(process.env.PUBLIC_HUBSPOT_PORTAL_ID || import.meta.env.PUBLIC_HUBSPOT_PORTAL_ID),
      portalId: process.env.PUBLIC_HUBSPOT_PORTAL_ID || import.meta.env.PUBLIC_HUBSPOT_PORTAL_ID || 'NOT_FOUND',
      hasFormGuid: !!(process.env.PUBLIC_HUBSPOT_FORM_GUID || import.meta.env.PUBLIC_HUBSPOT_FORM_GUID),
      formGuid: process.env.PUBLIC_HUBSPOT_FORM_GUID || import.meta.env.PUBLIC_HUBSPOT_FORM_GUID || 'NOT_FOUND',
      region: process.env.HUBSPOT_REGION || import.meta.env.HUBSPOT_REGION || 'NOT_SET',
    },
    other: {
      hasNotificationEmail: !!(process.env.NOTIFICATION_EMAIL || import.meta.env.NOTIFICATION_EMAIL),
      notificationEmail: process.env.NOTIFICATION_EMAIL || import.meta.env.NOTIFICATION_EMAIL || 'NOT_SET',
    },
    runtime: {
      isServer: typeof window === 'undefined',
      platform: process.platform || 'unknown',
      nodeVersion: process.version || 'unknown',
    }
  };

  return new Response(JSON.stringify(diagnostics, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
};