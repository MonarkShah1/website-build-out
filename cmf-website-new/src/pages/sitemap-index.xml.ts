/**
 * Dynamic Sitemap Generation
 * CRITICAL for SEO - ensures all pages are discoverable by search engines
 */

import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ site }) => {
  // This creates a sitemap index that points to individual sitemaps
  const sitemaps = [
    'sitemap-pages.xml',
    'sitemap-services.xml',
    'sitemap-locations.xml',
    'sitemap-projects.xml',
  ];

  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(sitemap => `  <sitemap>
    <loc>${site}${sitemap}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

  return new Response(sitemapIndex, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
};