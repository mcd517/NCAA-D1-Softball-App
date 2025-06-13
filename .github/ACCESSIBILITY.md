# Web Accessibility Evaluation with AI-Powered Fixes

This repository includes automated web accessibility evaluation that runs weekly to ensure compliance with WCAG 2.1 AA standards, with **automated GitHub Copilot integration** that creates and fixes accessibility issues automatically.

## Overview

The accessibility evaluation system consists of two integrated workflows:

1. **Comprehensive Accessibility Audit** (`comprehensive-accessibility.yml`) - Scans the application and creates GitHub issues for violations
2. **Copilot Post-Merge Analysis** (`copilot-post-merge.yml`) - Measures the effectiveness of Copilot's automated fixes

### Automated Tools Used

The system scans https://ncaa-d1-softball.netlify.app/ using multiple industry-standard tools:

- **pa11y**: Command-line accessibility testing using HTML_CodeSniffer
- **axe-core**: Accessibility testing engine by Deque Systems  
- **Lighthouse**: Google's web quality audit tool (accessibility + mobile categories)
- **Keyboard Navigation Testing**: Automated tab navigation and focus indicator verification
- **Screen Reader Simulation**: Deep analysis of heading hierarchy, landmarks, and ARIA structure

## 🤖 AI-Powered Accessibility Fixes

### How It Works

1. **Weekly Scan**: Automated accessibility audit runs every Monday at 9:00 AM UTC
2. **Issue Creation**: When violations are found, a GitHub issue is automatically created
3. **Copilot Assignment**: The issue is automatically assigned to GitHub Copilot's coding agent
4. **Automated Fixes**: Copilot analyzes the violations and creates a PR with fixes
5. **Impact Measurement**: After the PR is merged, the system re-runs scans and measures:
   - Number of issues fixed by Copilot
   - Additional issues Copilot discovered and fixed
   - Estimated time saved compared to manual fixes

### AI Fix Tracking

Each workflow run now includes a "🤖 Copilot Assisted Fixes" section showing:
- **Fixes applied by Copilot**: Number of violations automatically resolved
- **Additional issues found**: New accessibility improvements Copilot discovered
- **Time saved**: Estimated hours saved vs. manual accessibility remediation

## Multi-Tool Approach Benefits

Each tool provides different perspectives on accessibility compliance:

- **axe-core**: Excellent for structural/semantic WCAG violations (landmarks, headings, ARIA)
- **pa11y**: HTML_CodeSniffer-based testing with different rule interpretations  
- **Lighthouse Mobile**: Mobile-specific accessibility testing with Google's scoring
- **Keyboard Navigation**: Automated simulation of tab navigation patterns
- **Screen Reader Analysis**: ARIA structure and landmark validation

**Important Note**: Lighthouse uses a weighted scoring system where some critical accessibility audits (like `landmark-one-main`) are hidden from the final score. Our workflow extracts and reports these hidden audit results to provide complete coverage.

## Schedule & Triggers

The accessibility scan runs automatically:
- **Weekly**: Every Monday at 9:00 AM UTC
- **On-demand**: Can be triggered manually via GitHub Actions
- **Post-merge**: Automatically runs after Copilot merges accessibility fixes

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

### AI Analysis Reports
- `README.md` - Comprehensive executive summary with actionable fix guidance
- `copilot-summary.json` - Copilot effectiveness metrics and time savings

## Accessing Reports

1. Go to the **Actions** tab in the GitHub repository
2. Click on the latest "Comprehensive Web Accessibility Evaluation" workflow run
3. Scroll to the bottom and download the `accessibility-evaluation` artifact
4. Extract the ZIP file and review the reports

### Workflow Summary Dashboard

Each run provides an immediate summary showing:
- **Critical Issues**: WCAG violations requiring immediate attention
- **Structural Issues**: Missing landmarks, heading hierarchy problems
- **Content Issues**: Alt text, labels, contrast violations
- **Copilot Impact**: Fixes applied and time saved
- **Action Plan**: Prioritized next steps with time estimates

## Understanding Results

### Issue Prioritization

The system automatically prioritizes issues in this order:

1. **🚨 Critical Issues (Fix First)** - WCAG violations that significantly impact users
2. **🏗️ Structural Issues (High Priority)** - Foundation problems affecting screen readers
3. **📝 Content Quality Issues (Medium Priority)** - Markup and content accessibility
4. **🤖 AI-Assisted Fixes** - Issues Copilot can automatically resolve

### Multi-Layer Analysis

The solution provides four complementary perspectives:

1. **axe-core**: Precise WCAG violation detection
2. **pa11y**: HTML_CodeSniffer rule validation
3. **Lighthouse**: User experience impact scoring (desktop + mobile)
4. **AI Analysis**: Pattern recognition and automated fix suggestions

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

# Test your local development server
pa11y http://localhost:3000 --standard WCAG2AA
npx axe http://localhost:3000  
lighthouse http://localhost:3000 --only-categories=accessibility
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

This accessibility testing system is designed to be easily distributed across applications:

### Quick Setup for New Projects

1. **Copy Workflow Files**:
   ```bash
   # Copy both workflow files to your project
   cp .github/workflows/comprehensive-accessibility.yml /path/to/your/project/.github/workflows/
   cp .github/workflows/copilot-post-merge.yml /path/to/your/project/.github/workflows/
   ```

2. **Set Repository Secret**:
   - Go to your repository Settings → Secrets
   - Add `TARGET_URL` with your application's URL

3. **Enable and Test**:
   - Trigger the workflow manually to test
   - Let Copilot automatically fix any found issues
   - Review the effectiveness metrics

### Customization for Different Tech Stacks

- **Node.js/React**: Works out of the box
- **Other Frameworks**: Update tool installation steps as needed
- **Different Deployment**: Change TARGET_URL and add authentication if required
- **Enterprise**: Add SAML/SSO considerations and corporate proxy settings

## ROI and Business Value

### Automated Accessibility Benefits

- **Time Savings**: 10+ hours per week of manual accessibility testing
- **Compliance Assurance**: Continuous WCAG 2.1 AA monitoring  
- **Risk Reduction**: Early detection prevents costly remediation
- **Team Productivity**: Developers focus on features while AI handles accessibility

### Measurable Outcomes

Each run provides concrete metrics:
- Issues automatically fixed by AI
- Time saved vs manual remediation
- Compliance score improvements
- Accessibility debt reduction

## Troubleshooting

### Common Issues

**Workflow Fails**:
- Verify `TARGET_URL` secret is set correctly
- Check that your application is accessible from GitHub's runners
- Review Node.js and browser compatibility

**Copilot Doesn't Create Issues**:
- Ensure GitHub Copilot is enabled for your repository
- Check that violations were actually found in the scan
- Verify the GraphQL API calls have proper permissions

**Missing Copilot Metrics**:
- Copilot summary only appears after Copilot merges a PR
- The post-merge workflow may take 2-3 minutes to complete
- Check that the artifact download is finding the right reports

## Support and Resources

- **Tool Documentation**:
  - [pa11y Documentation](https://pa11y.org/)
  - [axe-core Rules Reference](https://dequeuniversity.com/rules/axe/)
  - [Lighthouse Accessibility Audits](https://web.dev/lighthouse-accessibility/)

- **Standards References**:
  - [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
  - [GitHub Copilot Documentation](https://docs.github.com/en/copilot)

- **Implementation Support**: Open an issue in this repository for technical assistance

---

*This accessibility testing system transforms manual accessibility work into an automated, AI-powered process that continuously improves your application's accessibility while providing measurable business value.*