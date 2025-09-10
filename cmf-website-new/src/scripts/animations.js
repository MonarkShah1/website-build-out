/**
 * CMF Website Animations
 * Implements sophisticated scroll-triggered animations and micro-interactions
 * Following the animation plan for industrial B2B context
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

/**
 * Initialize all animations when DOM is loaded
 */
export function initAnimations() {
  // Performance optimization - disable on reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    console.log('🎯 Animations disabled due to user preference');
    return;
  }

  console.log('🎨 Initializing CMF animations...');

  // Initialize each animation type
  initCapabilityReveals();
  initPortfolioAnimations();
  initValuesAnimations();
  initTeamAnimations();
  initFormAnimations();
  initHoverEnhancements();
  
  console.log('✅ CMF animations initialized');
}

/**
 * Capability Cards Staggered Reveal
 * Purpose: Build expertise through progressive disclosure
 */
function initCapabilityReveals() {
  const cards = document.querySelectorAll('.capability-card');
  if (!cards.length) return;

  // Reset initial state
  gsap.set(cards, {
    y: 50,
    opacity: 0,
    rotationX: 15, // Subtle 3D tilt for depth
  });

  // Animate on scroll
  gsap.to(cards, {
    y: 0,
    opacity: 1,
    rotationX: 0,
    duration: 0.8,
    stagger: 0.2, // Organic reveal timing
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".capabilities",
      start: "top 80%",
      end: "bottom 20%",
      toggleActions: "play none none reverse",
      markers: false // Set to true for debugging
    }
  });

  console.log('🏗️ Capability reveals initialized');
}

/**
 * Portfolio Items Animation
 * Purpose: Showcase work through engaging visual reveals
 */
function initPortfolioAnimations() {
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  if (!portfolioItems.length) return;

  // Reset initial state
  gsap.set(portfolioItems, {
    y: 30,
    opacity: 0,
    scale: 0.95,
  });

  // Animate portfolio items
  gsap.to(portfolioItems, {
    y: 0,
    opacity: 1,
    scale: 1,
    duration: 0.6,
    stagger: 0.15, // Respect existing asymmetrical layout
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".portfolio-grid",
      start: "top 85%",
      toggleActions: "play none none reverse"
    }
  });

  console.log('🖼️ Portfolio animations initialized');
}

/**
 * Values Section Kinetic Typography
 * Purpose: Humanize trust through subtle text animations
 */
function initValuesAnimations() {
  const valueStories = document.querySelectorAll('.value-story');
  const quotes = document.querySelectorAll('.value-story blockquote p');
  
  if (!valueStories.length) return;

  // Animate value cards
  gsap.from(valueStories, {
    y: 40,
    opacity: 0,
    duration: 0.7,
    stagger: 0.2,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".values",
      start: "top 75%",
      toggleActions: "play none none reverse"
    }
  });

  // Animate quotes with kinetic typography
  if (quotes.length) {
    gsap.from(quotes, {
      opacity: 0,
      y: 20,
      duration: 0.5,
      stagger: 0.1,
      ease: "power1.out",
      delay: 0.3, // After main cards
      scrollTrigger: {
        trigger: ".values",
        start: "top 70%"
      }
    });
  }

  console.log('💎 Values animations initialized');
}

/**
 * Team Section Animations
 * Purpose: Create emotional connection through personalized reveals
 */
function initTeamAnimations() {
  const teamMembers = document.querySelectorAll('.team-member');
  if (!teamMembers.length) return;

  // Reset initial state
  gsap.set(teamMembers, {
    y: 50,
    opacity: 0,
    rotationY: 5, // Subtle 3D card effect
  });

  // Animate team members
  gsap.to(teamMembers, {
    y: 0,
    opacity: 1,
    rotationY: 0,
    duration: 0.8,
    stagger: 0.25, // More deliberate pacing for personal connection
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".team",
      start: "top 80%",
      toggleActions: "play none none reverse"
    }
  });

  console.log('👥 Team animations initialized');
}

/**
 * Enhanced Form Micro-Interactions
 * Purpose: Provide immediate feedback and satisfaction
 */
function initFormAnimations() {
  const charCounter = document.querySelector('.char-count');
  const textarea = document.querySelector('.paste-textarea');
  
  if (charCounter && textarea) {
    let updateTimeout;
    
    textarea.addEventListener('input', () => {
      // Add updating class for micro-feedback
      charCounter.classList.add('updating');
      
      // Clear previous timeout
      clearTimeout(updateTimeout);
      
      // Remove updating class after animation
      updateTimeout = setTimeout(() => {
        charCounter.classList.remove('updating');
        
        // Add warning if approaching limit
        const currentLength = textarea.value.length;
        if (currentLength > 1800) { // Near 2000 char limit
          charCounter.classList.add('warning');
        } else {
          charCounter.classList.remove('warning');
        }
      }, 200);
    });
  }

  // Success check animation enhancement
  const successIcons = document.querySelectorAll('.success-icon');
  successIcons.forEach(icon => {
    // Enhanced bounce-in effect
    gsap.fromTo(icon, 
      { 
        scale: 0, 
        rotation: 180,
        opacity: 0 
      },
      { 
        scale: 1, 
        rotation: 0,
        opacity: 1,
        duration: 0.6,
        ease: "back.out(1.7)"
      }
    );
  });

  console.log('📝 Form animations initialized');
}

/**
 * Enhanced Hover Effects
 * Purpose: Add sophisticated interaction feedback
 */
function initHoverEnhancements() {
  // Enhanced capability card hovers
  const capabilityCards = document.querySelectorAll('.capability-card');
  capabilityCards.forEach(card => {
    const icon = card.querySelector('.capability-icon');
    
    card.addEventListener('mouseenter', () => {
      // Subtle glow effect on other cards
      capabilityCards.forEach(otherCard => {
        if (otherCard !== card) {
          gsap.to(otherCard, {
            filter: 'brightness(0.95)',
            duration: 0.3,
            ease: "power2.out"
          });
        }
      });
      
      // Enhanced icon animation
      if (icon) {
        gsap.to(icon, {
          scale: 1.1,
          rotation: 5,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    });
    
    card.addEventListener('mouseleave', () => {
      // Reset other cards
      capabilityCards.forEach(otherCard => {
        gsap.to(otherCard, {
          filter: 'brightness(1)',
          duration: 0.3,
          ease: "power2.out"
        });
      });
      
      // Reset icon
      if (icon) {
        gsap.to(icon, {
          scale: 1,
          rotation: 0,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    });
  });

  // Enhanced button hover effects
  const ctaButtons = document.querySelectorAll('.cta-button');
  ctaButtons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      gsap.to(button, {
        scale: 1.05,
        y: -2,
        duration: 0.3,
        ease: "power2.out"
      });
    });
    
    button.addEventListener('mouseleave', () => {
      gsap.to(button, {
        scale: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out"
      });
    });
  });

  console.log('✨ Hover enhancements initialized');
}

/**
 * Portfolio Filter Animation Enhancement
 * Enhances existing filter functionality with GSAP
 */
export function enhancePortfolioFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  
  if (!filterBtns.length || !portfolioItems.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const filterValue = this.getAttribute('data-filter');
      
      // Animate out non-matching items
      portfolioItems.forEach(item => {
        const category = item.getAttribute('data-category');
        
        if (filterValue === 'all' || category === filterValue) {
          // Animate in
          gsap.fromTo(item, 
            { 
              opacity: 0, 
              y: 20, 
              scale: 0.95 
            },
            { 
              opacity: 1, 
              y: 0, 
              scale: 1,
              duration: 0.5,
              ease: "power2.out",
              delay: 0.1
            }
          );
          item.style.display = 'block';
        } else {
          // Animate out
          gsap.to(item, {
            opacity: 0,
            y: -20,
            scale: 0.95,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
              item.style.display = 'none';
            }
          });
        }
      });
    });
  });

  console.log('🎯 Portfolio filters enhanced');
}

/**
 * Background Parallax Effects
 * Purpose: Add subtle depth without overwhelming content
 */
export function initParallaxEffects() {
  // Performance check - only enable on desktop
  if (window.innerWidth < 1024) return;

  // Hero background parallax
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    gsap.to(heroSection, {
      backgroundPosition: '50% 100px',
      ease: "none",
      scrollTrigger: {
        trigger: heroSection,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
  }

  // Section divider elements
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  parallaxElements.forEach(element => {
    const speed = element.dataset.parallax || '0.5';
    
    gsap.to(element, {
      yPercent: -50 * parseFloat(speed),
      ease: "none",
      scrollTrigger: {
        trigger: element,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
  });

  console.log('🌊 Parallax effects initialized');
}

/**
 * Performance Monitoring
 * Ensures animations maintain 60fps
 */
function monitorPerformance() {
  if (typeof PerformanceObserver === 'undefined') return;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.duration > 16.67) { // >60fps threshold
        console.warn('⚠️ Animation performance issue:', {
          name: entry.name,
          duration: entry.duration,
          startTime: entry.startTime
        });
      }
    }
  });
  
  try {
    observer.observe({ entryTypes: ['measure'] });
    console.log('📊 Performance monitoring enabled');
  } catch (e) {
    console.log('📊 Performance monitoring not supported');
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnimations);
} else {
  initAnimations();
}

// Initialize performance monitoring in development
if (import.meta.env.DEV) {
  monitorPerformance();
}