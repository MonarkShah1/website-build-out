export interface SEOMetaTags {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  robots?: string;
  author?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterSite?: string;
  twitterCreator?: string;
  alternates?: Array<{
    lang: string;
    href: string;
  }>;
}

export function generateMetaTags(config: SEOMetaTags): string {
  const tags: string[] = [];
  
  tags.push(`<title>${config.title}</title>`);
  tags.push(`<meta name="description" content="${config.description}" />`);
  
  if (config.keywords) {
    tags.push(`<meta name="keywords" content="${config.keywords}" />`);
  }
  
  if (config.canonical) {
    tags.push(`<link rel="canonical" href="${config.canonical}" />`);
  }
  
  if (config.robots) {
    tags.push(`<meta name="robots" content="${config.robots}" />`);
  }
  
  if (config.author) {
    tags.push(`<meta name="author" content="${config.author}" />`);
  }
  
  tags.push(`<meta property="og:title" content="${config.ogTitle || config.title}" />`);
  tags.push(`<meta property="og:description" content="${config.ogDescription || config.description}" />`);
  
  if (config.ogImage) {
    tags.push(`<meta property="og:image" content="${config.ogImage}" />`);
  }
  
  if (config.ogType) {
    tags.push(`<meta property="og:type" content="${config.ogType}" />`);
  }
  
  if (config.ogUrl) {
    tags.push(`<meta property="og:url" content="${config.ogUrl}" />`);
  }
  
  tags.push(`<meta name="twitter:card" content="${config.twitterCard || 'summary_large_image'}" />`);
  
  if (config.twitterSite) {
    tags.push(`<meta name="twitter:site" content="${config.twitterSite}" />`);
  }
  
  if (config.twitterCreator) {
    tags.push(`<meta name="twitter:creator" content="${config.twitterCreator}" />`);
  }
  
  if (config.alternates) {
    config.alternates.forEach(alt => {
      tags.push(`<link rel="alternate" hreflang="${alt.lang}" href="${alt.href}" />`);
    });
  }
  
  return tags.join('\n');
}

export function generateTitleTag(
  pageTitle: string,
  siteName: string = 'Canadian Metal Fabricators',
  separator: string = '|'
): string {
  const maxLength = 60;
  const fullTitle = `${pageTitle} ${separator} ${siteName}`;
  
  if (fullTitle.length > maxLength) {
    const availableLength = maxLength - siteName.length - separator.length - 3;
    const truncatedPageTitle = pageTitle.substring(0, availableLength) + '...';
    return `${truncatedPageTitle} ${separator} ${siteName}`;
  }
  
  return fullTitle;
}

export function generateDescription(
  content: string,
  maxLength: number = 160
): string {
  if (content.length <= maxLength) {
    return content;
  }
  
  const truncated = content.substring(0, maxLength - 3);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > 0) {
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  
  return truncated + '...';
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

export function generateLocalBusinessSchema(data: {
  name: string;
  description: string;
  url: string;
  telephone: string;
  email?: string;
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  openingHours?: Array<{
    dayOfWeek: string | string[];
    opens: string;
    closes: string;
  }>;
  priceRange?: string;
  image?: string[];
  sameAs?: string[];
}) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: data.name,
    description: data.description,
    url: data.url,
    telephone: data.telephone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: data.address.street,
      addressLocality: data.address.city,
      addressRegion: data.address.province,
      postalCode: data.address.postalCode,
      addressCountry: data.address.country
    }
  };

  if (data.email) {
    schema.email = data.email;
  }

  if (data.geo) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: data.geo.latitude,
      longitude: data.geo.longitude
    };
  }

  if (data.openingHours) {
    schema.openingHoursSpecification = data.openingHours.map(hours => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: hours.dayOfWeek,
      opens: hours.opens,
      closes: hours.closes
    }));
  }

  if (data.priceRange) {
    schema.priceRange = data.priceRange;
  }

  if (data.image) {
    schema.image = data.image;
  }

  if (data.sameAs) {
    schema.sameAs = data.sameAs;
  }

  return schema;
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Canadian Metal Fabricators',
    alternateName: 'CMF',
    url: 'https://canadianmetalfabricators.com',
    logo: 'https://canadianmetalfabricators.com/images/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-416-555-0100',
      contactType: 'customer service',
      areaServed: 'CA',
      availableLanguage: ['en', 'fr']
    },
    sameAs: [
      'https://www.facebook.com/canadianmetalfabricators',
      'https://www.linkedin.com/company/canadian-metal-fabricators',
      'https://twitter.com/cmfmetalwork'
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Industrial Way',
      addressLocality: 'Toronto',
      addressRegion: 'ON',
      postalCode: 'M1B 2K9',
      addressCountry: 'CA'
    }
  };
}

export function generateServiceSchema(data: {
  name: string;
  description: string;
  provider: string;
  areaServed?: string[];
  serviceType?: string;
  offers?: Array<{
    name: string;
    description: string;
  }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: data.name,
    description: data.description,
    provider: {
      '@type': 'Organization',
      name: data.provider
    },
    areaServed: data.areaServed,
    serviceType: data.serviceType,
    hasOfferCatalog: data.offers ? {
      '@type': 'OfferCatalog',
      name: `${data.name} Services`,
      itemListElement: data.offers.map((offer, index) => ({
        '@type': 'Offer',
        position: index + 1,
        name: offer.name,
        description: offer.description
      }))
    } : undefined
  };
}

export function sanitizeForURL(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateSitemapEntry(data: {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  images?: Array<{
    loc: string;
    title?: string;
    caption?: string;
  }>;
}): string {
  let entry = `<url>\n`;
  entry += `  <loc>${data.url}</loc>\n`;
  
  if (data.lastmod) {
    entry += `  <lastmod>${data.lastmod}</lastmod>\n`;
  }
  
  if (data.changefreq) {
    entry += `  <changefreq>${data.changefreq}</changefreq>\n`;
  }
  
  if (data.priority !== undefined) {
    entry += `  <priority>${data.priority}</priority>\n`;
  }
  
  if (data.images) {
    data.images.forEach(image => {
      entry += `  <image:image>\n`;
      entry += `    <image:loc>${image.loc}</image:loc>\n`;
      if (image.title) {
        entry += `    <image:title>${image.title}</image:title>\n`;
      }
      if (image.caption) {
        entry += `    <image:caption>${image.caption}</image:caption>\n`;
      }
      entry += `  </image:image>\n`;
    });
  }
  
  entry += `</url>`;
  return entry;
}

export function generateRobotsTxt(sitemapUrl: string): string {
  return `# Robots.txt for Canadian Metal Fabricators
User-agent: *
Allow: /

# Disallow admin and private paths
Disallow: /admin/
Disallow: /api/
Disallow: /_app/
Disallow: /cdn-cgi/

# Allow search engines to access everything else
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Slurp
Allow: /
Crawl-delay: 1

# Sitemap location
Sitemap: ${sitemapUrl}
`;
}