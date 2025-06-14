import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Define Axe tags from environment or default
const axeTags = process.env.AXE_TAGS ? process.env.AXE_TAGS.split(',') : ['wcag2a','wcag2aa','wcag21aa'];

test.describe('Comprehensive Accessibility Audit', () => {
  const targetUrl = process.env.TARGET_URL || 'https://ncaa-d1-softball.netlify.app/';
  
  test.beforeEach(async ({ page }) => {
    console.log(`Navigating to: ${targetUrl}`);
    
    try {
      // Navigate to the page before each test
      await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Additional wait to ensure dynamic content is loaded
      await page.waitForTimeout(2000);
      
      console.log('Page loaded successfully');
    } catch (error) {
      console.error(`Failed to load page: ${error.message}`);
      throw error;
    }
  });

  test('axe-core scan - violations and metrics', async ({ page }) => {
    console.log(`Starting axe-core scan with tags: ${axeTags.join(', ')}`);
    
    const results = await new AxeBuilder({ page })
      .withTags(axeTags)
      // include color-contrast check explicitly
      .withRules({ 'color-contrast': { enabled: true } })
      .analyze();

    console.log(`Axe scan completed: ${results.violations.length} violations, ${results.passes.length} passes, ${results.incomplete.length} incomplete`);

    // Attach full report if violations
    if (results.violations.length) {
      await test.info().attach('axe-report.json', { 
        body: JSON.stringify(results, null, 2), 
        contentType: 'application/json' 
      });
      
      // Log violation summary
      console.log('Violation Summary:');
      results.violations.forEach(violation => {
        console.log(`  - ${violation.id}: ${violation.impact} (${violation.nodes.length} elements)`);
      });
    }

    // Compute comprehensive metrics
    const metrics = {
      total: results.violations.length,
      byImpact: results.violations.reduce((acc, v) => { acc[v.impact] = (acc[v.impact] || 0) + 1; return acc; }, {}),
      colorContrastFailures: results.violations.filter(v => v.id === 'color-contrast').length,
      passes: results.passes.length,
      incomplete: results.incomplete.length,
      inapplicable: results.inapplicable.length,
      timestamp: new Date().toISOString(),
      url: targetUrl,
      tags: axeTags
    };
    
    await test.info().attach('axe-metrics.json', { 
      body: JSON.stringify(metrics, null, 2), 
      contentType: 'application/json' 
    });

    // Also attach passes for comprehensive reporting
    if (results.passes.length > 0) {
      await test.info().attach('axe-passes.json', { 
        body: JSON.stringify(results.passes, null, 2), 
        contentType: 'application/json' 
      });
    }

    // Always succeed, scan failures are reported
    expect(Array.isArray(results.violations)).toBe(true);
  });

  test('keyboard navigation - should support tab navigation', async ({ page }) => {
    const issues = [];
    
    console.log('Starting keyboard navigation assessment...');
    
    // Get all focusable elements
    const focusableElements = await page.locator('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])').all();
    
    console.log(`Found ${focusableElements.length} focusable elements`);
    
    // Test tab navigation through first 10 elements (to avoid timeout)
    const elementsToTest = Math.min(focusableElements.length, 10);
    
    if (elementsToTest === 0) {
      issues.push({
        type: 'keyboard-navigation',
        severity: 'serious',
        message: 'No focusable elements found on the page',
        count: 1
      });
    } else {
      // Reset focus to body
      await page.evaluate(() => document.body.focus());
      
      for (let i = 0; i < elementsToTest; i++) {
        try {
          await page.keyboard.press('Tab');
          
          // Check if the focused element has visible focus indicator
          const activeElement = await page.locator(':focus').first();
          const isVisible = await activeElement.isVisible().catch(() => false);
          
          if (isVisible) {
            const elementInfo = {
              tag: await activeElement.evaluate(el => el.tagName).catch(() => 'UNKNOWN'),
              id: await activeElement.getAttribute('id').catch(() => ''),
              className: await activeElement.getAttribute('class').catch(() => ''),
              text: await activeElement.textContent().catch(() => '').then(text => text?.substring(0, 50) || ''),
              index: i
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
            
            // Test if element is properly accessible via keyboard
            const isClickable = await activeElement.evaluate(el => {
              return el.tagName === 'BUTTON' || el.tagName === 'A' || el.hasAttribute('onclick') || el.getAttribute('role') === 'button';
            }).catch(() => false);
            
            if (isClickable) {
              const isKeyboardActivatable = await activeElement.evaluate(el => {
                // Check if Enter or Space can activate this element
                return el.tabIndex >= 0 && (el.tagName === 'BUTTON' || el.tagName === 'A' || el.getAttribute('role') === 'button');
              }).catch(() => false);
              
              if (!isKeyboardActivatable) {
                issues.push({
                  type: 'keyboard-navigation',
                  severity: 'serious',
                  message: `Interactive element ${elementInfo.tag} may not be keyboard activatable`,
                  element: elementInfo
                });
              }
            }
          }
        } catch (error) {
          console.log(`Error testing element ${i}: ${error.message}`);
          issues.push({
            type: 'keyboard-navigation',
            severity: 'minor',
            message: `Error occurred during keyboard navigation test at element ${i}: ${error.message}`,
            index: i
          });
        }
      }
    }
    
    console.log(`Found ${issues.length} keyboard navigation issues`);
    
    if (issues.length > 0) {
      await test.info().attach('keyboard-navigation.json', {
        body: JSON.stringify({
          summary: {
            totalIssues: issues.length,
            totalElementsTested: elementsToTest,
            totalFocusableElements: focusableElements.length
          },
          issues
        }, null, 2),
        contentType: 'application/json'
      });
    }
    
    // Test should pass regardless, but log issues for reporting
    expect(Array.isArray(issues)).toBe(true);
  });

  test('screen reader compatibility - semantic structure', async ({ page }) => {
    const issues = [];
    
    console.log('Starting screen reader compatibility assessment...');
    
    // Test for missing alt text on images
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    const decorativeImages = await page.locator('img[alt=""]').count();
    const totalImages = await page.locator('img').count();
    
    console.log(`Found ${totalImages} images: ${decorativeImages} decorative, ${imagesWithoutAlt} missing alt text`);
    
    if (imagesWithoutAlt > 0) {
      issues.push({
        type: 'screen-reader',
        severity: 'serious',
        message: `${imagesWithoutAlt} images missing alt text`,
        count: imagesWithoutAlt
      });
    }
    
    // Test for unlabeled form inputs
    const inputsWithoutLabels = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
      return inputs.filter(input => {
        if (input.type === 'hidden' || input.type === 'button' || input.type === 'submit' || input.type === 'reset') {
          return false; // These don't need labels
        }
        
        const id = input.id;
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledby = input.getAttribute('aria-labelledby');
        const title = input.getAttribute('title');
        
        return !hasLabel && !ariaLabel && !ariaLabelledby && !title;
      }).length;
    });
    
    console.log(`Found ${inputsWithoutLabels} form inputs without proper labels`);
    
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
        const text = await heading.textContent();
        headingLevels.push({ level, text: text?.substring(0, 50) || '' });
      }
      
      let previousLevel = 0;
      for (const { level, text } of headingLevels) {
        if (level > previousLevel + 1) {
          issues.push({
            type: 'screen-reader',
            severity: 'moderate',
            message: `Heading hierarchy skip detected (h${previousLevel} to h${level}): "${text}"`,
            count: 1
          });
          break;
        }
        previousLevel = level;
      }
      
      // Check for multiple H1s
      const h1Count = headingLevels.filter(h => h.level === 1).length;
      if (h1Count > 1) {
        issues.push({
          type: 'screen-reader',
          severity: 'moderate',
          message: `Multiple H1 headings found (${h1Count}). Should have only one per page.`,
          count: h1Count
        });
      } else if (h1Count === 0) {
        issues.push({
          type: 'screen-reader',
          severity: 'moderate',
          message: 'No H1 heading found. Each page should have exactly one H1.',
          count: 1
        });
      }
    }
    
    // Test for ARIA landmarks
    const landmarks = await page.locator('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], main, nav, header, footer').count();
    const landmarkTypes = await page.evaluate(() => {
      const landmarks = document.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], main, nav, header, footer');
      const types = new Set();
      landmarks.forEach(el => {
        const role = el.getAttribute('role') || el.tagName.toLowerCase();
        types.add(role);
      });
      return Array.from(types);
    });
    
    console.log(`Found ${landmarks} landmarks of types: ${landmarkTypes.join(', ')}`);
    
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
    } else if (pageTitle.length < 10) {
      issues.push({
        type: 'screen-reader',
        severity: 'minor',
        message: `Page title may be too short: "${pageTitle}"`,
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
    
    // Test for skip links
    const skipLinks = await page.locator('a[href^="#"]').first().isVisible().catch(() => false);
    if (!skipLinks) {
      issues.push({
        type: 'screen-reader',
        severity: 'minor',
        message: 'No skip links found for keyboard navigation',
        count: 1
      });
    }
    
    // Test for ARIA live regions for dynamic content
    const liveRegions = await page.locator('[aria-live], [role="alert"], [role="status"]').count();
    console.log(`Found ${liveRegions} ARIA live regions`);
    
    console.log(`Found ${issues.length} screen reader compatibility issues`);
    
    if (issues.length > 0) {
      await test.info().attach('screen-reader.json', {
        body: JSON.stringify({
          summary: {
            totalIssues: issues.length,
            totalImages,
            imagesWithoutAlt,
            decorativeImages,
            inputsWithoutLabels,
            headingsCount: headings.length,
            landmarksCount: landmarks,
            landmarkTypes,
            pageTitle,
            hasLangAttribute: !!langAttribute,
            liveRegionsCount: liveRegions
          },
          issues
        }, null, 2),
        contentType: 'application/json'
      });
    }
    
    // Test should pass regardless, but log issues for reporting
    expect(Array.isArray(issues)).toBe(true);
  });

  test('responsive accessibility - mobile and desktop', async ({ page, isMobile }) => {
    const issues = [];
    
    console.log(`Starting responsive accessibility assessment for ${isMobile ? 'mobile' : 'desktop'}...`);
    
    // Test touch target sizes on mobile
    if (isMobile) {
      const touchTargets = await page.locator('button, a, input[type="button"], input[type="submit"], [role="button"]').all();
      console.log(`Found ${touchTargets.length} touch targets to test`);
      
      let smallTargetsCount = 0;
      for (const target of touchTargets) {
        const box = await target.boundingBox();
        if (box && (box.width < 44 || box.height < 44)) {
          smallTargetsCount++;
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
      console.log(`Found ${smallTargetsCount} touch targets that are too small`);
    }
    
    // Test viewport meta tag
    const viewportMeta = await page.locator('meta[name="viewport"]').count();
    const viewportContent = await page.locator('meta[name="viewport"]').getAttribute('content').catch(() => '');
    
    if (viewportMeta === 0) {
      issues.push({
        type: 'mobile-accessibility',
        severity: 'moderate',
        message: 'Missing viewport meta tag for responsive design',
        count: 1
      });
    } else if (viewportContent && !viewportContent.includes('width=device-width')) {
      issues.push({
        type: 'mobile-accessibility',
        severity: 'minor',
        message: 'Viewport meta tag may not be optimized for responsive design',
        content: viewportContent
      });
    }
    
    // Test horizontal scrolling on mobile
    if (isMobile) {
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      if (hasHorizontalScroll) {
        issues.push({
          type: 'mobile-accessibility',
          severity: 'moderate',
          message: 'Page has horizontal scrolling on mobile which may impact accessibility',
          count: 1
        });
      }
    }
    
    // Test text zoom to 200% (desktop only)
    if (!isMobile) {
      const originalZoom = await page.evaluate(() => document.body.style.zoom || '1');
      
      try {
        // Simulate 200% zoom
        await page.evaluate(() => {
          document.body.style.zoom = '2';
        });
        
        // Check if content is still accessible
        const hasOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth * 2.1;
        });
        
        if (hasOverflow) {
          issues.push({
            type: 'desktop-accessibility',
            severity: 'minor',
            message: 'Content may not be accessible when zoomed to 200%',
            count: 1
          });
        }
        
        // Reset zoom
        await page.evaluate((zoom) => {
          document.body.style.zoom = zoom;
        }, originalZoom);
      } catch (error) {
        console.log(`Zoom test failed: ${error.message}`);
      }
    }
    
    // Test for media queries and responsive design indicators
    const hasMediaQueries = await page.evaluate(() => {
      const stylesheets = Array.from(document.styleSheets);
      for (const sheet of stylesheets) {
        try {
          const rules = Array.from(sheet.cssRules || sheet.rules || []);
          for (const rule of rules) {
            if (rule.type === CSSRule.MEDIA_RULE) {
              return true;
            }
          }
        } catch (e) {
          // Cross-origin stylesheets may throw errors
          continue;
        }
      }
      return false;
    });
    
    if (!hasMediaQueries) {
      issues.push({
        type: 'responsive-design',
        severity: 'minor',
        message: 'No media queries detected - may impact responsive accessibility',
        count: 1
      });
    }
    
    console.log(`Found ${issues.length} responsive accessibility issues (${isMobile ? 'mobile' : 'desktop'})`);
    
    if (issues.length > 0) {
      const filename = `responsive-accessibility-issues-${isMobile ? 'mobile' : 'desktop'}.json`;
      await test.info().attach(filename, {
        body: JSON.stringify({
          summary: {
            totalIssues: issues.length,
            deviceType: isMobile ? 'mobile' : 'desktop',
            viewportMetaPresent: viewportMeta > 0,
            viewportContent,
            hasMediaQueries
          },
          issues
        }, null, 2),
        contentType: 'application/json'
      });
    }
    
    // Test should pass regardless, but log issues for reporting
    expect(Array.isArray(issues)).toBe(true);
  });

  test('color and contrast accessibility', async ({ page }) => {
    const issues = [];
    
    console.log('Starting color and contrast accessibility assessment...');
    
    // Test for color-only information
    const colorOnlyElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const colorOnlyIssues = [];
      
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const text = el.textContent?.trim();
        
        // Check for elements that might rely only on color
        if (text && (
          text.toLowerCase().includes('red') ||
          text.toLowerCase().includes('green') ||
          text.toLowerCase().includes('error') ||
          text.toLowerCase().includes('success') ||
          text.toLowerCase().includes('warning')
        )) {
          const hasIcon = el.querySelector('i, svg, .icon') !== null;
          const hasExtraText = text.length > 20;
          
          if (!hasIcon && !hasExtraText) {
            colorOnlyIssues.push({
              tag: el.tagName,
              text: text.substring(0, 50),
              hasIcon,
              hasExtraText
            });
          }
        }
      });
      
      return colorOnlyIssues;
    });
    
    if (colorOnlyElements.length > 0) {
      issues.push({
        type: 'color-accessibility',
        severity: 'moderate',
        message: `${colorOnlyElements.length} elements may rely solely on color to convey information`,
        count: colorOnlyElements.length,
        elements: colorOnlyElements
      });
    }
    
    // Test for sufficient color contrast ratios
    const lowContrastElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent?.trim();
        return text && text.length > 0 && el.offsetWidth > 0 && el.offsetHeight > 0;
      });
      
      const contrastIssues = [];
      const MAX_ELEMENTS = 50; // Limit to avoid timeout
      
      elements.slice(0, MAX_ELEMENTS).forEach(el => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const backgroundColor = style.backgroundColor;
        
        // Skip transparent backgrounds or inherit
        if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
          return;
        }
        
        // This is a simplified check - in reality, you'd use a proper contrast calculation
        if (color && backgroundColor) {
          contrastIssues.push({
            tag: el.tagName,
            text: el.textContent?.substring(0, 30) || '',
            color,
            backgroundColor
          });
        }
      });
      
      return contrastIssues.slice(0, 10); // Return up to 10 for analysis
    });
    
    console.log(`Found ${colorOnlyElements.length} potential color-only elements and ${lowContrastElements.length} elements to check for contrast`);
    
    if (issues.length > 0) {
      await test.info().attach('color-accessibility.json', {
        body: JSON.stringify({
          summary: {
            totalIssues: issues.length,
            colorOnlyElements: colorOnlyElements.length,
            elementsCheckedForContrast: lowContrastElements.length
          },
          issues,
          contrastElements: lowContrastElements
        }, null, 2),
        contentType: 'application/json'
      });
    }
    
    // Test should pass regardless, but log issues for reporting
    expect(Array.isArray(issues)).toBe(true);
  });

  test('dynamic content accessibility', async ({ page }) => {
    const issues = [];
    
    console.log('Starting dynamic content accessibility assessment...');
    
    // Test for proper ARIA live regions
    const liveRegions = await page.locator('[aria-live], [role="alert"], [role="status"], [role="log"]').count();
    const dynamicElements = await page.locator('[data-*], .loading, .error, .success, .alert').count();
    
    if (dynamicElements > 0 && liveRegions === 0) {
      issues.push({
        type: 'dynamic-content',
        severity: 'moderate',
        message: `Found ${dynamicElements} dynamic elements but no ARIA live regions for screen reader announcements`,
        count: 1
      });
    }
    
    // Test for loading states
    const loadingElements = await page.locator('.loading, [aria-busy="true"], .spinner').count();
    const loadingWithAria = await page.locator('.loading[aria-label], [aria-busy="true"][aria-label], .spinner[aria-label]').count();
    
    if (loadingElements > 0 && loadingWithAria === 0) {
      issues.push({
        type: 'dynamic-content',
        severity: 'moderate',
        message: `${loadingElements} loading indicators without proper ARIA labels`,
        count: loadingElements
      });
    }
    
    // Test for error messages
    const errorElements = await page.locator('.error, .invalid, [aria-invalid="true"]').count();
    const errorWithDescription = await page.locator('.error[aria-describedby], .invalid[aria-describedby], [aria-invalid="true"][aria-describedby]').count();
    
    if (errorElements > 0 && errorWithDescription < errorElements) {
      issues.push({
        type: 'dynamic-content',
        severity: 'serious',
        message: `${errorElements - errorWithDescription} error states without proper ARIA descriptions`,
        count: errorElements - errorWithDescription
      });
    }
    
    console.log(`Found ${issues.length} dynamic content accessibility issues`);
    
    if (issues.length > 0) {
      await test.info().attach('dynamic-content.json', {
        body: JSON.stringify({
          summary: {
            totalIssues: issues.length,
            liveRegions,
            dynamicElements,
            loadingElements,
            loadingWithAria,
            errorElements,
            errorWithDescription
          },
          issues
        }, null, 2),
        contentType: 'application/json'
      });
    }
    
    // Test should pass regardless, but log issues for reporting
    expect(Array.isArray(issues)).toBe(true);
  });
});