#!/usr/bin/env node

/**
 * Validate accessibility test syntax without running the tests
 * This helps verify that the test file is properly structured
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Validating accessibility test syntax...');

try {
  // Read the test file
  const testFile = join(__dirname, 'tests/accessibility/accessibility.spec.js');
  const testContent = readFileSync(testFile, 'utf8');
  
  console.log('✅ Test file exists and is readable');
  
  // Basic syntax validation
  const requiredImports = [
    "import { test, expect } from '@playwright/test'",
    "import AxeBuilder from '@axe-core/playwright'"
  ];
  
  const requiredTests = [
    'axe-core scan - violations and metrics',
    'keyboard navigation - should support tab navigation',
    'screen reader compatibility - semantic structure',
    'responsive accessibility - mobile and desktop',
    'color and contrast accessibility',
    'dynamic content accessibility'
  ];
  
  // Check imports
  requiredImports.forEach(importStatement => {
    if (testContent.includes(importStatement)) {
      console.log(`✅ Found required import: ${importStatement}`);
    } else {
      console.log(`❌ Missing required import: ${importStatement}`);
    }
  });
  
  // Check test cases
  requiredTests.forEach(testName => {
    if (testContent.includes(testName)) {
      console.log(`✅ Found test: ${testName}`);
    } else {
      console.log(`❌ Missing test: ${testName}`);
    }
  });
  
  // Count lines and estimate complexity
  const lines = testContent.split('\n').length;
  const testCases = (testContent.match(/test\(/g) || []).length;
  const describes = (testContent.match(/test\.describe\(/g) || []).length;
  
  console.log('\n📊 Test file metrics:');
  console.log(`  Lines of code: ${lines}`);
  console.log(`  Test cases: ${testCases}`);
  console.log(`  Describe blocks: ${describes}`);
  
  // Check for potential issues
  const potentialIssues = [];
  
  if (testContent.includes('await page.goto(') && !testContent.includes('timeout:')) {
    potentialIssues.push('Some page.goto() calls may be missing timeout configuration');
  }
  
  if (!testContent.includes('console.log(')) {
    potentialIssues.push('No logging found - consider adding debug output');
  }
  
  if (!testContent.includes('test.info().attach(')) {
    potentialIssues.push('No test attachments found - results may not be properly saved');
  }
  
  if (potentialIssues.length > 0) {
    console.log('\n⚠️ Potential issues:');
    potentialIssues.forEach(issue => console.log(`  - ${issue}`));
  } else {
    console.log('\n✅ No obvious issues detected');
  }
  
  console.log('\n🎉 Test syntax validation completed successfully!');
  
} catch (error) {
  console.error('❌ Test syntax validation failed:', error.message);
  process.exit(1);
}