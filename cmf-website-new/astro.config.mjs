// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.canadianmetalfab.com',
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [
    react(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en-CA',
        },
      },
    }),
  ],
  output: 'server', // Changed from 'static' to support API routes
  build: {
    inlineStylesheets: 'auto', // Inline critical CSS
    assets: '_astro', // Asset directory name
  },
  vite: {
    ssr: {
      noExternal: ['web-vitals'],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            form: ['react-hook-form', 'zod', '@hookform/resolvers'],
          },
        },
      },
    },
  },
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        limitInputPixels: false,
      },
    },
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'viewport',
  },
  compressHTML: true,
  scopedStyleStrategy: 'attribute', // Scoped CSS for components
});
