#!/bin/bash

# NCAA D1 Softball App Deployment Script
# This script automates building, versioning, and deploying the app for:
# - Netlify functions deployment
# - iOS App Store submission
# - Android Play Store submission

# Color codes for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Display banner
echo -e "${BLUE}===================================================================${NC}"
echo -e "${BLUE}                NCAA D1 Softball App Deployment                    ${NC}"
echo -e "${BLUE}===================================================================${NC}"

# Function to handle errors
handle_error() {
    echo -e "${RED}ERROR: $1${NC}"
    exit 1
}

# Parse command line arguments
DEPLOY_TARGET="development"
INCREMENT_VERSION=false
SKIP_TESTS=false

# Process command line arguments
for arg in "$@"
do
    case $arg in
        --prod|--production)
        DEPLOY_TARGET="production"
        shift
        ;;
        --staging)
        DEPLOY_TARGET="staging"
        shift
        ;;
        --dev|--development)
        DEPLOY_TARGET="development"
        shift
        ;;
        --inc-version|--increment-version)
        INCREMENT_VERSION=true
        shift
        ;;
        --skip-tests)
        SKIP_TESTS=true
        shift
        ;;
        --help|--h)
        echo -e "${GREEN}Usage:${NC} ./deploy.sh [options]"
        echo "Options:"
        echo "  --prod, --production    Deploy for production App Store/Play Store"
        echo "  --staging               Deploy to staging environment"
        echo "  --dev, --development    Deploy to development (default)"
        echo "  --inc-version           Increment app version number"
        echo "  --skip-tests            Skip running tests"
        exit 0
        ;;
    esac
done

echo -e "${GREEN}Deploying for:${NC} $DEPLOY_TARGET environment"

# Ensure we're in the project root
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    handle_error "This script must be run from the project root directory"
fi

# Check for required tools
command -v npm >/dev/null 2>&1 || handle_error "npm is required but not installed"
command -v node >/dev/null 2>&1 || handle_error "node is required but not installed"

# Step 1: Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install || handle_error "Failed to install npm dependencies"

# Step 2: Run tests (unless skipped)
if [ "$SKIP_TESTS" = false ]; then
    echo -e "${YELLOW}Running tests...${NC}"
    npm test || echo -e "${RED}Warning: Tests failed. Continuing deployment...${NC}"
    
    # Optional: Run server tests
    if [ -d "server" ]; then
        echo -e "${YELLOW}Running server tests...${NC}"
        (cd server && npm test) || echo -e "${RED}Warning: Server tests failed. Continuing...${NC}"
    fi
fi

# Step 3: Configure environment for target
echo -e "${YELLOW}Configuring for $DEPLOY_TARGET environment...${NC}"
case $DEPLOY_TARGET in
    production)
        # Production-specific configuration
        echo "Setting production API URLs..."
        ;;
    staging)
        # Staging-specific configuration
        echo "Setting staging API URLs..."
        ;;
    development)
        # Development-specific configuration
        echo "Setting development API URLs..."
        ;;
esac

# Step 4: Build the app
echo -e "${YELLOW}Building frontend app...${NC}"
npm run build || handle_error "Frontend build failed"

# Step 5: If version increment requested, update version numbers
if [ "$INCREMENT_VERSION" = true ]; then
    echo -e "${YELLOW}Incrementing version numbers...${NC}"
    
    # Get current version from package.json
    CURRENT_VERSION=$(node -p "require('./package.json').version")
    echo "Current version: $CURRENT_VERSION"
    
    # Split version into components
    IFS='.' read -r -a VERSION_PARTS <<< "$CURRENT_VERSION"
    MAJOR=${VERSION_PARTS[0]}
    MINOR=${VERSION_PARTS[1]}
    PATCH=${VERSION_PARTS[2]}
    
    # Increment patch version
    NEW_PATCH=$((PATCH + 1))
    NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"
    echo "New version: $NEW_VERSION"
    
    # Update package.json
    npm version "$NEW_VERSION" --no-git-tag-version || handle_error "Failed to update version in package.json"
    
    # Update iOS version (CFBundleShortVersionString in Xcode project)
    if [ -d "ios" ]; then
        echo "Updating iOS version to $NEW_VERSION"
        /usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $NEW_VERSION" "./ios/App/App/Info.plist" || echo "Warning: Could not update iOS version"
    fi
    
    # Update Android version in build.gradle
    if [ -d "android" ]; then
        echo "Updating Android version to $NEW_VERSION"
        sed -i '' "s/versionName \"[0-9]*\.[0-9]*\.[0-9]*\"/versionName \"$NEW_VERSION\"/" "./android/app/build.gradle" || echo "Warning: Could not update Android version"
    fi
fi

# Step 6: Copy web assets to iOS and Android
echo -e "${YELLOW}Copying assets to native platforms...${NC}"
npx cap copy || handle_error "Failed to copy web assets to native platforms"

# Step 7: Update native code (plugins, permissions, etc)
echo -e "${YELLOW}Synchronizing native platforms...${NC}"
npx cap sync || handle_error "Failed to sync native platforms"

# Step 8: Open platforms for final packaging and submission
if [ "$DEPLOY_TARGET" = "production" ]; then
    echo -e "${YELLOW}Opening Xcode for iOS App submission...${NC}"
    npx cap open ios
    
    echo -e "${YELLOW}Opening Android Studio for Android App submission...${NC}"
    npx cap open android
    
    echo -e "${GREEN}App is ready for submission!${NC}"
    echo -e "${GREEN}Next steps:${NC}"
    echo "1. In Xcode: Product > Archive to create App Store package"
    echo "2. In Android Studio: Build > Generate Signed Bundle/APK"
else
    echo -e "${GREEN}Build and platform preparation complete!${NC}"
fi

# Netlify deployment section
if [ "$DEPLOY_TARGET" = "production" ] || [ "$DEPLOY_TARGET" = "staging" ]; then
    echo -e "${YELLOW}Deploying to Netlify...${NC}"
    
    # Check if Netlify CLI is installed
    if command -v netlify >/dev/null 2>&1; then
        netlify deploy --prod || echo -e "${RED}Netlify deployment failed. Please deploy manually.${NC}"
    else
        echo -e "${RED}Netlify CLI not installed. Install with: npm install -g netlify-cli${NC}"
        echo -e "${YELLOW}Manual Netlify deployment instructions:${NC}"
        echo "1. Run: npm install -g netlify-cli"
        echo "2. Run: netlify login"
        echo "3. Run: netlify deploy --prod"
    fi
fi

echo -e "${BLUE}===================================================================${NC}"
echo -e "${GREEN}Deployment script completed successfully!${NC}"
echo -e "${BLUE}===================================================================${NC}"