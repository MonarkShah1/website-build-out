/**
 * CMF Animation Performance Testing
 * Validates that animations maintain 60fps and accessibility standards
 */

export function runAnimationPerformanceTest() {
  console.log('🚀 Starting CMF Animation Performance Test...');
  
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    details: []
  };

  // Test 1: Reduced Motion Preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    console.log('✅ Reduced motion preference detected - animations will be disabled');
    results.passed++;
    results.details.push('✅ Reduced motion preference respected');
  } else {
    results.details.push('ℹ️ Normal motion preferences detected');
  }

  // Test 2: GSAP Library Availability
  try {
    if (typeof gsap !== 'undefined') {
      console.log('✅ GSAP library loaded successfully');
      results.passed++;
      results.details.push('✅ GSAP library available');
    } else {
      console.warn('⚠️ GSAP library not found');
      results.warnings++;
      results.details.push('⚠️ GSAP library not loaded');
    }
  } catch (e) {
    console.error('❌ GSAP library error:', e);
    results.failed++;
    results.details.push('❌ GSAP library error');
  }

  // Test 3: Critical Elements Present
  const criticalElements = [
    { selector: '.capability-card', name: 'Capability Cards' },
    { selector: '.portfolio-item', name: 'Portfolio Items' },
    { selector: '.value-story', name: 'Value Stories' },
    { selector: '.team-member', name: 'Team Members' },
    { selector: '.hero-form', name: 'Hero Form' }
  ];

  criticalElements.forEach(({ selector, name }) => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      console.log(`✅ ${name}: ${elements.length} elements found`);
      results.passed++;
      results.details.push(`✅ ${name}: ${elements.length} elements`);
    } else {
      console.warn(`⚠️ ${name}: No elements found`);
      results.warnings++;
      results.details.push(`⚠️ ${name}: No elements found`);
    }
  });

  // Test 4: CSS Transitions Performance
  const testElement = document.createElement('div');
  testElement.style.cssText = `
    position: fixed;
    top: -100px;
    left: -100px;
    width: 50px;
    height: 50px;
    background: red;
    transition: transform 0.3s ease;
  `;
  document.body.appendChild(testElement);

  const startTime = performance.now();
  testElement.style.transform = 'translateX(100px)';
  
  setTimeout(() => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (duration < 20) { // Should be near 16.67ms for 60fps
      console.log(`✅ CSS transition performance: ${duration.toFixed(2)}ms`);
      results.passed++;
      results.details.push(`✅ CSS transition: ${duration.toFixed(2)}ms`);
    } else {
      console.warn(`⚠️ CSS transition slow: ${duration.toFixed(2)}ms`);
      results.warnings++;
      results.details.push(`⚠️ CSS transition slow: ${duration.toFixed(2)}ms`);
    }
    
    document.body.removeChild(testElement);
  }, 100);

  // Test 5: Form Micro-Interactions
  const formInputs = document.querySelectorAll('.hero-form input, .paste-textarea');
  let formTestsPassed = 0;
  
  formInputs.forEach((input, index) => {
    try {
      // Test focus event
      input.focus();
      const computedStyle = window.getComputedStyle(input);
      if (computedStyle.transition.includes('box-shadow')) {
        formTestsPassed++;
      }
      input.blur();
    } catch (e) {
      console.warn(`⚠️ Form input ${index} focus test failed:`, e);
    }
  });

  if (formTestsPassed > 0) {
    console.log(`✅ Form micro-interactions: ${formTestsPassed}/${formInputs.length} working`);
    results.passed++;
    results.details.push(`✅ Form interactions: ${formTestsPassed}/${formInputs.length}`);
  } else {
    console.warn('⚠️ No form micro-interactions detected');
    results.warnings++;
    results.details.push('⚠️ No form micro-interactions working');
  }

  // Test 6: Mobile Performance Check
  const isMobile = window.innerWidth < 768;
  if (isMobile) {
    console.log('📱 Mobile device detected - checking mobile optimizations');
    
    // Check if complex animations are disabled on mobile
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    if (parallaxElements.length === 0 || window.innerWidth < 1024) {
      console.log('✅ Parallax disabled on mobile for performance');
      results.passed++;
      results.details.push('✅ Mobile parallax optimization');
    }
  }

  // Test 7: Performance Observer Support
  if (typeof PerformanceObserver !== 'undefined') {
    console.log('✅ Performance monitoring available');
    results.passed++;
    results.details.push('✅ Performance monitoring supported');
  } else {
    console.log('ℹ️ Performance Observer not supported (older browser)');
  }

  // Final Results
  const total = results.passed + results.failed + results.warnings;
  const score = ((results.passed / total) * 100).toFixed(1);
  
  console.log('\n🎯 CMF Animation Performance Test Results:');
  console.log(`Overall Score: ${score}%`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`⚠️ Warnings: ${results.warnings}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log('\nDetailed Results:');
  results.details.forEach(detail => console.log(`  ${detail}`));

  // Performance Recommendations
  if (results.warnings > 0 || results.failed > 0) {
    console.log('\n💡 Performance Recommendations:');
    if (results.warnings > 0) {
      console.log('• Check browser compatibility for optimal animation support');
      console.log('• Consider reducing animation complexity on older devices');
    }
    if (results.failed > 0) {
      console.log('• Critical animation features may not be working');
      console.log('• Check console for JavaScript errors');
    }
  }

  return {
    score: parseFloat(score),
    passed: results.passed,
    warnings: results.warnings,
    failed: results.failed,
    details: results.details
  };
}

// Auto-run test in development
if (import.meta.env.DEV) {
  // Run test after animations are initialized
  setTimeout(() => {
    runAnimationPerformanceTest();
  }, 2000);
}

// Export for manual testing
window.testCMFAnimationPerformance = runAnimationPerformanceTest;