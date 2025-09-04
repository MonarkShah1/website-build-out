/**
 * Image Optimization Utilities
 * CRITICAL for Core Web Vitals (LCP, CLS)
 */

interface ImageSizes {
  mobile: number;
  tablet: number;
  desktop: number;
}

interface OptimizedImage {
  src: string;
  srcset: string;
  sizes: string;
  loading: 'lazy' | 'eager';
  decoding: 'async' | 'sync' | 'auto';
  fetchpriority?: 'high' | 'low' | 'auto';
  width?: number;
  height?: number;
  alt: string;
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(
  basePath: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1536]
): string {
  return widths
    .map(width => `${basePath}?w=${width} ${width}w`)
    .join(', ');
}

/**
 * Generate sizes attribute based on breakpoints
 */
export function generateSizes(sizes: ImageSizes): string {
  return `
    (max-width: 640px) ${sizes.mobile}px,
    (max-width: 1024px) ${sizes.tablet}px,
    ${sizes.desktop}px
  `.trim();
}

/**
 * Optimize image attributes for performance
 */
export function optimizeImage(
  src: string,
  alt: string,
  options: {
    sizes?: ImageSizes;
    priority?: boolean;
    width?: number;
    height?: number;
    objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  } = {}
): OptimizedImage {
  const {
    sizes = { mobile: 320, tablet: 768, desktop: 1200 },
    priority = false,
    width,
    height,
  } = options;

  return {
    src,
    srcset: generateSrcSet(src),
    sizes: generateSizes(sizes),
    loading: priority ? 'eager' : 'lazy',
    decoding: priority ? 'sync' : 'async',
    fetchpriority: priority ? 'high' : undefined,
    width,
    height,
    alt,
  };
}

/**
 * Lazy loading intersection observer
 */
export function initLazyLoading() {
  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[data-lazy]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          
          // Load the image
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
          }
          
          // Clean up
          img.removeAttribute('data-lazy');
          img.removeAttribute('data-src');
          img.removeAttribute('data-srcset');
          
          // Stop observing
          imageObserver.unobserve(img);
          
          // Add fade-in effect
          img.classList.add('lazy-loaded');
        }
      });
    }, {
      // Start loading 50px before entering viewport
      rootMargin: '50px',
      threshold: 0.01
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
  }
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, as: 'image' = 'image'): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = src;
  
  // Add responsive images support
  if (src.includes('?')) {
    link.setAttribute('imagesrcset', generateSrcSet(src));
    link.setAttribute('imagesizes', '100vw');
  }
  
  document.head.appendChild(link);
}

/**
 * Calculate aspect ratio to prevent CLS
 */
export function calculateAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(width, height);
  return `${width / divisor}/${height / divisor}`;
}

/**
 * Generate placeholder for images (prevents CLS)
 */
export function generatePlaceholder(
  width: number,
  height: number,
  color: string = '#f3f4f6'
): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Image format detection
 */
export function getBestImageFormat(): 'webp' | 'avif' | 'jpeg' {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  // Check AVIF support
  if (canvas.toDataURL('image/avif').indexOf('image/avif') === 5) {
    return 'avif';
  }
  
  // Check WebP support
  if (canvas.toDataURL('image/webp').indexOf('image/webp') === 5) {
    return 'webp';
  }
  
  return 'jpeg';
}

/**
 * Progressive image loading strategy
 */
export class ProgressiveImageLoader {
  private queue: HTMLImageElement[] = [];
  private loading = false;
  
  add(img: HTMLImageElement): void {
    this.queue.push(img);
    this.processQueue();
  }
  
  private async processQueue(): Promise<void> {
    if (this.loading || this.queue.length === 0) return;
    
    this.loading = true;
    const img = this.queue.shift()!;
    
    try {
      await this.loadImage(img);
    } catch (error) {
      console.error('Failed to load image:', error);
    }
    
    this.loading = false;
    
    // Process next image
    if (this.queue.length > 0) {
      // Small delay to prevent blocking
      setTimeout(() => this.processQueue(), 10);
    }
  }
  
  private loadImage(img: HTMLImageElement): Promise<void> {
    return new Promise((resolve, reject) => {
      const tempImg = new Image();
      
      tempImg.onload = () => {
        img.src = tempImg.src;
        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset;
        }
        img.classList.add('progressive-loaded');
        resolve();
      };
      
      tempImg.onerror = reject;
      tempImg.src = img.dataset.src || img.src;
    });
  }
}

// Export singleton instance
export const imageLoader = new ProgressiveImageLoader();