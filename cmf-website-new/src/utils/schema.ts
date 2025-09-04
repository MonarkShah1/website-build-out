/**
 * Schema.org structured data generators
 * CRITICAL for rich snippets and search engine understanding
 */

export function generateSchema(
  type: string,
  data: Record<string, any>
): Record<string, any> {
  switch (type) {
    case 'Organization':
      return generateOrganizationSchema(data);
    case 'LocalBusiness':
      return generateLocalBusinessSchema(data);
    case 'Service':
      return generateServiceSchema(data);
    case 'Product':
      return generateProductSchema(data);
    case 'Article':
      return generateArticleSchema(data);
    case 'FAQPage':
      return generateFAQSchema(data);
    case 'BreadcrumbList':
      return generateBreadcrumbSchema(data);
    default:
      return generateOrganizationSchema(data);
  }
}

export function generateOrganizationSchema(data: any = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://www.canadianmetalfab.com/#organization",
    "name": "Canadian Metal Fabricators",
    "alternateName": "CMF",
    "url": "https://www.canadianmetalfab.com",
    "logo": {
      "@type": "ImageObject",
      "@id": "https://www.canadianmetalfab.com/#logo",
      "url": "https://www.canadianmetalfab.com/logo.png",
      "contentUrl": "https://www.canadianmetalfab.com/logo.png",
      "width": 600,
      "height": 60,
      "caption": "Canadian Metal Fabricators Logo"
    },
    "image": {
      "@id": "https://www.canadianmetalfab.com/#logo"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-416-555-0123",
      "contactType": "customer service",
      "contactOption": ["TollFree", "HearingImpairedSupported"],
      "areaServed": ["CA", "US"],
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
      "https://twitter.com/cmf_metal",
      "https://www.youtube.com/@cmfmetal"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Metal Fabrication Services",
      "itemListElement": [
        {
          "@type": "Service",
          "name": "Laser Cutting",
          "description": "Precision laser cutting services for metal sheets up to 1 inch thick"
        },
        {
          "@type": "Service",
          "name": "Metal Bending",
          "description": "CNC press brake bending services with tolerances to ±0.005\""
        },
        {
          "@type": "Service",
          "name": "Welding",
          "description": "Professional MIG, TIG, and spot welding services"
        },
        {
          "@type": "Service",
          "name": "Assembly",
          "description": "Complete assembly and finishing services"
        }
      ]
    },
    ...data
  };
}

export function generateLocalBusinessSchema(location: any) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `https://www.canadianmetalfab.com/#${location.city?.toLowerCase() || 'location'}`,
    "name": `Canadian Metal Fabricators - ${location.city || 'Toronto'}`,
    "image": [
      `https://www.canadianmetalfab.com/images/facility-${location.city?.toLowerCase() || 'toronto'}.jpg`,
      `https://www.canadianmetalfab.com/images/team-${location.city?.toLowerCase() || 'toronto'}.jpg`,
      `https://www.canadianmetalfab.com/images/equipment-${location.city?.toLowerCase() || 'toronto'}.jpg`
    ],
    "url": location.url || "https://www.canadianmetalfab.com",
    "telephone": "+1-416-555-0123",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": location.address?.streetAddress || "123 Industrial Way",
      "addressLocality": location.city || "Toronto",
      "addressRegion": "ON",
      "postalCode": location.postalCode || "M1B 2C3",
      "addressCountry": "CA"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": location.geo?.latitude || 43.6532,
      "longitude": location.geo?.longitude || -79.3832
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "08:00",
        "closes": "17:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "09:00",
        "closes": "14:00"
      }
    ],
    "hasMap": `https://maps.google.com/?q=${encodeURIComponent(location.address?.streetAddress || '123 Industrial Way')}`,
    "areaServed": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": location.geo?.latitude || 43.6532,
        "longitude": location.geo?.longitude || -79.3832
      },
      "geoRadius": "100 km"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    }
  };
}

export function generateServiceSchema(service: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `https://www.canadianmetalfab.com/#service-${service.slug || 'metal-fabrication'}`,
    "serviceType": service.title || "Metal Fabrication",
    "name": service.title || "Metal Fabrication Services",
    "description": service.description,
    "provider": {
      "@type": "Organization",
      "@id": "https://www.canadianmetalfab.com/#organization"
    },
    "areaServed": {
      "@type": "State",
      "name": "Ontario",
      "containsPlace": [
        { "@type": "City", "name": "Toronto" },
        { "@type": "City", "name": "Mississauga" },
        { "@type": "City", "name": "Brampton" },
        { "@type": "City", "name": "Vaughan" },
        { "@type": "City", "name": "Markham" }
      ]
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": service.title || "Service Catalog",
      "itemListElement": service.capabilities?.map((cap: string, index: number) => ({
        "@type": "Offer",
        "position": index + 1,
        "itemOffered": {
          "@type": "Service",
          "name": cap,
          "description": `Professional ${cap.toLowerCase()} services`
        }
      })) || []
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": service.rating || "4.9",
      "reviewCount": service.reviewCount || "89",
      "bestRating": "5",
      "worstRating": "1"
    },
    "offers": {
      "@type": "Offer",
      "priceRange": service.priceRange || "$$",
      "availability": "https://schema.org/InStock",
      "validFrom": new Date().toISOString()
    }
  };
}

export function generateProductSchema(product: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.images || [],
    "brand": {
      "@type": "Brand",
      "name": "Canadian Metal Fabricators"
    },
    "manufacturer": {
      "@type": "Organization",
      "@id": "https://www.canadianmetalfab.com/#organization"
    },
    "offers": {
      "@type": "Offer",
      "url": product.url,
      "priceCurrency": "CAD",
      "price": product.price,
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "@id": "https://www.canadianmetalfab.com/#organization"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating || "4.8",
      "reviewCount": product.reviewCount || "45"
    }
  };
}

export function generateArticleSchema(article: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": article.url,
    "headline": article.title,
    "description": article.description,
    "image": article.image || "https://www.canadianmetalfab.com/og-default.jpg",
    "datePublished": article.publishedTime || new Date().toISOString(),
    "dateModified": article.modifiedTime || article.publishedTime || new Date().toISOString(),
    "author": {
      "@type": "Person",
      "name": article.author || "CMF Team",
      "url": "https://www.canadianmetalfab.com/about"
    },
    "publisher": {
      "@type": "Organization",
      "@id": "https://www.canadianmetalfab.com/#organization"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.url
    },
    "wordCount": article.wordCount,
    "keywords": article.keywords?.join(", "),
    "articleSection": article.section,
    "inLanguage": "en-CA"
  };
}

export function generateFAQSchema(faqs: any[] | any) {
  const faqItems = Array.isArray(faqs) ? faqs : faqs.items || [];
  
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map((faq: any) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
        "author": {
          "@type": "Organization",
          "@id": "https://www.canadianmetalfab.com/#organization"
        }
      }
    }))
  };
}

export function generateBreadcrumbSchema(breadcrumbs: any[] | any) {
  const items = Array.isArray(breadcrumbs) ? breadcrumbs : breadcrumbs.items || [];
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((crumb: any, index: number) => ({
      "@type": "ListItem",
      "position": crumb.position || index + 1,
      "name": crumb.name,
      "item": `https://www.canadianmetalfab.com${crumb.path || '/'}`
    }))
  };
}

// WebSite with SearchAction for sitelinks search box
export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://www.canadianmetalfab.com/#website",
    "url": "https://www.canadianmetalfab.com",
    "name": "Canadian Metal Fabricators",
    "description": "Professional metal fabrication services in Toronto and the GTA",
    "publisher": {
      "@id": "https://www.canadianmetalfab.com/#organization"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.canadianmetalfab.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "inLanguage": "en-CA"
  };
}