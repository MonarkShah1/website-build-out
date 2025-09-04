# Product Requirements Document: Foundational SEO Architecture

**Project:** Canadian Metal Fabricators (CMF) Corporate Website

**Author:** Development Team

**Version:** 2.0 (Enhanced)

**Date:** September 1, 2025

**Status:** Critical Foundation Document

---

## Executive Summary

This document establishes the **non-negotiable** SEO architectural principles that must be implemented from day one. These are not optional features but foundational requirements that prevent costly refactoring later. Every developer must read and follow these principles before writing any code.

## 1. Critical SEO Foundations

### 1.1 Why This Matters
- **70% of web traffic** comes from organic search
- **First 3 Google results** get 75% of clicks
- **Page speed** is a ranking factor - every 100ms delay costs 7% in conversions
- **Mobile-first indexing** means Google primarily uses mobile version for ranking

### 1.2 Core Principles
1. **Performance First**: Every decision impacts Core Web Vitals
2. **Content Structure**: Programmatic, scalable content generation
3. **Technical Excellence**: Clean, crawlable, indexable code
4. **User Intent**: Match search intent with content structure
5. **Measurable**: Everything must be trackable and optimizable

## 2. Architectural Principles & Implementation

### Principle 1: Content Collections & Structured Data

**Target SEO Items:** Service pages, location pages, schema markup, content scaling

**Implementation Requirements:**

```typescript
// src/content/config.ts
import { z, defineCollection } from 'astro:content';

// Service Collection Schema
const servicesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().max(60), // SEO title limit
    metaDescription: z.string().min(120).max(160), // SEO description limits
    slug: z.string(),
    priority: z.number().min(0).max(1), // For sitemap
    
    // Service-specific SEO fields
    serviceType: z.enum(['laser-cutting', 'metal-bending', 'welding', 'assembly']),
    materials: z.array(z.string()),
    capabilities: z.array(z.string()),
    
    // Schema.org structured data
    schema: z.object({
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      priceRange: z.string(),
      areaServed: z.array(z.string()),
      serviceOutput: z.string(),
    }),
    
    // Content optimization
    keywords: z.object({
      primary: z.string(),
      secondary: z.array(z.string()),
      longtail: z.array(z.string()),
    }),
    
    // Internal linking
    relatedServices: z.array(z.string()),
    relatedProjects: z.array(z.string()).optional(),
    
    // Technical SEO
    canonicalUrl: z.string().optional(),
    noIndex: z.boolean().default(false),
    lastModified: z.date(),
    publishDate: z.date(),
  })
});

// Location Collection Schema
const locationsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    city: z.string(),
    province: z.string(),
    postalCode: z.string(),
    
    // Local SEO
    localBusinessSchema: z.object({
      name: z.string(),
      address: z.object({
        streetAddress: z.string(),
        addressLocality: z.string(),
        addressRegion: z.string(),
        postalCode: z.string(),
        addressCountry: z.string().default('CA'),
      }),
      geo: z.object({
        latitude: z.number(),
        longitude: z.number(),
      }),
      serviceArea: z.array(z.string()),
      openingHours: z.array(z.string()),
    }),
    
    // Location-specific content
    localContent: z.object({
      heroHeading: z.string(),
      introduction: z.string(),
      whyChooseUs: z.array(z.string()),
      localProjects: z.array(z.string()).optional(),
      testimonials: z.array(z.string()).optional(),
    }),
    
    // SEO metadata
    metaTitle: z.string().max(60),
    metaDescription: z.string().min(120).max(160),
    keywords: z.array(z.string()),
  })
});

// Projects/Case Studies Collection
const projectsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    client: z.string().optional(),
    industry: z.string(),
    services: z.array(z.string()),
    
    // SEO optimization
    metaDescription: z.string().max(160),
    featuredImage: z.object({
      src: z.string(),
      alt: z.string().max(125), // Alt text SEO limit
      caption: z.string().optional(),
    }),
    gallery: z.array(z.object({
      src: z.string(),
      alt: z.string(),
      width: z.number(),
      height: z.number(),
    })).optional(),
    
    // Content
    challenge: z.string(),
    solution: z.string(),
    results: z.array(z.string()),
    
    // Schema markup
    projectSchema: z.object({
      completionDate: z.date(),
      materials: z.array(z.string()),
      techniques: z.array(z.string()),
    }),
  })
});

export const collections = {
  services: servicesCollection,
  locations: locationsCollection,
  projects: projectsCollection,
};
```

### Principle 2: URL Structure & Information Architecture

**Implementation Requirements:**

```typescript
// src/utils/urlStructure.ts

export const URL_PATTERNS = {
  // Primary pages
  home: '/',
  about: '/about',
  contact: '/contact',
  quote: '/instant-quote',
  
  // Service pages (keyword-rich URLs)
  serviceHub: '/metal-fabrication-services',
  serviceDetail: '/metal-fabrication-services/[service-slug]',
  // Examples:
  // /metal-fabrication-services/laser-cutting-toronto
  // /metal-fabrication-services/custom-metal-bending
  
  // Location pages (local SEO)
  locationHub: '/locations',
  locationDetail: '/metal-fabrication-[city]-[province]',
  // Examples:
  // /metal-fabrication-toronto-ontario
  // /metal-fabrication-mississauga-ontario
  
  // Service + Location combinations (high-value SEO)
  serviceLocation: '/[service]-[city]',
  // Examples:
  // /laser-cutting-toronto
  // /metal-welding-mississauga
  
  // Content/Resources (topical authority)
  blog: '/resources',
  blogPost: '/resources/[slug]',
  guides: '/guides',
  guide: '/guides/[slug]',
  
  // Projects/Portfolio (trust signals)
  projects: '/projects',
  projectDetail: '/projects/[slug]',
  
  // Legal/Trust pages
  privacy: '/privacy-policy',
  terms: '/terms-of-service',
  sitemap: '/sitemap.xml',
  robots: '/robots.txt',
} as const;

// Breadcrumb generation
export function generateBreadcrumbs(pathname: string) {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs = [
    { name: 'Home', path: '/', position: 1 }
  ];
  
  let currentPath = '';
  paths.forEach((path, index) => {
    currentPath += `/${path}`;
    breadcrumbs.push({
      name: path.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      path: currentPath,
      position: index + 2
    });
  });
  
  return breadcrumbs;
}
```

### Principle 3: SEO Component Architecture

**Implementation Requirements:**

```typescript
// src/components/SEO.astro
---
import { generateSchema } from '../utils/schema';
import { generateOgImage } from '../utils/ogImage';

export interface SEOProps {
  // Basic meta
  title: string;
  description: string;
  keywords?: string[];
  
  // URLs
  canonicalURL?: string;
  alternateURLs?: { lang: string; url: string }[];
  
  // Open Graph
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  ogImageAlt?: string;
  
  // Twitter Card
  twitterCard?: 'summary' | 'summary_large_image';
  twitterCreator?: string;
  
  // Schema.org
  schemaType?: 'Organization' | 'LocalBusiness' | 'Service' | 'Product' | 'Article';
  schemaData?: Record<string, any>;
  
  // Robots
  noIndex?: boolean;
  noFollow?: boolean;
  
  // Additional
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
}

const {
  title,
  description,
  keywords = [],
  canonicalURL = Astro.url.href,
  alternateURLs = [],
  ogType = 'website',
  ogImage,
  ogImageAlt,
  twitterCard = 'summary_large_image',
  twitterCreator = '@cmf_metal',
  schemaType = 'Organization',
  schemaData = {},
  noIndex = false,
  noFollow = false,
  publishedTime,
  modifiedTime,
  author,
  section,
} = Astro.props;

// Generate dynamic OG image if not provided
const finalOgImage = ogImage || await generateOgImage({ title, description });

// Generate comprehensive schema
const schema = generateSchema(schemaType, {
  ...schemaData,
  url: canonicalURL,
  name: title,
  description,
});
---

<!-- Primary Meta Tags -->
<title>{title} | Canadian Metal Fabricators</title>
<meta name="title" content={`${title} | Canadian Metal Fabricators`} />
<meta name="description" content={description} />
{keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}

<!-- Canonical and Alternate URLs -->
<link rel="canonical" href={canonicalURL} />
{alternateURLs.map(({ lang, url }) => (
  <link rel="alternate" hreflang={lang} href={url} />
))}

<!-- Open Graph / Facebook -->
<meta property="og:type" content={ogType} />
<meta property="og:url" content={canonicalURL} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={finalOgImage} />
{ogImageAlt && <meta property="og:image:alt" content={ogImageAlt} />}
<meta property="og:site_name" content="Canadian Metal Fabricators" />
<meta property="og:locale" content="en_CA" />

<!-- Twitter -->
<meta property="twitter:card" content={twitterCard} />
<meta property="twitter:url" content={canonicalURL} />
<meta property="twitter:title" content={title} />
<meta property="twitter:description" content={description} />
<meta property="twitter:image" content={finalOgImage} />
{twitterCreator && <meta property="twitter:creator" content={twitterCreator} />}

<!-- Article specific -->
{publishedTime && <meta property="article:published_time" content={publishedTime} />}
{modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
{author && <meta property="article:author" content={author} />}
{section && <meta property="article:section" content={section} />}

<!-- Robots -->
{(noIndex || noFollow) && (
  <meta name="robots" content={`${noIndex ? 'noindex' : 'index'}, ${noFollow ? 'nofollow' : 'follow'}`} />
)}

<!-- Schema.org structured data -->
<script type="application/ld+json" set:html={JSON.stringify(schema)} />

<!-- Preconnect to external domains -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://www.googletagmanager.com" />
<link rel="preconnect" href="https://www.google-analytics.com" />

<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
```

### Principle 4: Performance & Core Web Vitals

**Implementation Requirements:**

```typescript
// src/utils/performance.ts

export const PERFORMANCE_BUDGET = {
  // JavaScript bundles
  js: {
    critical: 50 * 1024,     // 50KB for critical JS
    main: 200 * 1024,        // 200KB for main bundle
    vendor: 150 * 1024,      // 150KB for vendor bundle
    total: 400 * 1024,       // 400KB total JS
  },
  
  // CSS
  css: {
    critical: 14 * 1024,     // 14KB inlined critical CSS
    main: 50 * 1024,         // 50KB main CSS
    total: 64 * 1024,        // 64KB total CSS
  },
  
  // Images
  images: {
    hero: 100 * 1024,        // 100KB for hero images
    content: 50 * 1024,      // 50KB for content images
    thumbnail: 20 * 1024,    // 20KB for thumbnails
  },
  
  // Core Web Vitals targets
  vitals: {
    LCP: 2500,               // Largest Contentful Paint < 2.5s
    FID: 100,                // First Input Delay < 100ms
    CLS: 0.1,                // Cumulative Layout Shift < 0.1
    FCP: 1800,               // First Contentful Paint < 1.8s
    TTFB: 800,               // Time to First Byte < 800ms
  }
};

// Resource hints generator
export function generateResourceHints(page: string) {
  const hints = [];
  
  // DNS prefetch for external domains
  hints.push({ rel: 'dns-prefetch', href: '//fonts.googleapis.com' });
  hints.push({ rel: 'dns-prefetch', href: '//www.googletagmanager.com' });
  
  // Preconnect for critical domains
  hints.push({ rel: 'preconnect', href: 'https://fonts.googleapis.com' });
  
  // Prefetch next likely navigation
  const prefetchMap = {
    '/': ['/instant-quote', '/metal-fabrication-services'],
    '/metal-fabrication-services': ['/instant-quote', '/laser-cutting-toronto'],
    '/about': ['/instant-quote', '/contact'],
  };
  
  if (prefetchMap[page]) {
    prefetchMap[page].forEach(url => {
      hints.push({ rel: 'prefetch', href: url });
    });
  }
  
  return hints;
}
```

### Principle 5: Image Optimization Strategy

**Implementation Requirements:**

```typescript
// src/components/OptimizedImage.astro
---
import { Image } from 'astro:assets';

export interface Props {
  src: string;
  alt: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  widths?: number[];
  formats?: Array<'webp' | 'avif' | 'jpg'>;
  quality?: number;
  class?: string;
  
  // SEO specific
  title?: string;
  caption?: string;
  isHero?: boolean;
  priority?: boolean;
}

const {
  src,
  alt,
  loading = 'lazy',
  sizes = '100vw',
  widths = [320, 640, 768, 1024, 1280, 1920],
  formats = ['avif', 'webp'],
  quality = 80,
  class: className,
  title,
  caption,
  isHero = false,
  priority = false,
} = Astro.props;

// Hero images get special treatment
if (isHero) {
  loading = 'eager';
  priority = true;
  quality = 85;
}

// Generate srcset for responsive images
const imageProps = {
  src,
  alt,
  loading,
  widths,
  sizes,
  formats,
  quality,
  class: className,
  title,
  decoding: priority ? 'sync' : 'async',
  fetchpriority: priority ? 'high' : 'auto',
};
---

<figure class="optimized-image">
  <Image {...imageProps} />
  {caption && (
    <figcaption>{caption}</figcaption>
  )}
</figure>

<style>
  .optimized-image {
    margin: 0;
    width: 100%;
  }
  
  .optimized-image img {
    width: 100%;
    height: auto;
    display: block;
  }
  
  figcaption {
    font-size: 0.875rem;
    color: var(--gray-600);
    margin-top: 0.5rem;
    text-align: center;
  }
</style>
```

## 3. Technical SEO Implementation

### 3.1 Sitemap Generation

```typescript
// src/pages/sitemap.xml.ts
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const services = await getCollection('services');
  const locations = await getCollection('locations');
  const projects = await getCollection('projects');
  
  const staticPages = [
    { url: '/', priority: 1.0, changefreq: 'daily' },
    { url: '/instant-quote', priority: 0.9, changefreq: 'weekly' },
    { url: '/metal-fabrication-services', priority: 0.9, changefreq: 'weekly' },
    { url: '/about', priority: 0.7, changefreq: 'monthly' },
    { url: '/contact', priority: 0.7, changefreq: 'monthly' },
  ];
  
  const servicePages = services.map(service => ({
    url: `/metal-fabrication-services/${service.slug}`,
    priority: 0.8,
    changefreq: 'weekly',
    lastmod: service.data.lastModified,
  }));
  
  const locationPages = locations.map(location => ({
    url: `/metal-fabrication-${location.data.city.toLowerCase()}-${location.data.province.toLowerCase()}`,
    priority: 0.8,
    changefreq: 'weekly',
  }));
  
  const projectPages = projects.map(project => ({
    url: `/projects/${project.slug}`,
    priority: 0.6,
    changefreq: 'monthly',
  }));
  
  const allPages = [
    ...staticPages,
    ...servicePages,
    ...locationPages,
    ...projectPages,
  ];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${allPages.map(page => `
        <url>
          <loc>${site}${page.url}</loc>
          <changefreq>${page.changefreq}</changefreq>
          <priority>${page.priority}</priority>
          ${page.lastmod ? `<lastmod>${page.lastmod.toISOString()}</lastmod>` : ''}
        </url>
      `).join('')}
    </urlset>`;
  
  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
```

### 3.2 Robots.txt Configuration

```text
# public/robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /*.json$
Disallow: /*?*utm_*
Disallow: /*?*ref=*

# Sitemap location
Sitemap: https://www.canadianmetalfab.com/sitemap.xml

# Crawl delay for respectful crawling
Crawl-delay: 1

# Specific bot rules
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Bingbot
Allow: /
Crawl-delay: 0

# Block bad bots
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Crawl-delay: 10
```

### 3.3 Schema.org Implementation

```typescript
// src/utils/schema.ts

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://www.canadianmetalfab.com/#organization",
    "name": "Canadian Metal Fabricators",
    "alternateName": "CMF",
    "url": "https://www.canadianmetalfab.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.canadianmetalfab.com/logo.png",
      "width": 600,
      "height": 60
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-416-555-0123",
      "contactType": "customer service",
      "areaServed": "CA",
      "availableLanguage": ["en", "fr"]
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Industrial Way",
      "addressLocality": "Toronto",
      "addressRegion": "ON",
      "postalCode": "M1B 2C3",
      "addressCountry": "CA"
    },
    "sameAs": [
      "https://www.facebook.com/cmfmetal",
      "https://www.linkedin.com/company/canadian-metal-fabricators",
      "https://twitter.com/cmf_metal"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Metal Fabrication Services",
      "itemListElement": [
        {
          "@type": "Service",
          "name": "Laser Cutting",
          "description": "Precision laser cutting services for metal sheets"
        },
        {
          "@type": "Service",
          "name": "Metal Bending",
          "description": "CNC press brake bending services"
        },
        {
          "@type": "Service",
          "name": "Welding",
          "description": "Professional MIG, TIG, and spot welding"
        }
      ]
    }
  };
}

export function generateServiceSchema(service: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": service.title,
    "provider": {
      "@type": "Organization",
      "@id": "https://www.canadianmetalfab.com/#organization"
    },
    "areaServed": {
      "@type": "State",
      "name": "Ontario"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": service.title,
      "itemListElement": service.capabilities.map((cap: string) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": cap
        }
      }))
    }
  };
}

export function generateLocalBusinessSchema(location: any) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `Canadian Metal Fabricators - ${location.city}`,
    "image": "https://www.canadianmetalfab.com/locations/" + location.city.toLowerCase() + ".jpg",
    "@id": `https://www.canadianmetalfab.com/#${location.city.toLowerCase()}`,
    "url": `https://www.canadianmetalfab.com/metal-fabrication-${location.city.toLowerCase()}-ontario`,
    "telephone": "+1-416-555-0123",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": location.address.streetAddress,
      "addressLocality": location.city,
      "addressRegion": "ON",
      "postalCode": location.postalCode,
      "addressCountry": "CA"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": location.geo.latitude,
      "longitude": location.geo.longitude
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "08:00",
      "closes": "17:00"
    },
    "priceRange": "$$"
  };
}

export function generateBreadcrumbSchema(breadcrumbs: any[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": `https://www.canadianmetalfab.com${crumb.path}`
    }))
  };
}

export function generateFAQSchema(faqs: any[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}
```

## 4. Content Strategy & Keyword Mapping

### 4.1 Primary Keyword Strategy

```typescript
// src/data/keywords.ts

export const KEYWORD_MAP = {
  // Primary service keywords (high volume, high competition)
  primary: {
    'laser cutting': {
      volume: 5400,
      difficulty: 65,
      intent: 'commercial',
      variations: [
        'laser cutting services',
        'laser cutting near me',
        'metal laser cutting',
        'precision laser cutting'
      ]
    },
    'metal fabrication': {
      volume: 8100,
      difficulty: 70,
      intent: 'commercial',
      variations: [
        'metal fabrication services',
        'custom metal fabrication',
        'metal fabrication near me',
        'metal fabricators'
      ]
    },
    'sheet metal bending': {
      volume: 2900,
      difficulty: 55,
      intent: 'commercial',
      variations: [
        'metal bending services',
        'CNC bending',
        'press brake services',
        'sheet metal forming'
      ]
    }
  },
  
  // Location-based keywords (medium volume, medium competition)
  local: {
    'metal fabrication toronto': {
      volume: 720,
      difficulty: 45,
      intent: 'transactional',
      neighbourhoods: [
        'metal fabrication scarborough',
        'metal fabrication north york',
        'metal fabrication etobicoke',
        'metal fabrication downtown toronto'
      ]
    },
    'laser cutting toronto': {
      volume: 390,
      difficulty: 40,
      intent: 'transactional'
    }
  },
  
  // Long-tail keywords (low volume, low competition, high conversion)
  longtail: {
    'custom metal parts small batch': {
      volume: 50,
      difficulty: 20,
      intent: 'transactional',
      value: 'high'
    },
    'prototype metal fabrication services': {
      volume: 70,
      difficulty: 25,
      intent: 'transactional',
      value: 'high'
    },
    'instant quote metal fabrication': {
      volume: 30,
      difficulty: 15,
      intent: 'transactional',
      value: 'very high'
    }
  },
  
  // Industry-specific keywords
  industry: {
    'architectural metal fabrication': {
      volume: 210,
      difficulty: 35,
      industries: ['construction', 'architecture', 'design']
    },
    'automotive metal parts': {
      volume: 320,
      difficulty: 40,
      industries: ['automotive', 'transportation', 'racing']
    }
  }
};

// Content mapping function
export function mapKeywordsToContent(pageType: string, location?: string, service?: string) {
  const keywords = [];
  
  if (pageType === 'service' && service) {
    keywords.push(KEYWORD_MAP.primary[service]);
    if (location) {
      keywords.push(`${service} ${location}`);
    }
  }
  
  if (pageType === 'location' && location) {
    Object.keys(KEYWORD_MAP.primary).forEach(service => {
      keywords.push(`${service} ${location}`);
    });
  }
  
  return keywords;
}
```

### 4.2 Content Templates

```typescript
// src/templates/seo-content.ts

export const SERVICE_PAGE_TEMPLATE = {
  hero: {
    h1: "[Service Name] Services in [Location]",
    subheading: "Professional [service] with [unique value prop]"
  },
  
  sections: [
    {
      heading: "Expert [Service Name] Solutions",
      content: "Minimum 300 words about the service, benefits, and process"
    },
    {
      heading: "Why Choose CMF for [Service Name]",
      content: "Trust signals, certifications, experience"
    },
    {
      heading: "[Service Name] Capabilities",
      content: "Technical specifications, materials, tolerances"
    },
    {
      heading: "Industries We Serve",
      content: "Industry-specific applications and case studies"
    },
    {
      heading: "Get an Instant Quote for [Service Name]",
      content: "CTA section with form or link"
    }
  ],
  
  faq: [
    "What materials can you [service verb]?",
    "What is the turnaround time for [service]?",
    "What file formats do you accept for [service]?",
    "What are the tolerances for [service]?",
    "How much does [service] cost?"
  ]
};

export const LOCATION_PAGE_TEMPLATE = {
  hero: {
    h1: "Metal Fabrication Services in [City], [Province]",
    subheading: "Serving [City] and surrounding areas with fast, reliable metal fabrication"
  },
  
  sections: [
    {
      heading: "Local Metal Fabrication in [City]",
      content: "Location-specific content with local landmarks, service areas"
    },
    {
      heading: "Our [City] Services",
      content: "List of all services available in this location"
    },
    {
      heading: "Why [City] Businesses Choose CMF",
      content: "Local testimonials, case studies, partnerships"
    },
    {
      heading: "Fast Delivery to [City] and Beyond",
      content: "Delivery areas, timing, logistics"
    }
  ]
};
```

## 5. Technical SEO Monitoring

### 5.1 Analytics Implementation

```typescript
// src/components/Analytics.astro
---
const GA_ID = import.meta.env.PUBLIC_GA_ID;
const GTM_ID = import.meta.env.PUBLIC_GTM_ID;
---

<!-- Google Tag Manager -->
<script is:inline define:vars={{ GTM_ID }}>
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer',GTM_ID);
</script>

<!-- Google Analytics -->
<script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}></script>
<script is:inline define:vars={{ GA_ID }}>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', GA_ID, {
    page_path: window.location.pathname,
    custom_map: {
      'dimension1': 'page_type',
      'dimension2': 'service_type',
      'dimension3': 'location'
    }
  });
</script>

<!-- Schema for WebSite SearchAction -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "url": "https://www.canadianmetalfab.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.canadianmetalfab.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
</script>
```

### 5.2 Core Web Vitals Monitoring

```typescript
// src/utils/webVitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Send to Google Analytics
  if (window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
    });
  }
  
  // Send to custom monitoring endpoint
  if (navigator.sendBeacon) {
    const data = JSON.stringify({
      metric: metric.name,
      value: metric.value,
      id: metric.id,
      page: window.location.pathname,
      timestamp: Date.now()
    });
    
    navigator.sendBeacon('/api/metrics', data);
  }
}

export function initWebVitals() {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}

// Performance observer for custom metrics
export function observePerformance() {
  if ('PerformanceObserver' in window) {
    // Observe long tasks
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          console.warn('Long task detected:', entry);
          sendToAnalytics({
            name: 'long_task',
            value: entry.duration,
            id: entry.name
          });
        }
      }
    });
    
    longTaskObserver.observe({ entryTypes: ['longtask'] });
    
    // Observe layout shifts
    const layoutShiftObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          sendToAnalytics({
            name: 'layout_shift',
            value: entry.value,
            id: entry.startTime
          });
        }
      }
    });
    
    layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
  }
}
```

## 6. Implementation Checklist

### 6.1 Phase 1: Foundation (Week 1)
- [ ] Set up Astro with TypeScript strict mode
- [ ] Configure content collections with schemas
- [ ] Implement SEO component
- [ ] Set up image optimization pipeline
- [ ] Create robots.txt and initial sitemap
- [ ] Implement performance monitoring

### 6.2 Phase 2: Content Structure (Week 2)
- [ ] Create service content with keyword mapping
- [ ] Build location pages with local SEO
- [ ] Implement schema.org for all page types
- [ ] Set up breadcrumb navigation
- [ ] Create URL redirect map for old URLs

### 6.3 Phase 3: Technical Optimization (Week 3)
- [ ] Implement critical CSS extraction
- [ ] Set up resource hints and prefetching
- [ ] Configure CDN and caching headers
- [ ] Implement lazy loading for all images
- [ ] Add Web Vitals monitoring

### 6.4 Phase 4: Content & Link Building (Week 4)
- [ ] Create 10 location-specific pages
- [ ] Build 5 detailed service pages
- [ ] Add 20 FAQ entries with schema
- [ ] Implement internal linking strategy
- [ ] Set up blog/resources section

## 7. Monitoring & KPIs

### 7.1 Technical SEO KPIs
- **Crawlability**: 100% of pages indexed
- **Site Speed**: Core Web Vitals all green
- **Mobile Score**: 95+ on PageSpeed Insights
- **Schema Validation**: 0 errors in Rich Results Test

### 7.2 Organic Performance KPIs
- **Organic Traffic**: 50% increase in 6 months
- **Keyword Rankings**: Top 3 for 10 primary keywords
- **Local Pack**: Appear in top 3 for "[service] near me"
- **CTR**: > 5% for primary keywords

### 7.3 Conversion KPIs
- **Organic Conversion Rate**: > 3%
- **Quote Form Completions**: 100+ per month
- **Phone Calls from Organic**: 50+ per month
- **Time on Site**: > 2 minutes average

## 8. Critical Implementation Rules

### MUST DO:
1. **Every page** must have unique title and meta description
2. **Every image** must have descriptive alt text
3. **Every page** must load in under 3 seconds
4. **Every form** must work without JavaScript
5. **Every URL** must be human-readable and keyword-rich

### NEVER DO:
1. **Never** duplicate content between pages
2. **Never** use generic anchor text for internal links
3. **Never** block CSS or JS in robots.txt
4. **Never** use infinite scroll without pagination
5. **Never** hide content from users that's shown to search engines

## 9. Recovery & Contingency

### 9.1 If Rankings Drop:
1. Check Search Console for manual penalties
2. Verify robots.txt and sitemap
3. Check for crawl errors
4. Review recent deployments for issues
5. Analyze competitor movements

### 9.2 If Site Speed Degrades:
1. Run Lighthouse audit
2. Check image sizes and formats
3. Review third-party scripts
4. Analyze JavaScript bundle size
5. Check server response times

---

## Appendix A: Tool Requirements

### Required Tools:
- Google Search Console (verified)
- Google Analytics 4 (configured)
- Google Tag Manager (installed)
- Bing Webmaster Tools (verified)
- Schema Markup Validator
- PageSpeed Insights API key
- Screaming Frog or similar crawler

## Appendix B: Content Calendar

### Month 1:
- 10 service pages
- 5 location pages
- 20 FAQs

### Month 2:
- 5 case studies
- 10 blog posts
- 10 more location pages

### Month 3:
- Industry-specific landing pages
- Comparison pages
- Resource guides

## Appendix C: Competitor Analysis

Track and monitor:
- Competitor keyword rankings
- New content published
- Backlink acquisition
- Technical improvements
- SERP feature captures

---

**This document is law. Every developer must follow these principles or risk destroying our SEO potential.**