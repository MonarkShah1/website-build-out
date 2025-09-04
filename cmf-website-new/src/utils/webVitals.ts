/**
 * Web Vitals Monitoring
 * CRITICAL for SEO - Core Web Vitals are a ranking factor
 */

import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

interface Metric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id?: string;
}

// Thresholds for Core Web Vitals
const thresholds = {
  LCP: { good: 2500, poor: 4000 },      // Largest Contentful Paint
  INP: { good: 200, poor: 500 },        // Interaction to Next Paint (replaces FID)
  CLS: { good: 0.1, poor: 0.25 },       // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 },      // First Contentful Paint
  TTFB: { good: 800, poor: 1800 },      // Time to First Byte
};

function getRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = thresholds[metricName as keyof typeof thresholds];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

function sendToAnalytics(metric: any) {
  const rating = getRating(metric.name, metric.value);
  
  // Log in development
  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: Math.round(metric.value),
      rating,
      delta: metric.delta,
    });
  }
  
  // Send to Google Analytics 4
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: rating,
      value: Math.round(metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
      metric_rating: rating,
      non_interaction: true,
    });
  }
  
  // Send to custom monitoring endpoint
  if (typeof navigator !== 'undefined' && navigator.sendBeacon && !import.meta.env.DEV) {
    const data = JSON.stringify({
      metric: metric.name,
      value: metric.value,
      rating,
      delta: metric.delta,
      id: metric.id,
      page: window.location.pathname,
      timestamp: Date.now(),
      connection: (navigator as any).connection?.effectiveType,
      deviceMemory: (navigator as any).deviceMemory,
    });
    
    // This endpoint would be configured in production
    try {
      navigator.sendBeacon('/api/metrics', data);
    } catch (e) {
      // Beacon failed, ignore
    }
  }
}

export function initWebVitals() {
  // Core Web Vitals (these affect SEO rankings)
  onCLS(sendToAnalytics);
  onINP(sendToAnalytics);  // INP is the new metric that replaced FID in March 2024
  onLCP(sendToAnalytics);
  
  // Other metrics
  onFCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
  
  // Custom performance tracking
  if (typeof window !== 'undefined') {
    observePerformance();
  }
}

// Performance observer for custom metrics
function observePerformance() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }

  // Observe long tasks (blocking the main thread)
  try {
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          if (import.meta.env.DEV) {
            console.warn('[Performance] Long task detected:', {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name,
            });
          }
          
          sendToAnalytics({
            name: 'long_task',
            value: entry.duration,
            id: `${entry.startTime}`,
          });
        }
      }
    });
    
    longTaskObserver.observe({ entryTypes: ['longtask'] });
  } catch (e) {
    // Long task observer not supported
  }
  
  // Observe layout shifts
  try {
    const layoutShiftObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Only track layout shifts without recent input (user-initiated shifts are ok)
        if (!(entry as any).hadRecentInput) {
          if (import.meta.env.DEV) {
            console.warn('[Performance] Layout shift detected:', {
              value: (entry as any).value,
              sources: (entry as any).sources,
            });
          }
          
          sendToAnalytics({
            name: 'layout_shift',
            value: (entry as any).value,
            id: `${entry.startTime}`,
          });
        }
      }
    });
    
    layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
  } catch (e) {
    // Layout shift observer not supported
  }
  
  // Track resource loading
  try {
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resourceEntry = entry as PerformanceResourceTiming;
        
        // Track slow resources
        if (resourceEntry.duration > 1000) {
          if (import.meta.env.DEV) {
            console.warn('[Performance] Slow resource:', {
              name: resourceEntry.name,
              duration: resourceEntry.duration,
              type: resourceEntry.initiatorType,
            });
          }
        }
      }
    });
    
    resourceObserver.observe({ entryTypes: ['resource'] });
  } catch (e) {
    // Resource observer not supported
  }
}

// Utility to measure custom metrics
export function measurePerformance(markName: string) {
  if (typeof window === 'undefined' || !('performance' in window) || !('mark' in performance)) {
    return { end: () => {} };
  }

  performance.mark(markName);
  
  return {
    end: () => {
      const endMark = `${markName}-end`;
      const measureName = `${markName}-duration`;
      
      performance.mark(endMark);
      performance.measure(measureName, markName, endMark);
      
      const measure = performance.getEntriesByName(measureName)[0];
      if (measure) {
        sendToAnalytics({
          name: markName,
          value: measure.duration,
          id: `${markName}-${Date.now()}`,
        });
      }
    }
  };
}