# Web Accessibility Evaluation

This repository includes automated web accessibility evaluation that runs weekly to ensure compliance with WCAG 2.1 AA standards.

## Overview

The accessibility evaluation workflow (`comprehensive-accessibility.yml`) automatically scans the deployed application at https://ncaa-d1-softball.netlify.app/ using multiple industry-standard tools:

- **pa11y**: Command-line accessibility testing using HTML_CodeSniffer
- **axe-core**: Accessibility testing engine by Deque Systems
- **Lighthouse**: Google's web quality audit tool (accessibility category)

## Multi-Tool Approach Benefits

Each tool provides different perspectives on accessibility compliance:

- **axe-core**: Excellent for structural/semantic WCAG violations (landmarks, headings, ARIA)
- **pa11y**: HTML_CodeSniffer-based testing with different rule interpretations
- **Lighthouse**: Google's weighted scoring algorithm focusing on user experience impact

**Important Note**: Lighthouse uses a weighted scoring system where some critical accessibility audits (like `landmark-one-main`) are hidden from the final score. Our workflow extracts and reports these hidden audit results to provide complete coverage.

This comprehensive approach ensures broader coverage than any single tool could provide.

## Schedule

The accessibility scan runs automatically:
- **Weekly**: Every Monday at 9:00 AM UTC
- **On-demand**: Can be triggered manually via GitHub Actions

## Reports Generated

After each scan, detailed reports are generated and stored as workflow artifacts:

### pa11y Reports
- `pa11y-report.html` - Visual report with highlighted issues and recommendations
- `pa11y-report.json` - Machine-readable JSON data for integration
- `pa11y-report.csv` - Spreadsheet-compatible format for analysis

### axe-core Reports
- `axe-report.json` - Detailed violation analysis with WCAG references

### Lighthouse Reports
- `lighthouse-accessibility.report.html` - Interactive accessibility audit
- `lighthouse-accessibility.report.json` - Raw audit data and scoring details

### Summary Reports
- `README.md` - Comprehensive executive summary with issue counts and status
- `copilot-analysis.md` - AI-powered code pattern analysis and recommendations

## Accessing Reports

1. Go to the **Actions** tab in the GitHub repository
2. Click on the latest "Comprehensive Web Accessibility Evaluation" workflow run
3. Scroll to the bottom and download the `accessibility-evaluation-[run-number]` artifact
4. Extract the ZIP file and review the reports

## Understanding Results

### Workflow Summary
Each run provides an immediate summary showing:
- Total issues found across all tools
- Individual tool results
- Lighthouse accessibility score
- Overall compliance status

### Multi-Layer Analysis
The solution provides three complementary perspectives:

1. **axe-core**: Precise WCAG violation detection
2. **pa11y**: HTML_CodeSniffer rule validation  
3. **Lighthouse**: User experience impact scoring (with hidden audit extraction)

This comprehensive approach ensures broader coverage than any single tool could provide.

### Issue Prioritization
Focus on issues in this order:
1. **High-impact violations** (missing landmarks, no h1 headings)
2. **Keyboard navigation issues** 
3. **Screen reader compatibility problems**
4. **Color contrast violations**
5. **Minor ARIA improvements**

## Standards Compliance

The scans test for compliance with:
- **WCAG 2.1 Level AA** standards
- Semantic HTML structure requirements
- Keyboard navigation support
- Screen reader compatibility
- ARIA best practices
- Color contrast requirements (configurable)
- **Code pattern accessibility** (AI analysis)

## Configuration Options

The workflow can be customized in `.github/workflows/comprehensive-accessibility.yml`:

### Scan Timing
- Modify the `cron` expression to change weekly schedule
- Use `workflow_dispatch` for manual triggering

### Target Configuration
- Change `TARGET_URL` environment variable for different deployment URLs
- Adjust timeout values for slower-loading applications

### Tool Settings
- **pa11y**: Modify standards (WCAG2A, WCAG2AA, WCAG2AAA)
- **axe-core**: Add/remove specific rules
- **Lighthouse**: Configure audit categories and thresholds

## Development Workflow Integration

### Pre-deployment Testing
Consider running accessibility scans before major releases:
```bash
# Local testing with the same tools
npm install -g pa11y @axe-core/cli lighthouse
pa11y http://localhost:3000 --standard WCAG2AA
npx axe http://localhost:3000
lighthouse http://localhost:3000 --only-categories=accessibility
```

### CI/CD Integration
The workflow can be adapted for:
- Pull request validation
- Staging environment testing
- Multi-environment scanning

## Manual Testing Recommendations

Automated testing provides excellent baseline coverage (~30-50% of accessibility issues), but should be supplemented with:

### Essential Manual Tests
- **Keyboard navigation**: Tab through entire interface
- **Screen reader testing**: Test with NVDA, JAWS, or VoiceOver
- **Zoom testing**: Verify usability at 200% zoom
- **Color vision testing**: Check with color blindness simulators

### User Testing
- Include users with disabilities in testing process
- Test with actual assistive technologies
- Validate real-world usage patterns

## Troubleshooting Common Issues

### Workflow Failures
- Check Node.js version compatibility
- Verify target URL accessibility
- Review browser launch arguments for CI environment

### Missing Issues
- Different tools catch different problems (by design)
- Some issues only detectable through manual testing
- Consider adjusting tool configurations for stricter scanning

### False Positives
- Review ignore patterns in pa11y configuration
- Cross-reference findings across multiple tools
- Validate with manual testing when in doubt

## Implementation for Customer Projects

This workflow template can be easily adapted for other projects:

1. **Fork or copy** the workflow file
2. **Update TARGET_URL** to your deployment URL
3. **Adjust tool configurations** for your specific needs
4. **Customize reporting** requirements
5. **Set appropriate scan schedules**

The solution provides a robust foundation for continuous accessibility monitoring suitable for enterprise deployment.

## Support and Documentation

- [pa11y Documentation](https://pa11y.org/)
- [axe-core Rules Reference](https://dequeuniversity.com/rules/axe/)
- [Lighthouse Accessibility Audits](https://web.dev/lighthouse-accessibility/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

For technical support or customization requests, please open an issue in this repository.