import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({
    status: 'API is working',
    timestamp: new Date().toISOString(),
    version: '1.1.0',
    hasDetailedLogging: true,
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      PUBLIC_ENV: process.env.PUBLIC_ENV || import.meta.env.PUBLIC_ENV,
    }
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
};