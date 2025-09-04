import { z, defineCollection } from 'astro:content';

// Service Collection Schema - Critical for SEO
const servicesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    // SEO Critical Fields
    title: z.string().max(60, 'Title must be under 60 characters for SEO'),
    metaDescription: z.string().min(120).max(160, 'Description must be 120-160 characters'),
    priority: z.number().min(0).max(1).default(0.8),
    
    // Service-specific SEO fields
    serviceType: z.enum(['laser-cutting', 'metal-bending', 'welding', 'assembly', 'metal-fabrication']),
    materials: z.array(z.string()),
    capabilities: z.array(z.string()),
    
    // Schema.org structured data
    schema: z.object({
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      priceRange: z.string().default('$$'),
      areaServed: z.array(z.string()).default(['Toronto', 'GTA', 'Ontario']),
      serviceOutput: z.string(),
    }),
    
    // Content optimization
    keywords: z.object({
      primary: z.string(),
      secondary: z.array(z.string()),
      longtail: z.array(z.string()),
    }),
    
    // Internal linking for SEO
    relatedServices: z.array(z.string()).optional(),
    relatedProjects: z.array(z.string()).optional(),
    
    // Technical SEO
    canonicalUrl: z.string().optional(),
    noIndex: z.boolean().default(false),
    lastModified: z.date(),
    publishDate: z.date(),
  })
});

// Location Collection Schema - Critical for Local SEO
const locationsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    city: z.string(),
    province: z.string().default('Ontario'),
    postalCode: z.string(),
    
    // Local SEO
    localBusinessSchema: z.object({
      name: z.string(),
      address: z.object({
        streetAddress: z.string(),
        addressLocality: z.string(),
        addressRegion: z.string().default('ON'),
        postalCode: z.string(),
        addressCountry: z.string().default('CA'),
      }),
      geo: z.object({
        latitude: z.number(),
        longitude: z.number(),
      }),
      serviceArea: z.array(z.string()),
      openingHours: z.array(z.string()).default([
        'Mo-Fr 08:00-17:00',
        'Sa 09:00-14:00',
      ]),
    }),
    
    // Location-specific content
    localContent: z.object({
      heroHeading: z.string(),
      introduction: z.string().min(150),
      whyChooseUs: z.array(z.string()).min(3),
      localProjects: z.array(z.string()).optional(),
      testimonials: z.array(z.object({
        author: z.string(),
        company: z.string(),
        content: z.string(),
        rating: z.number().min(1).max(5),
      })).optional(),
    }),
    
    // SEO metadata
    metaTitle: z.string().max(60),
    metaDescription: z.string().min(120).max(160),
    keywords: z.array(z.string()).min(5),
    priority: z.number().min(0).max(1).default(0.8),
  })
});

// Projects/Case Studies Collection - Trust signals for SEO
const projectsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().max(60),
    client: z.string().optional(),
    industry: z.string(),
    services: z.array(z.string()),
    
    // SEO optimization
    metaDescription: z.string().max(160),
    featuredImage: z.object({
      src: z.string(),
      alt: z.string().max(125, 'Alt text should be under 125 characters'),
      caption: z.string().optional(),
      width: z.number(),
      height: z.number(),
    }),
    gallery: z.array(z.object({
      src: z.string(),
      alt: z.string().max(125),
      width: z.number(),
      height: z.number(),
    })).optional(),
    
    // Content
    challenge: z.string().min(100),
    solution: z.string().min(150),
    results: z.array(z.string()).min(2),
    testimonial: z.string().optional(),
    
    // Schema markup
    projectSchema: z.object({
      completionDate: z.date(),
      materials: z.array(z.string()),
      techniques: z.array(z.string()),
      duration: z.string().optional(),
      budget: z.string().optional(),
    }),
    
    // SEO
    keywords: z.array(z.string()),
    priority: z.number().min(0).max(1).default(0.6),
    publishDate: z.date(),
  })
});

// FAQ Collection - For FAQ Schema
const faqCollection = defineCollection({
  type: 'data',
  schema: z.object({
    question: z.string(),
    answer: z.string().min(50),
    category: z.enum(['general', 'pricing', 'technical', 'delivery', 'materials']),
    priority: z.number().min(0).max(10),
    keywords: z.array(z.string()),
  })
});

export const collections = {
  services: servicesCollection,
  locations: locationsCollection,
  projects: projectsCollection,
  faq: faqCollection,
};