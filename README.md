# NCAA D1 College Softball App

A mobile application for tracking NCAA Division I college softball stats, rankings, and scores.

## Features

- Team rankings from NCAA polls
- Statistical leaders for batting and pitching categories
- Conference standings
- Modern UI with pull-to-refresh functionality
- Available for iOS and Android

## Tech Stack

- **Frontend**: React, Vite
- **Mobile Framework**: Capacitor (iOS & Android)
- **Backend**: Node.js, Express
- **API**: NCAA Statistics API
- **Serverless Functions**: Netlify Functions
- **Continuous Integration**: GitHub Actions

## Local Development

### Prerequisites

- Node.js v18+
- npm v9+
- Xcode (for iOS development)
- Android Studio (for Android development)

### Setup

```bash
# Install dependencies
npm install
cd server
npm install
cd ..

# Start the backend server
cd server
npm run dev

# In a new terminal, start the frontend
cd /Users/seanmac5291/Desktop/NCAA-D1-Softball-App
npm run dev
```

### Running Tests

```bash
# Run frontend tests
npm test

# Run backend tests
cd server && npm test
```

## Deployment

### Automated Deployment Script

The project includes a deployment script that handles building, version management, and platform deployment.

```bash
# Development build (local testing)
./deploy.sh --dev

# Production build for App Store submission
./deploy.sh --prod --inc-version

# See all options
./deploy.sh --help
```

### CI/CD with GitHub Actions

The project is configured with GitHub Actions workflows to:

1. Run tests on every push and PR
2. Build and deploy to Netlify on merges to main/master
3. Prepare iOS and Android builds for app store submission

Required GitHub repository secrets for CI/CD:
- `NETLIFY_AUTH_TOKEN`: Your Netlify authentication token
- `NETLIFY_SITE_ID`: The ID of your Netlify site

### Manual Deployment Steps

#### Web (Netlify)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to production
netlify deploy --prod
```

#### iOS (App Store)

1. Build the web app: `npm run build`
2. Copy to iOS: `npx cap copy ios`
3. Open in Xcode: `npx cap open ios`
4. In Xcode: Product > Archive
5. Follow Xcode prompts to submit to App Store Connect

#### Android (Play Store)

1. Build the web app: `npm run build`
2. Copy to Android: `npx cap copy android` 
3. Open in Android Studio: `npx cap open android`
4. In Android Studio: Build > Generate Signed Bundle / APK
5. Upload the generated AAB file to the Play Console

## API Documentation

### Endpoints

- `/api/softball/rankings` - Get team rankings
- `/api/softball/stats/:category` - Get statistical leaders
  - Categories: `batting`, `hits`, `homeRuns`, `obp`, `slg`, `era`, `strikeoutsPerSeven`, `strikeoutsTotal`
- `/api/softball/standings` - Get conference standings

## License

MIT

## Credits

Data provided by NCAA.com
