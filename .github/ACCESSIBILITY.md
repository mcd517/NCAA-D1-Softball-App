# Web Accessibility Evaluation

This repository includes automated web accessibility evaluation that runs weekly to ensure compliance with WCAG 2.1 AA standards.

## Overview

The accessibility evaluation workflow (`comprehensive-accessibility.yml`) automatically scans the deployed application at https://ncaa-d1-softball.netlify.app/ using multiple industry-standard tools:

- **pa11y**: Command-line accessibility testing tool
- **axe-core**: Accessibility testing engine by Deque
- **Lighthouse**: Google's web quality audit tool (accessibility category)

## Schedule

The accessibility scan runs automatically:
- **Weekly**: Every Monday at 9:00 AM UTC
- **On-demand**: Can be triggered manually via GitHub Actions

## Reports

After each scan, the following reports are generated and stored as workflow artifacts:

- `pa11y-report.html` - Detailed HTML report from pa11y
- `pa11y-report.json` - JSON data from pa11y scan
- `axe-report.json` - Violations report from axe-core
- `lighthouse-accessibility.report.html` - Lighthouse accessibility audit (HTML)
- `lighthouse-accessibility.report.json` - Lighthouse accessibility audit data (JSON)
- `README.md` - Comprehensive summary of all scans

## Accessing Reports

1. Go to the **Actions** tab in the GitHub repository
2. Click on the latest "Comprehensive Web Accessibility Evaluation" workflow run
3. Download the `accessibility-evaluation-[run-number]` artifact
4. Extract and review the reports

## Standards Compliance

The scans test for compliance with:
- **WCAG 2.1 Level AA** standards
- Common accessibility best practices
- Keyboard navigation support
- Screen reader compatibility
- Color contrast requirements

## Manual Testing Recommendations

While automated testing provides excellent baseline coverage, consider supplementing with:
- Manual keyboard navigation testing
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Testing with users who have disabilities
- Color contrast verification with various vision conditions

## Troubleshooting

If accessibility issues are found:
1. Review the detailed HTML reports for specific recommendations
2. Focus on high-impact violations first
3. Test fixes locally before deploying
4. Consider running the scan manually after fixes using the "workflow_dispatch" trigger

## Configuration

The scan configuration can be modified in `.github/workflows/comprehensive-accessibility.yml`:
- Change the scan schedule in the `cron` expression
- Modify the target URL in the `TARGET_URL` environment variable
- Adjust tool-specific parameters as needed