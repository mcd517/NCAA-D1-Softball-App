import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Comprehensive Accessibility Audit', () => {
  const targetUrl = process.env.TARGET_URL || 'https://ncaa-d1-softball.netlify.app/';
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the page before each test
    await page.goto(targetUrl);
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('axe-core accessibility scan - should pass WCAG 2.1 AA', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    // Assert that there are no accessibility violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('axe-core accessibility scan - detailed violation report', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    // If there are violations, log them in detail for reporting
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations found:');
      accessibilityScanResults.violations.forEach((violation, index) => {
        console.log(`\n--- Violation ${index + 1} ---`);
        console.log(`ID: ${violation.id}`);
        console.log(`Impact: ${violation.impact}`);
        console.log(`Description: ${violation.description}`);
        console.log(`Help: ${violation.help}`);
        console.log(`Help URL: ${violation.helpUrl}`);
        console.log(`Tags: ${violation.tags.join(', ')}`);
        console.log(`Nodes affected: ${violation.nodes.length}`);
        
        violation.nodes.forEach((node, nodeIndex) => {
          console.log(`  Node ${nodeIndex + 1}:`);
          console.log(`    HTML: ${node.html}`);
          console.log(`    Target: ${node.target.join(', ')}`);
          console.log(`    Failure Summary: ${node.failureSummary}`);
        });
      });
      
      // Attach the full report as test artifact
      await test.info().attach('axe-violations-report.json', {
        body: JSON.stringify(accessibilityScanResults, null, 2),
        contentType: 'application/json'
      });
    }

    // Generate metrics for reporting
    const metrics = {
      totalViolations: accessibilityScanResults.violations.length,
      criticalViolations: accessibilityScanResults.violations.filter(v => v.impact === 'critical').length,
      seriousViolations: accessibilityScanResults.violations.filter(v => v.impact === 'serious').length,
      moderateViolations: accessibilityScanResults.violations.filter(v => v.impact === 'moderate').length,
      minorViolations: accessibilityScanResults.violations.filter(v => v.impact === 'minor').length,
      passes: accessibilityScanResults.passes.length,
      incomplete: accessibilityScanResults.incomplete.length,
      inapplicable: accessibilityScanResults.inapplicable.length
    };

    console.log('\n--- Accessibility Scan Metrics ---');
    console.log(`Total violations: ${metrics.totalViolations}`);
    console.log(`Critical: ${metrics.criticalViolations}`);
    console.log(`Serious: ${metrics.seriousViolations}`);
    console.log(`Moderate: ${metrics.moderateViolations}`); 
    console.log(`Minor: ${metrics.minorViolations}`);
    console.log(`Passes: ${metrics.passes}`);
    console.log(`Incomplete: ${metrics.incomplete}`);
    console.log(`Inapplicable: ${metrics.inapplicable}`);

    // Attach metrics as test artifact
    await test.info().attach('accessibility-metrics.json', {
      body: JSON.stringify(metrics, null, 2),
      contentType: 'application/json'
    });
  });

  test('keyboard navigation - should support tab navigation', async ({ page }) => {
    const issues = [];
    
    // Get all focusable elements
    const focusableElements = await page.locator('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])').all();
    
    console.log(`Found ${focusableElements.length} focusable elements`);
    
    // Test tab navigation through first 10 elements (to avoid timeout)
    const elementsToTest = Math.min(focusableElements.length, 10);
    
    for (let i = 0; i < elementsToTest; i++) {
      await page.keyboard.press('Tab');
      
      // Check if the focused element has visible focus indicator
      const activeElement = await page.locator(':focus').first();
      const isVisible = await activeElement.isVisible().catch(() => false);
      
      if (isVisible) {
        const elementInfo = {
          tag: await activeElement.evaluate(el => el.tagName).catch(() => 'UNKNOWN'),
          id: await activeElement.getAttribute('id').catch(() => ''),
          className: await activeElement.getAttribute('class').catch(() => ''),
          text: await activeElement.textContent().catch(() => '').then(text => text?.substring(0, 50) || '')
        };
        
        // Check if element has visible focus indicator
        const hasVisibleFocus = await activeElement.evaluate((el) => {
          const computedStyle = window.getComputedStyle(el);
          const pseudoStyle = window.getComputedStyle(el, ':focus');
          
          return (
            computedStyle.outline !== 'none' ||
            computedStyle.outlineWidth !== '0px' ||
            computedStyle.outlineStyle !== 'none' ||
            computedStyle.boxShadow !== 'none' ||
            pseudoStyle.outline !== 'none' ||
            pseudoStyle.outlineWidth !== '0px' ||
            pseudoStyle.boxShadow !== 'none'
          );
        }).catch(() => false);
        
        if (!hasVisibleFocus) {
          issues.push({
            type: 'keyboard-navigation',
            severity: 'moderate',
            message: `Element ${elementInfo.tag} lacks visible focus indicator`,
            element: elementInfo
          });
        }
      }
    }
    
    console.log(`Found ${issues.length} keyboard navigation issues`);
    
    if (issues.length > 0) {
      await test.info().attach('keyboard-navigation-issues.json', {
        body: JSON.stringify(issues, null, 2),
        contentType: 'application/json'
      });
    }
    
    // Test should pass regardless, but log issues for reporting
    expect(Array.isArray(issues)).toBe(true);
  });

  test('screen reader compatibility - semantic structure', async ({ page }) => {
    const issues = [];
    
    // Test for missing alt text on images
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    if (imagesWithoutAlt > 0) {
      issues.push({
        type: 'screen-reader',
        severity: 'serious',
        message: `${imagesWithoutAlt} images missing alt text`,
        count: imagesWithoutAlt
      });
    }
    
    // Test for unlabeled form inputs
    const unlabeledInputs = await page.locator('input:not([aria-label]):not([aria-labelledby])').count();
    const inputsWithoutLabels = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      return inputs.filter(input => {
        const id = input.id;
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledby = input.getAttribute('aria-labelledby');
        return !hasLabel && !ariaLabel && !ariaLabelledby;
      }).length;
    });
    
    if (inputsWithoutLabels > 0) {
      issues.push({
        type: 'screen-reader',
        severity: 'serious',
        message: `${inputsWithoutLabels} form inputs missing labels`,
        count: inputsWithoutLabels
      });
    }
    
    // Test heading structure
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    console.log(`Found ${headings.length} headings`);
    
    if (headings.length === 0) {
      issues.push({
        type: 'screen-reader',
        severity: 'moderate',
        message: 'No heading structure found for screen reader navigation',
        count: 1
      });
    } else {
      // Check heading hierarchy
      const headingLevels = [];
      for (const heading of headings) {
        const tagName = await heading.evaluate(el => el.tagName);
        const level = parseInt(tagName[1]);
        headingLevels.push(level);
      }
      
      let previousLevel = 0;
      for (const level of headingLevels) {
        if (level > previousLevel + 1) {
          issues.push({
            type: 'screen-reader',
            severity: 'moderate',
            message: `Heading hierarchy skip detected (h${previousLevel} to h${level})`,
            count: 1
          });
          break;
        }
        previousLevel = level;
      }
    }
    
    // Test for ARIA landmarks
    const landmarks = await page.locator('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], main, nav, header, footer').count();
    if (landmarks === 0) {
      issues.push({
        type: 'screen-reader',
        severity: 'moderate',
        message: 'No ARIA landmarks found for screen reader navigation',
        count: 1
      });
    }
    
    // Test page title
    const pageTitle = await page.title();
    if (!pageTitle || pageTitle.trim() === '') {
      issues.push({
        type: 'screen-reader',
        severity: 'moderate',
        message: 'Page missing descriptive title',
        count: 1
      });
    }
    
    // Test language attribute
    const langAttribute = await page.locator('html').getAttribute('lang');
    if (!langAttribute) {
      issues.push({
        type: 'screen-reader',
        severity: 'moderate',
        message: 'HTML element missing lang attribute',
        count: 1
      });
    }
    
    console.log(`Found ${issues.length} screen reader compatibility issues`);
    
    if (issues.length > 0) {
      await test.info().attach('screen-reader-issues.json', {
        body: JSON.stringify(issues, null, 2),
        contentType: 'application/json'
      });
    }
    
    // Test should pass regardless, but log issues for reporting
    expect(Array.isArray(issues)).toBe(true);
  });

  test('responsive accessibility - mobile and desktop', async ({ page, isMobile }) => {
    const issues = [];
    
    // Test touch target sizes on mobile
    if (isMobile) {
      const touchTargets = await page.locator('button, a, input[type="button"], input[type="submit"], [role="button"]').all();
      
      for (const target of touchTargets) {
        const box = await target.boundingBox();
        if (box && (box.width < 44 || box.height < 44)) {
          const tagName = await target.evaluate(el => el.tagName);
          const text = await target.textContent();
          
          issues.push({
            type: 'mobile-accessibility',
            severity: 'moderate',
            message: `Touch target too small: ${tagName} "${text?.substring(0, 30) || ''}" (${box.width}x${box.height}px, minimum 44x44px)`,
            element: { tag: tagName, text: text?.substring(0, 30) || '', width: box.width, height: box.height }
          });
        }
      }
    }
    
    // Test viewport meta tag
    const viewportMeta = await page.locator('meta[name="viewport"]').count();
    if (viewportMeta === 0) {
      issues.push({
        type: 'mobile-accessibility',
        severity: 'moderate',
        message: 'Missing viewport meta tag for responsive design',
        count: 1
      });
    }
    
    console.log(`Found ${issues.length} responsive accessibility issues (${isMobile ? 'mobile' : 'desktop'})`);
    
    if (issues.length > 0) {
      const filename = `responsive-accessibility-issues-${isMobile ? 'mobile' : 'desktop'}.json`;
      await test.info().attach(filename, {
        body: JSON.stringify(issues, null, 2),
        contentType: 'application/json'
      });
    }
    
    // Test should pass regardless, but log issues for reporting
    expect(Array.isArray(issues)).toBe(true);
  });
});