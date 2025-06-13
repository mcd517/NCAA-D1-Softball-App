# Enterprise Accessibility Scanner

A comprehensive, enterprise-ready accessibility testing system that provides modular, configurable, and scalable web accessibility scanning with quality gates, parallel execution, and detailed reporting.

## 🚀 Features

### ✅ **Modularized & Reusable**
- **Composite Actions**: Reusable components for setup, scanning, and reporting
- **Tool-Specific Actions**: Independent actions for axe-core, pa11y, Lighthouse, and Playwright
- **Configuration-Driven**: External YAML configuration for easy customization

### ⚙️ **Configuration & Parameterization**
- **Multi-Standard Support**: WCAG 2.1 A/AA/AAA, Section 508, EN 301 549
- **Environment-Specific Settings**: Different thresholds for dev/staging/production
- **Customizable Thresholds**: Configurable pass/fail criteria for quality gates
- **Flexible Tool Selection**: Choose which tools to run via configuration

### 🔄 **Parallel & Matrix Execution**
- **Matrix Strategy**: Run tools in parallel for faster execution
- **Tool Isolation**: Each tool runs independently with its own configuration
- **Fail-Fast Options**: Continue or stop on first failure
- **Resource Optimization**: Intelligent caching and resource sharing

### 🎯 **Quality Gates & Fail-Fast**
- **Configurable Thresholds**: Set limits for violations, scores, and issues
- **Automatic Quality Gates**: Pass/fail determination based on criteria
- **Early Exit Options**: Stop scanning on critical failures to save time
- **Governance Integration**: Block merges or require approvals based on results

### 📊 **Enhanced Reporting & Visibility**
- **HTML Dashboard**: Visual, interactive accessibility dashboard
- **PR Comments**: Automated pull request comments with scan results
- **Markdown Summaries**: Detailed reports with actionable recommendations
- **Webhook Notifications**: Slack, Teams, and Discord integration
- **Artifact Management**: Long-term retention of scan results

### 🔧 **Extensibility & Governance**
- **Multiple Standards**: Easy addition of new accessibility standards
- **Custom Tool Integration**: Framework for adding new scanning tools
- **Branch Protection**: Integration with GitHub branch protection rules
- **Marketplace Ready**: Publishable composite actions for reuse

## 🏗️ Architecture

### Workflow Structure

```
Enterprise Accessibility Scanner
├── Setup & Configuration
│   ├── Parse inputs and config
│   ├── Environment-specific settings
│   └── Matrix strategy generation
├── Tool Setup (Cached)
│   ├── Install accessibility tools
│   ├── Browser setup
│   └── Dependency caching
├── Parallel Scans (Matrix)
│   ├── Axe-core scan
│   ├── Pa11y scan
│   ├── Lighthouse scan
│   └── Playwright scan
├── Quality Gates & Aggregation
│   ├── Result consolidation
│   ├── Threshold validation
│   └── Report generation
├── Notifications & Comments
│   ├── PR comments
│   ├── Webhook notifications
│   └── Issue creation
└── Summary & Artifacts
    ├── Workflow summary
    ├── Artifact upload
    └── Metadata tracking
```

### Composite Actions

- **`setup-accessibility-tools/`**: Tool installation with caching
- **`axe-scan/`**: Axe-core accessibility scanning
- **`pa11y-scan/`**: Pa11y content analysis
- **`lighthouse-scan/`**: Lighthouse performance and accessibility
- **`playwright-scan/`**: End-to-end accessibility testing
- **`generate-accessibility-report/`**: Comprehensive report generation
- **`notify-webhooks/`**: External notification system

## 📋 Configuration

### Basic Configuration (`accessibility-config.yml`)

```yaml
# Default scan settings
default:
  target_url: "https://ncaa-d1-softball.netlify.app/"
  standards: "WCAG2AA"
  tools: "axe,pa11y,lighthouse,playwright"

# Quality gates and thresholds
thresholds:
  max_critical_violations: 0
  max_serious_violations: 5
  min_lighthouse_score: 90
  max_pa11y_issues: 5

# Environment-specific overrides
environments:
  development:
    thresholds:
      max_critical_violations: 3
      min_lighthouse_score: 70
  production:
    thresholds:
      max_critical_violations: 0
      min_lighthouse_score: 90
```

### Workflow Inputs

The workflow accepts several inputs for customization:

- **`target_url`**: URL to scan (overrides config)
- **`standards`**: Accessibility standards (WCAG2A, WCAG2AA, etc.)
- **`environment`**: Environment profile (development, staging, production)
- **`tools`**: Comma-separated list of tools to run
- **`fail_on_issues`**: Whether to fail the workflow on accessibility issues

## 🚀 Usage

### 1. Manual Execution

```yaml
# Navigate to Actions tab → Enterprise Accessibility Scanner → Run workflow
# Customize inputs as needed:
- Target URL: https://your-app.com
- Standards: WCAG2AA
- Environment: production
- Tools: axe,pa11y,lighthouse,playwright
- Fail on Issues: false
```

### 2. Automated Triggers

```yaml
# Runs automatically on:
- schedule: Every Monday at 9:00 AM UTC
- pull_request: On PR creation/updates
- push: On pushes to main branch
```

### 3. Integration with Branch Protection

```yaml
# In GitHub repository settings:
# Settings → Branches → Add rule → Require status checks
# Select: "Quality Gates & Aggregation"
```

## 📊 Reports & Outputs

### Generated Reports

1. **HTML Dashboard** (`accessibility-dashboard.html`)
   - Visual summary with metrics and recommendations
   - Color-coded status indicators
   - Tool-specific results breakdown

2. **Markdown Summary** (`accessibility-summary.md`)
   - Detailed text report with action items
   - Prioritized fix recommendations
   - Resource links and guidance

3. **PR Comment** (`pr-comment.md`)
   - Formatted comment for pull requests
   - Summary table with pass/fail status
   - Links to detailed reports

4. **Raw Tool Reports**
   - `axe-report.json`: Detailed WCAG violations
   - `pa11y-report.html`: Visual content issues
   - `lighthouse-*.json`: Performance and accessibility audits
   - `playwright-report/`: Interactive test results

### Artifacts

All reports are uploaded as workflow artifacts with 90-day retention:
- **`accessibility-evaluation-comprehensive`**: Complete report package
- **`accessibility-scan-{tool}`**: Individual tool results

## 🔗 Integrations

### Webhook Notifications

Configure webhook URLs in `accessibility-config.yml`:

```yaml
reporting:
  webhooks:
    slack_url: "https://hooks.slack.com/services/..."
    teams_url: "https://outlook.office.com/webhook/..."
    discord_url: "https://discord.com/api/webhooks/..."
```

### GitHub Integration

- **PR Comments**: Automatic scan result comments on pull requests
- **Status Checks**: Integration with GitHub branch protection
- **Issue Creation**: Automatic issue creation for accessibility regressions (optional)

## 🎯 Quality Gates

### Default Thresholds

| Metric | Threshold | Impact |
|--------|-----------|--------|
| Critical Violations | 0 | Blocks users with disabilities |
| Serious Violations | ≤ 5 | Significant usability impact |
| Lighthouse Score | ≥ 90% | Overall accessibility quality |
| Pa11y Issues | ≤ 5 | Content accessibility problems |
| Playwright Violations | ≤ 3 | Interaction and navigation issues |

### Customization

Thresholds can be customized per environment:

```yaml
environments:
  development:
    thresholds:
      max_critical_violations: 3  # More lenient for dev
      min_lighthouse_score: 70
  production:
    thresholds:
      max_critical_violations: 0  # Strict for production
      min_lighthouse_score: 95
```

## 🔧 Extension & Customization

### Adding New Standards

```yaml
standards:
  WCAG2.2:
    description: "Web Content Accessibility Guidelines 2.2"
    tags: ["wcag2a", "wcag2aa", "wcag22aa"]
```

### Adding New Tools

1. Create a new composite action in `.github/actions/new-tool-scan/`
2. Add tool configuration to `accessibility-config.yml`
3. Update the workflow matrix to include the new tool

### Custom Thresholds

Modify `accessibility-config.yml` to set project-specific quality gates:

```yaml
thresholds:
  max_critical_violations: 0
  max_serious_violations: 2
  max_moderate_violations: 10
  min_lighthouse_score: 95
  max_pa11y_issues: 3
```

## 📚 Resources

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Section 508 Standards](https://www.section508.gov/)
- [EN 301 549 Standard](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/)

### Tools
- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [pa11y Documentation](https://pa11y.org/)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Playwright Testing](https://playwright.dev/)

### React Accessibility
- [React Accessibility Guide](https://react.dev/learn/accessibility)
- [React A11y ESLint Plugin](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)
- [React Testing Library Accessibility](https://testing-library.com/docs/queries/byrole)

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/accessibility-improvement`
3. **Make changes** to the composite actions or workflow
4. **Test changes** by running the workflow
5. **Submit a pull request** with detailed description

### Development Guidelines

- **Modular Design**: Keep actions focused and reusable
- **Error Handling**: Include proper error handling and fallbacks
- **Documentation**: Update README and action documentation
- **Testing**: Test changes with different configurations

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: Report bugs or request features via GitHub Issues
- **Discussions**: Ask questions in GitHub Discussions
- **Documentation**: Check this README and action documentation
- **Community**: Join accessibility community discussions

---

**Built with ♿ for a more accessible web**