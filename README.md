# D1 College Softball Stats & Rankings 

A React application powered by Vite that displays real-time NCAA Division I Softball data, including team rankings, individual statistical leaders, and tournament brackets. Data is fetched from the NCAA API through a Node.js server service. 1.0

[Live URL for Web App](https://ncaa-d1-softball.netlify.app/)
---

## Features

- **Team Rankings**: View the latest Division I softball team rankings.
- **Statistical Leaders**: Browse top players in key hitting and pitching categories (e.g., batting average, home runs, ERA, strikeouts).
- **Tournament Bracket**: Display the current Women’s College World Series and regionals bracket.
- **Responsive UI**: Clean, mobile-friendly design with loading and error states.
- **Rate-Limited API**: Server enforces rate limiting to avoid API throttling.

## Project Structure

```
/ (root)
├── src/                     # React client application
│   ├── main.jsx             # App entry point
│   ├── App.jsx              # Main layout and routing logic
│   ├── components/          # Reusable UI components
│   └── services/            # Client-side API wrapper (softballAPI.js)
├── public/                  # Static assets (favicon, icons)
├── server/                  # Node.js API server
│   ├── server.js            # Express setup
│   ├── routes/              # API route definitions
│   └── services/            # Data fetching and formatting (NCAAWebScraper)
├── README.md                # This documentation
├── package.json             # Client dependencies & scripts
└── server/package.json      # Server dependencies & scripts
```

## Getting Started

### Prerequisites

- Node.js v14+ and npm (or yarn)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mcd517/NCAA-D1-Softball-App.git
   cd NCAA-D1-Softball-App
   ```
2. Install client dependencies:
   ```bash
   npm install
   ```
3. Install server dependencies:
   ```bash
   cd server && npm install && cd ..
   ```

### Running in Development

1. Start the API server (default port 3001):
   ```bash
   npm run server
   ```
2. In a separate terminal, start the React app (default port 3000):
   ```bash
   npm run dev
   ```
3. Open http://localhost:3000 in your browser.

### Building for Production

1. Build the client:
   ```bash
   npm run build
   ```
2. Start the server in production mode:
   ```bash
   npm start --prefix server
   ```
3. The app will serve static files from `/dist` alongside the API endpoints.

## API Endpoints

The server exposes the following endpoints:

- `GET /api/rankings` — Fetch current team rankings
- `GET /api/stats/:category` — Fetch top 50 leaders for a stat category (`batting`, `hits`, `homeRuns`, `obp`, `slg`, `era`, `strikeoutsPerSeven`, `strikeouts`)
- `GET /api/bracket` — (if implemented) Fetch tournament bracket data

## Configuration

- **Rate Limiting**: The server enforces a 1-second delay between external NCAA API calls.
- **API Base URL**: Defined in `server/services/ncaaWebScraper.js` as `https://ncaa-api.henrygd.me`.

## Accessibility - Government Compliance

This application includes enterprise-grade WCAG 2.1 Level AA compliance specifically designed for state and local government customers, as required by the U.S. Department of Justice accessibility rule. The system features:

- **🏛️ Government Compliance**: Zero-tolerance policy for critical/serious violations meeting Department of Justice requirements
- **📋 WCAG 2.1 AA Certified**: Full compliance with [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/) Level AA standards
- **🔧 Enterprise Scanner**: Modular, configurable accessibility testing with parallel execution
- **🎯 Strict Quality Gates**: Government-standard thresholds (0 critical, 0 serious violations)
- **📊 Compliance Reporting**: Comprehensive HTML dashboards, audit trails, and formal compliance documentation
- **⚙️ Multi-Standard Support**: WCAG 2.1 A/AA/AAA, Section 508, EN 301 549 for complete government compliance
- **🚀 Automated Testing**: Continuous compliance monitoring with axe-core, pa11y, Lighthouse, and Playwright
- **📄 Legal Documentation**: Complete audit trails and compliance reports for government review

### Government Compliance Features

- **Zero Critical Violations**: Automated blocking of deployments with critical accessibility issues
- **Audit Trail**: Complete documentation of all accessibility testing and remediation
- **Legal Compliance Reports**: Formal PDF reports suitable for government submission
- **User Testing Integration**: Support for assistive technology user testing requirements
- **Accessibility Statement**: Public accessibility commitment documentation

See [WCAG 2.1 Compliance Documentation](.github/WCAG_COMPLIANCE.md) for detailed compliance information and [Enterprise Accessibility Documentation](.github/ENTERPRISE_ACCESSIBILITY.md) for technical setup and configuration.

## Contributing

1. Fork the repo
2. Create a new branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

*Data sources: NCAA API, ESPN*
