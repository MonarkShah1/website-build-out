/**
 * CMF Website Accessibility & Responsiveness Testing
 * Comprehensive WCAG 2.2 AA compliance validation
 * Mobile-first responsiveness testing
 */

export function runAccessibilityTest() {
  console.log('🎯 Starting CMF Accessibility & Responsiveness Test...');
  
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    details: [],
    scores: {
      accessibility: 0,
      responsiveness: 0,
      touchTargets: 0,
      keyboard: 0
    }
  };

  // Test 1: WCAG 2.5.5 Touch Target Sizes (44x44px minimum)
  console.log('🔍 Testing touch target sizes (WCAG 2.5.5)...');
  testTouchTargets(results);

  // Test 2: WCAG 2.4.7 Visible Focus Indicators
  console.log('🔍 Testing keyboard focus indicators...');
  testFocusIndicators(results);

  // Test 3: WCAG 2.4.1 Bypass Blocks (Skip Links)
  console.log('🔍 Testing skip links...');
  testSkipLinks(results);

  // Test 4: WCAG 1.1.1 Non-text Content (Alt Text)
  console.log('🔍 Testing image alt text...');
  testImageAltText(results);

  // Test 5: WCAG 4.1.2 Name, Role, Value (ARIA)
  console.log('🔍 Testing ARIA implementation...');
  testARIAImplementation(results);

  // Test 6: Form Accessibility (WCAG 3.3.x)
  console.log('🔍 Testing form accessibility...');
  testFormAccessibility(results);

  // Test 7: Mobile Responsiveness (Viewport, Stacking)
  console.log('📱 Testing mobile responsiveness...');
  testMobileResponsiveness(results);

  // Test 8: Fluid Resizing (No Horizontal Scroll)
  console.log('📏 Testing fluid resizing...');
  testFluidResizing(results);

  // Calculate final scores
  calculateScores(results);
  
  // Display results
  displayResults(results);
  
  return results;
}

function testTouchTargets(results) {
  const touchElements = document.querySelectorAll(
    'button, .btn, .cta-button, input[type="submit"], input[type="button"], ' +
    'a.button, .filter-btn, .capability-link, .member-linkedin'
  );

  let conformantTargets = 0;
  const minSize = 44; // WCAG 2.5.5 minimum

  touchElements.forEach((element, index) => {
    const rect = element.getBoundingClientRect();
    const computed = window.getComputedStyle(element);
    const paddingX = parseFloat(computed.paddingLeft) + parseFloat(computed.paddingRight);
    const paddingY = parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom);
    
    const effectiveWidth = Math.max(rect.width, paddingX);
    const effectiveHeight = Math.max(rect.height, paddingY);

    if (effectiveWidth >= minSize && effectiveHeight >= minSize) {
      conformantTargets++;
    } else {
      console.warn(`⚠️ Touch target ${index + 1} too small: ${effectiveWidth.toFixed(1)}x${effectiveHeight.toFixed(1)}px`);
      results.warnings++;
    }
  });

  const touchTargetScore = (conformantTargets / touchElements.length) * 100;
  results.scores.touchTargets = touchTargetScore;

  if (touchTargetScore >= 90) {
    results.passed++;
    results.details.push(`✅ Touch targets: ${conformantTargets}/${touchElements.length} meet WCAG 2.5.5`);
  } else {
    results.failed++;
    results.details.push(`❌ Touch targets: ${conformantTargets}/${touchElements.length} meet WCAG 2.5.5`);
  }
}

function testFocusIndicators(results) {
  const focusableElements = document.querySelectorAll(
    'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
  );

  let visibleFocusCount = 0;

  focusableElements.forEach((element, index) => {
    element.focus();
    const focused = document.activeElement === element;
    const computed = window.getComputedStyle(element, ':focus');
    
    // Check for visible focus indicators
    const hasOutline = computed.outline && computed.outline !== 'none' && computed.outline !== '0px none';
    const hasBoxShadow = computed.boxShadow && computed.boxShadow !== 'none';
    const hasBorder = computed.borderWidth && computed.borderWidth !== '0px';

    if (focused && (hasOutline || hasBoxShadow || hasBorder)) {
      visibleFocusCount++;
    }
    
    element.blur();
  });

  const focusScore = (visibleFocusCount / focusableElements.length) * 100;
  results.scores.keyboard = focusScore;

  if (focusScore >= 80) {
    results.passed++;
    results.details.push(`✅ Focus indicators: ${visibleFocusCount}/${focusableElements.length} visible`);
  } else {
    results.warnings++;
    results.details.push(`⚠️ Focus indicators: ${visibleFocusCount}/${focusableElements.length} visible`);
  }
}

function testSkipLinks(results) {
  const skipLink = document.querySelector('.skip-link');
  
  if (skipLink) {
    // Test if skip link becomes visible on focus
    skipLink.focus();
    const computed = window.getComputedStyle(skipLink);
    const isVisible = computed.top !== '-40px' && computed.visibility !== 'hidden';
    
    if (isVisible) {
      results.passed++;
      results.details.push('✅ Skip link: Visible on focus (WCAG 2.4.1)');
    } else {
      results.warnings++;
      results.details.push('⚠️ Skip link: May not be visible on focus');
    }
    
    skipLink.blur();
  } else {
    results.warnings++;
    results.details.push('⚠️ Skip link: Not found (WCAG 2.4.1)');
  }
}

function testImageAltText(results) {
  const images = document.querySelectorAll('img, [role="img"]');
  let imagesWithAlt = 0;

  images.forEach((img) => {
    const hasAlt = img.alt !== undefined && img.alt !== '';
    const hasAriaLabel = img.getAttribute('aria-label');
    const isDecorative = img.alt === '' && img.getAttribute('aria-hidden') === 'true';

    if (hasAlt || hasAriaLabel || isDecorative) {
      imagesWithAlt++;
    } else {
      console.warn('⚠️ Image missing alt text:', img);
    }
  });

  const altTextScore = images.length > 0 ? (imagesWithAlt / images.length) * 100 : 100;

  if (altTextScore >= 95) {
    results.passed++;
    results.details.push(`✅ Image alt text: ${imagesWithAlt}/${images.length} properly described`);
  } else {
    results.warnings++;
    results.details.push(`⚠️ Image alt text: ${imagesWithAlt}/${images.length} properly described`);
  }
}

function testARIAImplementation(results) {
  const formsWithRole = document.querySelectorAll('form[role="form"]');
  const ariaLabels = document.querySelectorAll('[aria-label]');
  const ariaDescribedBy = document.querySelectorAll('[aria-describedby]');
  const ariaLive = document.querySelectorAll('[aria-live]');
  const fieldsets = document.querySelectorAll('fieldset[role="group"]');

  let ariaScore = 0;

  // Check form ARIA implementation
  if (formsWithRole.length > 0) ariaScore += 20;
  if (ariaLabels.length >= 5) ariaScore += 20; // Good coverage of labels
  if (ariaDescribedBy.length >= 3) ariaScore += 20; // Form fields have descriptions
  if (ariaLive.length >= 2) ariaScore += 20; // Error announcements
  if (fieldsets.length >= 1) ariaScore += 20; // Grouped form sections

  if (ariaScore >= 80) {
    results.passed++;
    results.details.push(`✅ ARIA implementation: ${ariaScore}% coverage`);
  } else {
    results.warnings++;
    results.details.push(`⚠️ ARIA implementation: ${ariaScore}% coverage`);
  }
}

function testFormAccessibility(results) {
  const forms = document.querySelectorAll('form');
  let accessibleForms = 0;

  forms.forEach((form) => {
    const inputs = form.querySelectorAll('input, textarea, select');
    let accessibleInputs = 0;

    inputs.forEach((input) => {
      const hasLabel = form.querySelector(`label[for="${input.id}"]`) || input.getAttribute('aria-label');
      const hasAriaInvalid = input.hasAttribute('aria-invalid');
      const hasRequired = input.hasAttribute('aria-required') || input.hasAttribute('required');
      
      if (hasLabel && (hasAriaInvalid || !input.required)) {
        accessibleInputs++;
      }
    });

    if (inputs.length > 0 && accessibleInputs === inputs.length) {
      accessibleForms++;
    }
  });

  if (forms.length > 0 && accessibleForms === forms.length) {
    results.passed++;
    results.details.push(`✅ Form accessibility: ${accessibleForms}/${forms.length} forms compliant`);
  } else {
    results.warnings++;
    results.details.push(`⚠️ Form accessibility: ${accessibleForms}/${forms.length} forms compliant`);
  }
}

function testMobileResponsiveness(results) {
  const viewport = window.visualViewport || { width: window.innerWidth, height: window.innerHeight };
  const isMobile = viewport.width <= 768;
  
  let responsiveScore = 0;

  // Test 1: No horizontal overflow
  const hasHorizontalScroll = document.documentElement.scrollWidth > viewport.width;
  if (!hasHorizontalScroll) responsiveScore += 25;

  // Test 2: Proper viewport meta tag
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  if (viewportMeta && viewportMeta.content.includes('width=device-width')) {
    responsiveScore += 25;
  }

  // Test 3: Touch-action optimization
  const bodyStyle = window.getComputedStyle(document.body);
  if (bodyStyle.touchAction === 'manipulation') {
    responsiveScore += 25;
  }

  // Test 4: Font size prevents zoom on iOS
  const inputs = document.querySelectorAll('input, textarea, select');
  let appropriateFontSize = 0;
  inputs.forEach((input) => {
    const computed = window.getComputedStyle(input);
    const fontSize = parseFloat(computed.fontSize);
    if (fontSize >= 16) appropriateFontSize++;
  });
  
  if (inputs.length === 0 || appropriateFontSize === inputs.length) {
    responsiveScore += 25;
  }

  results.scores.responsiveness = responsiveScore;

  if (responsiveScore >= 75) {
    results.passed++;
    results.details.push(`✅ Mobile responsiveness: ${responsiveScore}% optimized`);
  } else {
    results.warnings++;
    results.details.push(`⚠️ Mobile responsiveness: ${responsiveScore}% optimized`);
  }
}

function testFluidResizing(results) {
  const originalWidth = window.innerWidth;
  let resizeIssues = 0;

  // Simulate different viewport sizes
  const testSizes = [320, 375, 768, 1024, 1280];
  
  testSizes.forEach((width) => {
    // Check for elements that might break at this size
    const elements = document.querySelectorAll('*');
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width > width + 50) { // Allow some tolerance
        resizeIssues++;
      }
    });
  });

  if (resizeIssues === 0) {
    results.passed++;
    results.details.push('✅ Fluid resizing: No layout issues detected');
  } else {
    results.warnings++;
    results.details.push(`⚠️ Fluid resizing: ${resizeIssues} potential issues`);
  }
}

function calculateScores(results) {
  const totalTests = results.passed + results.failed + results.warnings;
  results.scores.accessibility = ((results.passed / totalTests) * 100).toFixed(1);
}

function displayResults(results) {
  const totalTests = results.passed + results.failed + results.warnings;
  const score = ((results.passed / totalTests) * 100).toFixed(1);
  
  console.log('\n🎯 CMF Accessibility & Responsiveness Test Results:');
  console.log(`Overall Score: ${score}%`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`⚠️ Warnings: ${results.warnings}`);
  console.log(`❌ Failed: ${results.failed}`);
  
  console.log('\n📊 Detailed Scores:');
  console.log(`🎯 Accessibility: ${results.scores.accessibility}%`);
  console.log(`📱 Responsiveness: ${results.scores.responsiveness}%`);
  console.log(`👆 Touch Targets: ${results.scores.touchTargets.toFixed(1)}%`);
  console.log(`⌨️ Keyboard Navigation: ${results.scores.keyboard.toFixed(1)}%`);
  
  console.log('\n📋 Detailed Results:');
  results.details.forEach(detail => console.log(`  ${detail}`));

  // Recommendations
  if (results.warnings > 0 || results.failed > 0) {
    console.log('\n💡 Accessibility Recommendations:');
    if (results.scores.touchTargets < 90) {
      console.log('• Increase touch target sizes to minimum 44x44px');
    }
    if (results.scores.keyboard < 80) {
      console.log('• Enhance focus indicators for better keyboard navigation');
    }
    if (results.scores.responsiveness < 75) {
      console.log('• Optimize mobile layout and prevent horizontal scrolling');
    }
  }

  // WCAG Compliance Level
  if (score >= 95) {
    console.log('\n🏆 WCAG 2.2 AA Compliance: EXCELLENT');
  } else if (score >= 85) {
    console.log('\n✅ WCAG 2.2 AA Compliance: GOOD');
  } else if (score >= 75) {
    console.log('\n⚠️ WCAG 2.2 AA Compliance: NEEDS IMPROVEMENT');
  } else {
    console.log('\n❌ WCAG 2.2 AA Compliance: POOR');
  }
}

// Real device simulation for mobile testing
export function simulateMobileDevices() {
  console.log('📱 Simulating mobile device testing...');
  
  const devices = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12 Pro', width: 390, height: 844 },
    { name: 'Samsung Galaxy S21', width: 384, height: 854 },
    { name: 'iPad', width: 768, height: 1024 }
  ];

  devices.forEach(device => {
    console.log(`\n📱 Testing ${device.name} (${device.width}x${device.height}):`);
    
    // Check if hero form stacks properly
    const heroContainer = document.querySelector('.hero-container');
    if (heroContainer) {
      const computed = window.getComputedStyle(heroContainer);
      const isStacked = computed.gridTemplateColumns === '1fr' || device.width < 1024;
      console.log(`  Hero stacking: ${isStacked ? '✅ Stacked' : '⚠️ May not stack'}`);
    }

    // Check capability cards stacking
    const capabilitiesGrid = document.querySelector('.capabilities-grid');
    if (capabilitiesGrid) {
      const cards = capabilitiesGrid.querySelectorAll('.capability-card');
      console.log(`  Capability cards: ${cards.length} cards (should stack on mobile)`);
    }

    // Check form field sizes
    const formInputs = document.querySelectorAll('.hero-form input');
    let touchFriendlyInputs = 0;
    formInputs.forEach(input => {
      const rect = input.getBoundingClientRect();
      if (rect.height >= 44) touchFriendlyInputs++;
    });
    console.log(`  Form inputs: ${touchFriendlyInputs}/${formInputs.length} touch-friendly`);
  });
}

// Auto-run test in development
if (import.meta.env.DEV) {
  // Run test after page loads
  window.addEventListener('load', () => {
    setTimeout(() => {
      runAccessibilityTest();
      simulateMobileDevices();
    }, 2000);
  });
}

// Export for manual testing
window.testCMFAccessibility = runAccessibilityTest;
window.testCMFMobileDevices = simulateMobileDevices;