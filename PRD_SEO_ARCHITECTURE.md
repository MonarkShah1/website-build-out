# Product Requirements Document: Foundational SEO Architecture

**Project:** Canadian Metal Fabricators (CMF) Corporate Website

**Author:** Gemini AI

**Version:** 1.0

**Date:** October 26, 2023

---

## 1. Primary Objective

The purpose of this document is to establish the core architectural principles for the CMF website. This is not a list of features to be built immediately, but rather a set of foundational rules that **must** be followed throughout the entire development process. Adhering to these principles will ensure the codebase is structured to easily and efficiently accommodate the advanced SEO checklist provided, preventing the need for difficult and costly refactoring later in the project.

This document should be referenced before starting any new component or page to ensure all work aligns with these long-term goals.

## 2. Architectural Principles & Groundwork

### Principle 1: All Content Must Be Structured and Decoupled

*   **Target SEO Items:** #1 (Service-Specific Pages), #2 (Location-Specific Pages), #12 (Local Content Optimization).
*   **Problem Prevention:** Avoids manually creating and updating hundreds of pages. Ensures consistency and allows for programmatic page generation.
*   **Groundwork Requirement:**
    *   Utilize **Astro Content Collections** as the single source of truth for all repeatable content (services, locations, projects, etc.).
    *   Define strict TypeScript schemas for each collection in `src/content/config.ts`. This enforces data integrity for properties like `service_name`, `city`, `meta_description`, etc.

### Principle 2: Styling Must Be Scoped

*   **Target SEO Items:** #8 (Critical CSS Implementation), #15 (Mobile Optimization).
*   **Problem Prevention:** Prevents complex CSS specificity wars, unintended style overrides, and makes debugging predictable. This is the key to automatically inlining critical, above-the-fold styles without manual intervention.
*   **Groundwork Requirement:**
    *   Keep global stylesheets to an absolute minimum (for fonts, brand colors, etc.).
    *   **All component-specific styles must be contained within the `<style>` block of their `.astro` component.** This is a non-negotiable rule. Astro will handle the scoping and inlining.

### Principle 3: SEO Logic Must Be Centralized

*   **Target SEO Items:** #4 (Schema Markup), #5 (Meta Tags & Head Optimization).
*   **Problem Prevention:** Avoids duplicating meta tags, Open Graph tags, and schema scripts on every page. It makes site-wide updates to SEO logic trivial.
*   **Groundwork Requirement:**
    *   Create a single, reusable `SEO.astro` component.
    *   This component will take in props (`title`, `description`, `canonicalURL`, `ogImage`, etc.) and be responsible for rendering all tags in the `<head>`.
    *   It will live inside the main `Layout.astro` file, ensuring every page benefits from it.

### Principle 4: All Images Must Be Optimized by Default

*   **Target SEO Item:** #10 (Image Optimization).
*   **Problem Prevention:** Eliminates the risk of unoptimized, oversized images slowing down the site. Enforces performance best practices automatically.
*   **Groundwork Requirement:**
    *   Install and configure the `@astrojs/image` integration.
    *   **Do not use the standard `<img>` tag.** All images must be rendered using Astro's `<Image />` or `<Picture />` components to guarantee automatic lazy-loading, responsive `srcset` generation, and modern format conversion (WebP/AVIF).

### Principle 5: HTML Must Be Semantic

*   **Target SEO Item:** #20 (Semantic HTML Structure).
*   **Problem Prevention:** Ensures the site is accessible and easily understood by search engine crawlers, which is a foundational ranking factor.
*   **Groundwork Requirement:**
    *   A strict adherence to semantic HTML5 elements (`<main>`, `<nav>`, `<section>`, etc.) is required for all components and pages.
    *   Maintain a logical heading hierarchy (`<h1>` - `<h6>`) on every page, with only one `<h1>`.

## 3. Initial File Requirements for Groundwork

To prove this groundwork is in place, the initial project setup must include:

*   **`src/content/config.ts`:** The file for defining content collection schemas must exist.
*   **`src/components/SEO.astro`:** The centralized SEO component must exist.
*   **`public/robots.txt`:** A file to manage crawler access must exist.
*   **`astro.config.mjs`:** This file must show the installation of `@astrojs/sitemap` and `@astrojs/image`.

---