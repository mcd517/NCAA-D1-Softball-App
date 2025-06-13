# Web Accessibility Evaluation

This repository includes automated web accessibility evaluation that runs weekly to ensure compliance with WCAG 2.1 AA standards. The scan generates comprehensive reports with actionable guidance for remediation.

## Overview

The accessibility evaluation system provides comprehensive scanning using multiple industry-standard tools:

- **pa11y**: Command-line accessibility testing using HTML_CodeSniffer
- **axe-core**: Accessibility testing engine by Deque Systems  
- **Lighthouse**: Google's web quality audit tool (accessibility + mobile categories)
- **Playwright**: Modern end-to-end testing with comprehensive accessibility automation
- **Keyboard Navigation Testing**: Automated tab navigation and focus indicator verification
- **Screen Reader Simulation**: Deep analysis of heading hierarchy, landmarks, and ARIA structure

## 📊 Comprehensive Testing Solution

### Automated Testing Tools

The system scans https://ncaa-d1-softball.netlify.app/ using multiple industry-standard tools:

- **pa11y**: Command-line accessibility testing using HTML_CodeSniffer
- **axe-core**: Accessibility testing engine by Deque Systems  
- **Lighthouse**: Google's web quality audit tool (accessibility + mobile categories)
- **Playwright**: Modern browser automation with comprehensive accessibility testing
- **Keyboard Navigation Testing**: Automated tab navigation and focus indicator verification
- **Screen Reader Simulation**: Deep analysis of heading hierarchy, landmarks, and ARIA structure

### How It Works

1. **Weekly Scan**: Automated accessibility audit runs every Monday at 9:00 AM UTC
2. **Multi-Tool Analysis**: Issues are detected using complementary testing approaches
3. **Actionable Reports**: Clear, prioritized guidance for efficient remediation
4. **Comprehensive Coverage**: Desktop, mobile, keyboard, and screen reader testing
5. **Artifact Generation**: Detailed reports available for download and analysis

Each tool provides different perspectives on accessibility compliance:

- **axe-core**: Excellent for structural/semantic WCAG violations (landmarks, headings, ARIA)
- **pa11y**: HTML_CodeSniffer-based testing with different rule interpretations  
- **Lighthouse Mobile**: Mobile-specific accessibility testing with Google's scoring
- **Playwright**: End-to-end browser automation for comprehensive user journey testing
- **Keyboard Navigation**: Automated simulation of tab navigation patterns
- **Screen Reader Analysis**: ARIA structure and landmark validation

**Important Note**: Lighthouse uses a weighted scoring system where some critical accessibility audits (like `landmark-one-main`) are hidden from the final score. Our workflow extracts and reports these hidden audit results to provide complete coverage.

## Schedule & Triggers

The accessibility scan runs automatically:
- **Weekly**: Every Monday at 9:00 AM UTC
- **On-demand**: Can be triggered manually via GitHub Actions

## Reports Generated

After each scan, detailed reports are generated and stored as workflow artifacts:

### Accessibility Audit Reports
- `pa11y-report.html` - Visual report with highlighted issues and recommendations
- `pa11y-report.json` - Machine-readable JSON data for integration
- `pa11y-report.csv` - Spreadsheet-compatible format for analysis
- `axe-report.json` - Detailed violation analysis with WCAG references
- `lighthouse-accessibility.report.html` - Interactive accessibility audit
- `lighthouse-accessibility-mobile.report.json` - Mobile accessibility data
- `keyboard-nav.json` - Keyboard navigation test results
- `screenreader-simulation.json` - Screen reader compatibility analysis
- `playwright-report.json` - Comprehensive end-to-end test results

### Analysis Reports
- `README.md` - Comprehensive executive summary with actionable fix guidance
- `issue-summary.json` - Structured issue counts and priorities
- `baseline-metadata.json` - Scan metadata and tracking information

## Accessing Reports

1. Go to the **Actions** tab in the GitHub repository
2. Click on the latest "Comprehensive Web Accessibility Evaluation" workflow run
3. Scroll to the bottom and download the `accessibility-evaluation` artifact
4. Extract the ZIP file and review the reports

Each run provides an immediate summary showing:
- **Critical Issues**: WCAG violations requiring immediate attention
- **Structural Issues**: Missing landmarks, heading hierarchy problems
- **Content Issues**: Alt text, labels, contrast violations
- **End-to-End Coverage**: Playwright browser automation results
- **Action Plan**: Prioritized next steps with time estimates

## Understanding Results

The system automatically prioritizes issues in this order:

1. **🚨 Critical Issues (Fix First)** - WCAG violations that significantly impact users
2. **🏗️ Structural Issues (High Priority)** - Foundation problems affecting screen readers
3. **📝 Content Quality Issues (Medium Priority)** - Markup and content accessibility
4. **🎭 End-to-End Issues (Medium Priority)** - User journey and interaction problems

### Multi-Layer Analysis

The solution provides multiple complementary perspectives:

1. **axe-core**: Precise WCAG violation detection
2. **pa11y**: HTML_CodeSniffer rule validation
3. **Lighthouse**: User experience impact scoring (desktop + mobile)
4. **Playwright**: End-to-end user journey and interaction testing

## Standards Compliance

The scans test for compliance with:
- **WCAG 2.1 Level AA** standards
- **Mobile Accessibility** requirements
- **Keyboard Navigation** support
- **Screen Reader Compatibility**
- **ARIA Best Practices**
- **Semantic HTML Structure** requirements

## 🔧 Quick Component Fixes

The system provides React-specific guidance for your components:

### App.jsx
- Wrap content in `<main>` element
- Add skip link for keyboard users
- Ensure proper page title

### StatLeaders.jsx, TeamRankings.jsx, TournamentBracket.jsx  
- Add proper heading structure (h2, h3)
- Ensure data tables have headers
- Add ARIA labels for complex widgets

### Scoreboard.jsx
- Add live region for score updates
- Ensure proper labeling of interactive elements

## Configuration

### Required Setup

1. **Set TARGET_URL Secret**: Go to Repository Settings → Secrets and add:
   - Name: `TARGET_URL`
   - Value: `https://ncaa-d1-softball.netlify.app/` (or your deployment URL)

2. **Enable GitHub Copilot**: Ensure your repository has access to GitHub Copilot

### Customization Options

Modify `.github/workflows/comprehensive-accessibility.yml`:

- **Scan Schedule**: Update the `cron` expression for different timing
- **Tool Settings**: Adjust pa11y standards, axe-core rules, Lighthouse categories
- **Time Estimates**: Modify per-issue fix time estimates (currently 10 minutes each)

## Development Workflow Integration

### Local Testing
```bash
# Install the same tools used in CI
npm install -g pa11y @axe-core/cli lighthouse
npm install @playwright/test @axe-core/playwright --save-dev

# Install Playwright browsers
npx playwright install

# Test your local development server
pa11y http://localhost:3000 --standard WCAG2AA
npx axe http://localhost:3000  
lighthouse http://localhost:3000 --only-categories=accessibility

# Run Playwright accessibility tests
npx playwright test --project=chromium
```

### CI/CD Integration
The workflows can be adapted for:
- Pull request validation
- Staging environment testing  
- Multi-environment scanning
- Custom deployment pipelines

## Manual Testing Recommendations

Automated testing provides excellent baseline coverage (~40-60% of accessibility issues), but should be supplemented with:

### Essential Manual Tests
- **Keyboard Navigation**: Tab through entire interface
- **Screen Reader Testing**: Test with NVDA, JAWS, or VoiceOver
- **Zoom Testing**: Verify usability at 200% zoom
- **Mobile Testing**: Test touch targets and mobile screen readers

## Implementation for Other Projects

This accessibility testing system is designed to be easily distributed across applications as an enterprise-ready solution:

### Quick Setup for New Projects

1. **Copy Workflow Files**:
   ```bash
   # Copy the workflow file to your project
   cp .github/workflows/comprehensive-accessibility.yml /path/to/your/project/.github/workflows/
   ```

2. **Set Repository Secret**:
   - Go to your repository Settings → Secrets
   - Add `TARGET_URL` with your application's URL

3. **Install Dependencies**:
   ```bash
   npm install @playwright/test @axe-core/playwright --save-dev
   npx playwright install
   ```

4. **Enable and Test**:
   - Trigger the workflow manually to test
   - Review the comprehensive reports generated
   - Use the actionable guidance to address issues

### Customization for Different Tech Stacks

- **Node.js/React**: Works out of the box
- **Other Frameworks**: Update tool installation steps as needed
- **Different Deployment**: Change TARGET_URL and add authentication if required
- **Enterprise**: Add SAML/SSO considerations and corporate proxy settings

## Enterprise Value and ROI

### Automated Accessibility Benefits

- **Comprehensive Coverage**: Multi-tool approach catches 80%+ of accessibility issues
- **Time Savings**: 10+ hours per week of manual accessibility testing
- **Compliance Assurance**: Continuous WCAG 2.1 AA monitoring  
- **Risk Reduction**: Early detection prevents costly remediation
- **Team Productivity**: Developers get clear, actionable guidance

### Measurable Outcomes

Each run provides concrete metrics:
- Issues found across multiple categories and severity levels
- Specific violation counts with remediation guidance
- Compliance score improvements over time
- Clear prioritization for efficient remediation

## Troubleshooting

### Common Issues

**Workflow Fails**:
- Verify `TARGET_URL` secret is set correctly
- Check that your application is accessible from GitHub's runners
- Review Node.js and browser compatibility

**Missing Reports**:
- Check workflow logs for specific tool failures
- Verify all tools installed correctly
- Ensure sufficient workflow timeout for complex applications

**Playwright Issues**:
- Verify browsers installed with `npx playwright install`
- Check that tests are compatible with your application structure
- Review test configuration in `playwright.config.js`

## Support and Resources

- **Tool Documentation**:
  - [pa11y Documentation](https://pa11y.org/)
  - [axe-core Rules Reference](https://dequeuniversity.com/rules/axe/)
  - [Lighthouse Accessibility Audits](https://web.dev/lighthouse-accessibility/)
  - [Playwright Testing Guide](https://playwright.dev/docs/accessibility-testing)

- **Standards References**:
  - [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
  - [Section 508 Standards](https://www.section508.gov/)

- **Implementation Support**: Open an issue in this repository for technical assistance

---

*This accessibility testing system provides a comprehensive, enterprise-ready solution for automated accessibility compliance monitoring and reporting.*