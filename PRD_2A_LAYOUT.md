# Product Requirements Document (2A): Foundational Layout & Core Components

**Project:** Canadian Metal Fabricators (CMF) Corporate Website

**Author:** Development Team

**Version:** 2.0 (Enhanced)

**Date:** September 1, 2025

**Status:** In Development

---

## Executive Summary

This PRD defines the foundational architecture and core components for the CMF corporate website. Using first principles thinking, we focus on creating a performant, accessible, and maintainable foundation that scales with business needs while delivering exceptional user experience.

## 1. Overview & Objective

### 1.1 Primary Objective
Construct a robust, scalable foundational architecture for the CMF website that serves as the structural backbone for all pages and features. This foundation must be:
- **Performant**: Sub-2 second load times on 3G networks
- **Accessible**: WCAG 2.1 AA compliant
- **Maintainable**: Component-based architecture with clear separation of concerns
- **Scalable**: Ready for future feature additions without refactoring

### 1.2 Success Metrics
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Lighthouse scores: Performance > 90, Accessibility = 100
- Mobile responsiveness: 100% functional on devices 320px and wider
- Code maintainability: Component reusability > 80%

## 2. Design Philosophy & Visual Strategy

### 2.1 Core Design Principles
- **Clarity First**: Every element serves a clear purpose
- **Progressive Enhancement**: Core functionality works everywhere, enhanced features for modern browsers
- **Mobile-First**: Design from smallest viewport up
- **Performance Budget**: Max 200KB CSS, 300KB JS (gzipped)

### 2.2 Visual Design System

#### Color Palette
```css
:root {
  /* Primary Colors */
  --cmf-blue: #3A5D9A;
  --cmf-blue-hover: #2C4A7C;
  --cmf-blue-active: #1E3558;
  
  /* Neutral Colors */
  --white: #FFFFFF;
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-200: #E5E7EB;
  --gray-300: #D1D5DB;
  --gray-600: #4B5563;
  --gray-800: #1F2937;
  --gray-900: #111827;
  
  /* Semantic Colors */
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

#### Typography System
```css
:root {
  /* Font Families */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'Fira Code', 'Courier New', monospace;
  
  /* Font Sizes - Mobile First */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  
  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
  
  /* Letter Spacing */
  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
}
```

### 2.3 Spacing System
```css
:root {
  /* 8px Grid System */
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
  --space-20: 5rem;    /* 80px */
}
```

## 3. Responsive Design Specifications

### 3.1 Breakpoint System
```css
/* Mobile-First Breakpoints */
--breakpoint-sm: 640px;   /* Small tablets */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large Desktop */
--breakpoint-2xl: 1536px; /* Extra Large Desktop */
```

### 3.2 Container Specifications
```css
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--space-4);
  
  @media (min-width: 640px) {
    max-width: 640px;
  }
  
  @media (min-width: 768px) {
    max-width: 768px;
    padding: 0 var(--space-6);
  }
  
  @media (min-width: 1024px) {
    max-width: 1024px;
  }
  
  @media (min-width: 1280px) {
    max-width: 1280px;
  }
}
```

## 4. Component Architecture

### 4.1 Main Layout (`src/layouts/Layout.astro`)

#### Technical Requirements
- **FR-1.1:** Primary layout wrapper for all pages with SEO optimization
- **FR-1.2:** TypeScript props interface for type safety:
  ```typescript
  interface Props {
    title: string;
    description: string;
    ogImage?: string;
    canonicalURL?: string;
    noIndex?: boolean;
  }
  ```
- **FR-1.3:** Structured data (JSON-LD) for enhanced SEO
- **FR-1.4:** Performance optimizations:
  - Critical CSS inlining
  - Preconnect to external domains
  - DNS prefetch for third-party resources
- **FR-1.5:** Accessibility features:
  - Skip to main content link
  - Proper landmark regions
  - Focus management

#### Implementation Specification
```astro
---
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import '../styles/global.css';

interface Props {
  title: string;
  description: string;
  ogImage?: string;
  canonicalURL?: string;
  noIndex?: boolean;
}

const { 
  title, 
  description, 
  ogImage = '/og-default.jpg',
  canonicalURL = Astro.url.href,
  noIndex = false 
} = Astro.props;

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Canadian Metal Fabricators",
  "url": Astro.site,
  "logo": `${Astro.site}logo.svg`
};
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    {noIndex && <meta name="robots" content="noindex, nofollow" />}
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content={canonicalURL} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={ogImage} />
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content={canonicalURL} />
    <meta property="twitter:title" content={title} />
    <meta property="twitter:description" content={description} />
    <meta property="twitter:image" content={ogImage} />
    
    <link rel="canonical" href={canonicalURL} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    
    <!-- Preconnections for performance -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
    
    <title>{title} | Canadian Metal Fabricators</title>
    
    <script type="application/ld+json">
      {JSON.stringify(structuredData)}
    </script>
  </head>
  <body>
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <Header />
    <main id="main-content" tabindex="-1">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

### 4.2 Header Component (`src/components/Header.astro`)

#### Technical Requirements
- **FR-2.1:** Sticky positioning with backdrop blur on scroll
- **FR-2.2:** Logo with optimized SVG (max 2KB)
- **FR-2.3:** Navigation with keyboard support and ARIA labels
- **FR-2.4:** CTA button with loading states and micro-interactions
- **FR-2.5:** Mobile menu with trap focus and smooth animations

#### State Management
```typescript
interface HeaderState {
  isMenuOpen: boolean;
  isScrolled: boolean;
  activeRoute: string;
}

// Mobile menu state machine
enum MenuState {
  CLOSED = 'closed',
  OPENING = 'opening',
  OPEN = 'open',
  CLOSING = 'closing'
}
```

#### Implementation Specification
```astro
---
const currentPath = Astro.url.pathname;

const navItems = [
  { label: 'Services', href: '/services', id: 'nav-services' },
  { label: 'About Us', href: '/about', id: 'nav-about' }
];
---

<header class="header" data-header>
  <div class="container">
    <nav class="nav" role="navigation" aria-label="Main navigation">
      <!-- Logo -->
      <a href="/" class="logo" aria-label="Canadian Metal Fabricators Home">
        <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
          <!-- Optimized SVG logo -->
        </svg>
        <span class="logo-text">CMF</span>
      </a>
      
      <!-- Desktop Navigation -->
      <ul class="nav-list" role="list">
        {navItems.map(item => (
          <li>
            <a 
              href={item.href}
              class={currentPath === item.href ? 'active' : ''}
              id={item.id}
              aria-current={currentPath === item.href ? 'page' : undefined}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      
      <!-- CTA Button -->
      <a 
        href="/" 
        class="cta-button"
        aria-label="Get an instant quote for metal fabrication"
      >
        <span>Get an Instant Quote</span>
        <svg class="cta-icon" width="20" height="20" aria-hidden="true">
          <!-- Arrow icon -->
        </svg>
      </a>
      
      <!-- Mobile Menu Toggle -->
      <button
        class="menu-toggle"
        aria-label="Toggle navigation menu"
        aria-expanded="false"
        aria-controls="mobile-menu"
        data-menu-toggle
      >
        <span class="hamburger">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>
    </nav>
  </div>
  
  <!-- Mobile Menu -->
  <div 
    id="mobile-menu" 
    class="mobile-menu" 
    aria-hidden="true"
    data-mobile-menu
  >
    <div class="mobile-menu-content">
      <ul role="list">
        {navItems.map(item => (
          <li>
            <a 
              href={item.href}
              tabindex="-1"
              aria-current={currentPath === item.href ? 'page' : undefined}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      <a href="/" class="mobile-cta" tabindex="-1">
        Get an Instant Quote
      </a>
    </div>
  </div>
</header>

<script>
  // Progressive enhancement for mobile menu
  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  
  if (menuToggle && mobileMenu) {
    let menuState = 'closed';
    
    menuToggle.addEventListener('click', () => {
      const isOpen = menuState === 'open';
      menuState = isOpen ? 'closed' : 'open';
      
      menuToggle.setAttribute('aria-expanded', !isOpen);
      mobileMenu.setAttribute('aria-hidden', isOpen);
      document.body.style.overflow = isOpen ? '' : 'hidden';
      
      // Manage focus trap
      if (!isOpen) {
        const focusableElements = mobileMenu.querySelectorAll(
          'a, button, [tabindex]:not([tabindex="-1"])'
        );
        focusableElements.forEach(el => el.tabIndex = 0);
      } else {
        const focusableElements = mobileMenu.querySelectorAll('[tabindex="0"]');
        focusableElements.forEach(el => el.tabIndex = -1);
      }
    });
  }
  
  // Sticky header on scroll
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  }, { passive: true });
</script>

<style>
  .header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: var(--white);
    border-bottom: 1px solid var(--gray-200);
    transition: all 0.3s ease;
  }
  
  .header.scrolled {
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.95);
    box-shadow: var(--shadow-md);
  }
  
  .nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 4rem;
  }
  
  .logo {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-weight: 700;
    font-size: var(--text-xl);
    color: var(--gray-900);
    text-decoration: none;
  }
  
  .nav-list {
    display: none;
    list-style: none;
    gap: var(--space-8);
    margin: 0;
    padding: 0;
  }
  
  @media (min-width: 768px) {
    .nav-list {
      display: flex;
    }
    
    .menu-toggle {
      display: none;
    }
  }
  
  .cta-button {
    display: none;
    padding: var(--space-3) var(--space-6);
    background: var(--cmf-blue);
    color: var(--white);
    border-radius: 8px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s ease;
  }
  
  .cta-button:hover {
    background: var(--cmf-blue-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-lg);
  }
  
  @media (min-width: 768px) {
    .cta-button {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
    }
  }
  
  /* Mobile menu styles */
  .menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: transparent;
    border: none;
    cursor: pointer;
  }
  
  .hamburger {
    position: relative;
    width: 24px;
    height: 16px;
  }
  
  .hamburger span {
    position: absolute;
    left: 0;
    width: 100%;
    height: 2px;
    background: var(--gray-900);
    transition: all 0.3s ease;
  }
  
  .hamburger span:nth-child(1) { top: 0; }
  .hamburger span:nth-child(2) { top: 50%; transform: translateY(-50%); }
  .hamburger span:nth-child(3) { bottom: 0; }
  
  .mobile-menu {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--white);
    transform: translateX(100%);
    transition: transform 0.3s ease;
  }
  
  .mobile-menu[aria-hidden="false"] {
    transform: translateX(0);
  }
</style>
```

### 4.3 Footer Component (`src/components/Footer.astro`)

#### Technical Requirements
- **FR-3.1:** Semantic HTML5 footer with proper ARIA regions
- **FR-3.2:** Contact information with Schema.org microdata
- **FR-3.3:** Navigation links with keyboard navigation support
- **FR-3.4:** Dynamic copyright year
- **FR-3.5:** Performance: Lazy-load non-critical assets

#### Implementation Specification
```astro
---
const currentYear = new Date().getFullYear();

const footerLinks = [
  { label: 'Services', href: '/services' },
  { label: 'About Us', href: '/about' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' }
];

const contactInfo = {
  address: '123 Industrial Way, Toronto, ON M1B 2C3',
  phone: '+1 (416) 555-0123',
  email: 'info@canadianmetalfab.com',
  hours: 'Mon-Fri: 8:00 AM - 5:00 PM EST'
};
---

<footer class="footer" role="contentinfo">
  <div class="container">
    <div class="footer-grid">
      <!-- Company Info -->
      <div class="footer-section" itemscope itemtype="https://schema.org/LocalBusiness">
        <h3 class="footer-heading">Canadian Metal Fabricators</h3>
        <meta itemprop="name" content="Canadian Metal Fabricators" />
        
        <address class="contact-info" itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
          <p itemprop="streetAddress">{contactInfo.address}</p>
        </address>
        
        <div class="contact-details">
          <a href={`tel:${contactInfo.phone.replace(/\D/g, '')}`} class="contact-link" itemprop="telephone">
            <svg width="16" height="16" aria-hidden="true">
              <!-- Phone icon -->
            </svg>
            <span>{contactInfo.phone}</span>
          </a>
          
          <a href={`mailto:${contactInfo.email}`} class="contact-link" itemprop="email">
            <svg width="16" height="16" aria-hidden="true">
              <!-- Email icon -->
            </svg>
            <span>{contactInfo.email}</span>
          </a>
          
          <p class="hours" itemprop="openingHours" content="Mo-Fr 08:00-17:00">
            <svg width="16" height="16" aria-hidden="true">
              <!-- Clock icon -->
            </svg>
            <span>{contactInfo.hours}</span>
          </p>
        </div>
      </div>
      
      <!-- Quick Links -->
      <div class="footer-section">
        <h3 class="footer-heading">Quick Links</h3>
        <nav aria-label="Footer navigation">
          <ul class="footer-links" role="list">
            {footerLinks.map(link => (
              <li>
                <a href={link.href} class="footer-link">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      <!-- Call to Action -->
      <div class="footer-section">
        <h3 class="footer-heading">Ready to Start?</h3>
        <p class="footer-cta-text">
          Get a quote for your metal fabrication project today.
        </p>
        <a href="/" class="footer-cta-button">
          Get an Instant Quote
        </a>
      </div>
    </div>
    
    <!-- Bottom Bar -->
    <div class="footer-bottom">
      <p class="copyright">
        © {currentYear} Canadian Metal Fabricators. All Rights Reserved.
      </p>
      <div class="social-links" role="list" aria-label="Social media links">
        <a href="#" class="social-link" aria-label="LinkedIn">
          <svg width="20" height="20" aria-hidden="true">
            <!-- LinkedIn icon -->
          </svg>
        </a>
        <a href="#" class="social-link" aria-label="Facebook">
          <svg width="20" height="20" aria-hidden="true">
            <!-- Facebook icon -->
          </svg>
        </a>
      </div>
    </div>
  </div>
</footer>

<style>
  .footer {
    background: var(--gray-900);
    color: var(--gray-300);
    padding: var(--space-12) 0 var(--space-8);
    margin-top: auto;
  }
  
  .footer-grid {
    display: grid;
    gap: var(--space-8);
    margin-bottom: var(--space-8);
  }
  
  @media (min-width: 768px) {
    .footer-grid {
      grid-template-columns: 2fr 1fr 1fr;
      gap: var(--space-12);
    }
  }
  
  .footer-heading {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--white);
    margin-bottom: var(--space-4);
  }
  
  .contact-info {
    font-style: normal;
    margin-bottom: var(--space-4);
  }
  
  .contact-details {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  
  .contact-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--gray-300);
    text-decoration: none;
    transition: color 0.2s ease;
  }
  
  .contact-link:hover {
    color: var(--white);
  }
  
  .hours {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
  }
  
  .footer-links {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  
  .footer-link {
    color: var(--gray-300);
    text-decoration: none;
    transition: color 0.2s ease;
    padding: var(--space-1) 0;
  }
  
  .footer-link:hover {
    color: var(--white);
  }
  
  .footer-cta-text {
    margin-bottom: var(--space-4);
    line-height: var(--leading-relaxed);
  }
  
  .footer-cta-button {
    display: inline-flex;
    align-items: center;
    padding: var(--space-3) var(--space-6);
    background: var(--cmf-blue);
    color: var(--white);
    border-radius: 8px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s ease;
  }
  
  .footer-cta-button:hover {
    background: var(--cmf-blue-hover);
    transform: translateY(-1px);
  }
  
  .footer-bottom {
    padding-top: var(--space-6);
    border-top: 1px solid var(--gray-800);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    align-items: center;
  }
  
  @media (min-width: 768px) {
    .footer-bottom {
      flex-direction: row;
      justify-content: space-between;
    }
  }
  
  .copyright {
    font-size: var(--text-sm);
    color: var(--gray-400);
    margin: 0;
  }
  
  .social-links {
    display: flex;
    gap: var(--space-4);
  }
  
  .social-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--gray-800);
    color: var(--gray-400);
    transition: all 0.2s ease;
  }
  
  .social-link:hover {
    background: var(--gray-700);
    color: var(--white);
    transform: translateY(-2px);
  }
</style>
```

## 5. Performance & Accessibility Requirements

### 5.1 Performance Metrics
- **Initial Load**: < 3 seconds on 3G network
- **Time to Interactive**: < 5 seconds
- **First Contentful Paint**: < 1.8 seconds
- **Cumulative Layout Shift**: < 0.1
- **Bundle Size Limits**:
  - CSS: < 50KB (minified + gzipped)
  - JavaScript: < 100KB (minified + gzipped)
  - Total page weight: < 500KB

### 5.2 Accessibility Standards
- **WCAG 2.1 AA Compliance**:
  - Color contrast ratios: 4.5:1 for normal text, 3:1 for large text
  - Keyboard navigation for all interactive elements
  - Screen reader compatibility
  - Focus indicators visible and clear
- **ARIA Implementation**:
  - Proper landmarks (header, nav, main, footer)
  - Live regions for dynamic content
  - Descriptive labels for all interactive elements
- **Responsive Design**:
  - Zoom support up to 200% without horizontal scrolling
  - Touch targets minimum 44x44px on mobile

### 5.3 Browser Support
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile Safari iOS 14+
- Chrome Mobile Android 10+

## 6. Global Styles Specification (`src/styles/global.css`)

```css
/* CSS Reset & Base Styles */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-primary);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--gray-900);
  background: var(--white);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Focus Styles */
:focus-visible {
  outline: 2px solid var(--cmf-blue);
  outline-offset: 2px;
}

/* Skip Link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--cmf-blue);
  color: var(--white);
  padding: var(--space-2) var(--space-4);
  z-index: 100;
  text-decoration: none;
  border-radius: 0 0 8px 0;
}

.skip-link:focus {
  top: 0;
}

/* Container */
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

@media (min-width: 640px) {
  .container { max-width: 640px; }
}

@media (min-width: 768px) {
  .container { 
    max-width: 768px;
    padding: 0 var(--space-6);
  }
}

@media (min-width: 1024px) {
  .container { max-width: 1024px; }
}

@media (min-width: 1280px) {
  .container { max-width: 1280px; }
}

/* Utility Classes */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## 7. Test Page Implementation

### 7.1 Homepage Test Implementation (`src/pages/index.astro`)

```astro
---
import Layout from '../layouts/Layout.astro';

const pageData = {
  title: 'Home',
  description: 'Canadian Metal Fabricators - Your trusted partner for precision metal fabrication services in Toronto and the GTA.',
  ogImage: '/og-home.jpg'
};
---

<Layout {...pageData}>
  <section class="hero">
    <div class="container">
      <h1>Welcome to Canadian Metal Fabricators</h1>
      <p>This is a test page to verify the layout components are working correctly.</p>
      
      <!-- Test content for layout verification -->
      <div class="test-grid">
        <div class="test-card">
          <h2>Header Component</h2>
          <p>✓ Logo displays correctly</p>
          <p>✓ Navigation links functional</p>
          <p>✓ CTA button prominent</p>
          <p>✓ Mobile menu works</p>
        </div>
        
        <div class="test-card">
          <h2>Layout Component</h2>
          <p>✓ SEO meta tags present</p>
          <p>✓ Slot rendering works</p>
          <p>✓ Global styles applied</p>
          <p>✓ Skip link functional</p>
        </div>
        
        <div class="test-card">
          <h2>Footer Component</h2>
          <p>✓ Contact info displays</p>
          <p>✓ Navigation links work</p>
          <p>✓ Copyright year dynamic</p>
          <p>✓ Social links present</p>
        </div>
      </div>
    </div>
  </section>
</Layout>

<style>
  .hero {
    padding: var(--space-16) 0;
    min-height: 60vh;
  }
  
  h1 {
    font-size: var(--text-4xl);
    font-weight: 700;
    margin-bottom: var(--space-4);
    color: var(--gray-900);
  }
  
  .test-grid {
    display: grid;
    gap: var(--space-6);
    margin-top: var(--space-12);
  }
  
  @media (min-width: 768px) {
    .test-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  .test-card {
    padding: var(--space-6);
    background: var(--gray-50);
    border-radius: 8px;
    border: 1px solid var(--gray-200);
  }
  
  .test-card h2 {
    font-size: var(--text-xl);
    margin-bottom: var(--space-4);
    color: var(--cmf-blue);
  }
  
  .test-card p {
    color: var(--gray-600);
    margin-bottom: var(--space-2);
  }
</style>
```

## 8. Testing Strategy

### 8.1 Unit Testing
- Component isolation tests using Astro's testing utilities
- Props validation and type checking
- Accessibility testing with jest-axe

### 8.2 Integration Testing
```javascript
// tests/layout.test.js
import { expect, test } from '@playwright/test';

test.describe('Layout Components', () => {
  test('should render header with navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check header elements
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('.logo')).toBeVisible();
    await expect(page.locator('.cta-button')).toContainText('Get an Instant Quote');
  });
  
  test('should toggle mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    const menuToggle = page.locator('.menu-toggle');
    const mobileMenu = page.locator('.mobile-menu');
    
    await expect(menuToggle).toBeVisible();
    await expect(mobileMenu).toHaveAttribute('aria-hidden', 'true');
    
    await menuToggle.click();
    await expect(mobileMenu).toHaveAttribute('aria-hidden', 'false');
  });
  
  test('should have proper SEO tags', async ({ page }) => {
    await page.goto('/');
    
    const title = await page.title();
    expect(title).toContain('Canadian Metal Fabricators');
    
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
  });
});
```

### 8.3 Performance Testing
```javascript
// lighthouse.config.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 1 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
  },
};
```

## 9. Deployment Strategy

### 9.1 Build Process
```bash
# Production build
npm run build

# Preview production build
npm run preview

# Run tests
npm run test
npm run test:e2e
npm run test:lighthouse
```

### 9.2 CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run build
      - run: npm run test:e2e
      - run: npm run test:lighthouse
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - name: Deploy to hosting
        run: |
          # Deploy commands here
```

## 10. Acceptance Criteria (Enhanced)

### 10.1 Functional Requirements
- ✅ All components render without errors
- ✅ Navigation works on all devices
- ✅ Mobile menu functions correctly
- ✅ All links are functional
- ✅ Forms are accessible via keyboard

### 10.2 Performance Requirements
- ✅ Lighthouse Performance score > 90
- ✅ First Contentful Paint < 2s
- ✅ Time to Interactive < 5s
- ✅ No layout shifts after initial load

### 10.3 Accessibility Requirements
- ✅ Lighthouse Accessibility score = 100
- ✅ All interactive elements keyboard accessible
- ✅ Screen reader compatible
- ✅ Color contrast meets WCAG AA

### 10.4 Code Quality
- ✅ No TypeScript errors
- ✅ No console errors
- ✅ All tests passing
- ✅ Code coverage > 80%

---

## Appendix A: Design Tokens

Full design token specification available at: `/src/styles/tokens.css`

## Appendix B: Component API Documentation

Detailed component props and usage examples at: `/docs/components/`

## Appendix C: Performance Budget

Detailed performance budget breakdown at: `/docs/performance-budget.md`