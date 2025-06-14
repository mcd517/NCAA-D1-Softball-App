#!/bin/bash

# Unified Accessibility Scanner Validation Script
# This script validates the structure and syntax of the unified accessibility system

set -e

echo "🔍 Validating Unified Accessibility Scanner..."
echo "==============================================="

# Check for required files
echo "📁 Checking file structure..."

REQUIRED_FILES=(
    ".github/workflows/unified-accessibility.yml"
    ".github/accessibility-config.yml"
    ".github/ACCESSIBILITY.md"
    ".github/actions/setup-accessibility-tools/action.yml"
    ".github/actions/axe-scan/action.yml"
    ".github/actions/pa11y-scan/action.yml"
    ".github/actions/lighthouse-scan/action.yml"
    ".github/actions/playwright-scan/action.yml"
    ".github/actions/generate-accessibility-report/action.yml"
    ".github/actions/notify-webhooks/action.yml"
    ".github/actions/puppeteer-scan/action.yml"
    "tests/accessibility/accessibility.spec.js"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - MISSING"
        exit 1
    fi
done

# Validate YAML syntax
echo ""
echo "📝 Validating YAML syntax..."

YAML_FILES=(
    ".github/workflows/unified-accessibility.yml"
    ".github/accessibility-config.yml"
)

for file in "${YAML_FILES[@]}"; do
    if python3 -c "import yaml; yaml.safe_load(open('$file'))" 2>/dev/null; then
        echo "✅ $file - Valid YAML"
    else
        echo "❌ $file - Invalid YAML syntax"
        exit 1
    fi
done

# Validate composite actions
echo ""
echo "🔧 Validating composite actions..."

ACTION_DIRS=(
    ".github/actions/setup-accessibility-tools"
    ".github/actions/axe-scan"
    ".github/actions/pa11y-scan"
    ".github/actions/lighthouse-scan"
    ".github/actions/playwright-scan"
    ".github/actions/generate-accessibility-report"
    ".github/actions/notify-webhooks"
    ".github/actions/puppeteer-scan"
)

for action_dir in "${ACTION_DIRS[@]}"; do
    action_file="$action_dir/action.yml"
    if [ -f "$action_file" ]; then
        if python3 -c "import yaml; yaml.safe_load(open('$action_file'))" 2>/dev/null; then
            echo "✅ $action_dir - Valid action"
        else
            echo "❌ $action_dir - Invalid action.yml syntax"
            exit 1
        fi
    else
        echo "❌ $action_dir - Missing action.yml"
        exit 1
    fi
done

# Check for required action structure
echo ""
echo "📋 Validating action structure..."

for action_dir in "${ACTION_DIRS[@]}"; do
    action_file="$action_dir/action.yml"
    
    # Check for required fields
    if grep -q "name:" "$action_file" && \
       grep -q "description:" "$action_file" && \
       grep -q "runs:" "$action_file"; then
        echo "✅ $action_dir - Has required fields"
    else
        echo "❌ $action_dir - Missing required fields (name, description, runs)"
        exit 1
    fi
done

# Validate configuration structure
echo ""
echo "⚙️ Validating configuration structure..."

CONFIG_FILE=".github/accessibility-config.yml"

REQUIRED_SECTIONS=(
    "default"
    "thresholds"
    "tools"
    "standards"
    "execution"
    "reporting"
    "environments"
)

for section in "${REQUIRED_SECTIONS[@]}"; do
    if python3 -c "import yaml; config = yaml.safe_load(open('$CONFIG_FILE')); assert '$section' in config" 2>/dev/null; then
        echo "✅ Configuration section: $section"
    else
        echo "❌ Configuration section missing: $section"
        exit 1
    fi
done

# Check workflow triggers
echo ""
echo "🚀 Validating workflow triggers..."

WORKFLOW_FILE=".github/workflows/unified-accessibility.yml"

if grep -q "workflow_dispatch:" "$WORKFLOW_FILE" && \
   grep -q "pull_request:" "$WORKFLOW_FILE" && \
   grep -q "schedule:" "$WORKFLOW_FILE"; then
    echo "✅ Workflow has required triggers (workflow_dispatch, pull_request, schedule)"
else
    echo "❌ Workflow missing required triggers"
    exit 1
fi

# Check for matrix strategy
if grep -q "accessibility-scan:" "$WORKFLOW_FILE"; then
    echo "✅ Workflow has comprehensive accessibility scanning job"
else
    echo "❌ Workflow missing accessibility scanning job"
    exit 1
fi

# Validate documentation
echo ""
echo "📚 Validating documentation..."

DOC_FILE=".github/ACCESSIBILITY.md"

if [ -f "$DOC_FILE" ]; then
    if grep -q "# Enterprise Accessibility Scanner\|# Accessibility" "$DOC_FILE" && \
       grep -q "What This Solution Offers\|Features" "$DOC_FILE" && \
       grep -q "Configuration" "$DOC_FILE" && \
       grep -q "How It Works\|Usage" "$DOC_FILE"; then
        echo "✅ Documentation has required sections"
    else
        echo "❌ Documentation missing required sections"
        exit 1
    fi
else
    echo "❌ Documentation file missing"
    exit 1
fi

# Final validation
echo ""
echo "🎯 Running final validations..."

# Check if build still works
if npm run build >/dev/null 2>&1; then
    echo "✅ Project build still works"
else
    echo "❌ Project build broken"
    exit 1
fi

# Success
echo ""
echo "🎉 All validations passed!"
echo ""
echo "✅ Unified Accessibility Scanner is properly configured"
echo "✅ All composite actions are valid"
echo "✅ Configuration file is correct"
echo "✅ Workflow syntax is valid"
echo "✅ Documentation is complete"
echo "✅ Project build works"
echo ""
echo "🚀 Ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Commit and push changes"
echo "2. Test the workflow in GitHub Actions"
echo "3. Configure webhook URLs in accessibility-config.yml"
echo "4. Set up branch protection rules if desired"
echo ""
echo "For detailed usage instructions, see: .github/ACCESSIBILITY.md"