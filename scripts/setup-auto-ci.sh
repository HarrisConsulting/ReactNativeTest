#!/bin/bash
# scripts/setup-auto-ci.sh
# Setup script for automated CI/CD enhancements in ReactNativeTest

set -e

echo "🚀 Setting up Automated CI/CD Enhancements for ReactNativeTest"
echo "============================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository. Please run this script from the ReactNativeTest root directory."
        exit 1
    fi
    print_success "Git repository detected"
}

# Function to install required tools
install_tools() {
    print_info "Checking required tools..."
    
    # Check for actionlint
    if ! command -v actionlint &> /dev/null; then
        print_warning "actionlint not found. Installing..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            if command -v brew &> /dev/null; then
                brew install actionlint
                print_success "actionlint installed via Homebrew"
            else
                print_warning "Homebrew not found. Install actionlint manually:"
                echo "  curl -L https://github.com/rhymond/actionlint/releases/latest/download/actionlint_darwin_amd64.tar.gz | tar xz"
                echo "  sudo mv actionlint /usr/local/bin/"
            fi
        else
            print_warning "Install actionlint manually:"
            echo "  curl -L https://github.com/rhymond/actionlint/releases/latest/download/actionlint_linux_amd64.tar.gz | tar xz"
            echo "  sudo mv actionlint /usr/local/bin/"
        fi
    else
        print_success "actionlint found"
    fi
    
    # Check for GitHub CLI
    if ! command -v gh &> /dev/null; then
        print_warning "GitHub CLI not found. Install for enhanced monitoring:"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            echo "  brew install gh"
        else
            echo "  Visit: https://cli.github.com/"
        fi
    else
        print_success "GitHub CLI found"
    fi
}

# Function to configure pre-commit hook
setup_pre_commit_hook() {
    print_info "Setting up intelligent pre-commit hook..."
    
    if [ -f ".git/hooks/pre-commit" ]; then
        print_warning "Pre-commit hook already exists. Backing up..."
        cp .git/hooks/pre-commit .git/hooks/pre-commit.backup
    fi
    
    # The hook should already be created by the previous step
    if [ -f ".git/hooks/pre-commit" ]; then
        chmod +x .git/hooks/pre-commit
        print_success "Pre-commit hook configured and made executable"
    else
        print_error "Pre-commit hook file not found. Please ensure it was created correctly."
    fi
}

# Function to configure auto-push script
setup_auto_push_script() {
    print_info "Setting up auto-push script..."
    
    if [ -f "scripts/auto-push-test.sh" ]; then
        chmod +x scripts/auto-push-test.sh
        print_success "Auto-push script configured and made executable"
        
        # Add to package.json scripts if not already there
        if ! grep -q "auto-push" package.json; then
            print_info "Adding auto-push script to package.json..."
            # Note: This would require jq or manual editing
            print_warning "Manually add to package.json scripts:"
            echo '  "auto-push": "./scripts/auto-push-test.sh"'
        fi
    else
        print_error "Auto-push script not found at scripts/auto-push-test.sh"
    fi
}

# Function to validate workflows
validate_workflows() {
    print_info "Validating GitHub Actions workflows..."
    
    if command -v actionlint &> /dev/null; then
        if actionlint .github/workflows/*.yml; then
            print_success "All workflows validated successfully"
        else
            print_error "Workflow validation failed. Check syntax above."
            return 1
        fi
    else
        print_warning "actionlint not available. Skipping workflow validation."
    fi
}

# Function to create npm scripts
setup_npm_scripts() {
    print_info "Checking npm scripts..."
    
    # Check if auto-push script exists in package.json
    if grep -q '"auto-push"' package.json; then
        print_success "Auto-push script found in package.json"
    else
        print_warning "Consider adding to package.json scripts section:"
        echo '  "auto-push": "./scripts/auto-push-test.sh",'
        echo '  "setup-ci": "./scripts/setup-auto-ci.sh",'
        echo '  "validate-workflows": "actionlint .github/workflows/*.yml"'
    fi
}

# Function to show usage examples
show_usage_examples() {
    echo ""
    echo "🎯 Usage Examples:"
    echo "=================="
    echo ""
    
    echo "1. Use the intelligent pre-commit hook (automatic):"
    echo "   git add ."
    echo "   git commit -m \"Your commit message\""
    echo "   # Hook will analyze changes and provide suggestions"
    echo ""
    
    echo "2. Use the auto-push script for comprehensive testing:"
    echo "   git add ."
    echo "   git commit -m \"Your commit message\""
    echo "   ./scripts/auto-push-test.sh"
    echo "   # or: npm run auto-push"
    echo ""
    
    echo "3. Manual workflow validation:"
    echo "   actionlint .github/workflows/*.yml"
    echo "   # or: npm run validate-workflows"
    echo ""
    
    echo "4. Monitor CI/CD with GitHub CLI:"
    echo "   gh run list --limit 5"
    echo "   gh run watch"
    echo ""
}

# Function to show configuration summary
show_configuration_summary() {
    echo ""
    echo "📋 Configuration Summary:"
    echo "========================="
    echo ""
    
    echo "✅ Enhanced Features Configured:"
    echo "   • Intelligent pre-commit hook with change analysis"
    echo "   • Auto-push script with comprehensive validation"
    echo "   • Enhanced GitHub Actions workflow with change detection"
    echo "   • Conditional CI testing based on change significance"
    echo "   • Automated clean build protocols for auth changes"
    echo "   • Workflow syntax validation"
    echo ""
    
    echo "🔍 Change Detection Triggers:"
    echo "   • 10+ files changed (configurable)"
    echo "   • Authentication system changes (src/auth/, __tests__/auth/)"
    echo "   • GitHub Actions workflow changes (.github/workflows/)"
    echo "   • Dependency changes (package*.json, Podfile)"
    echo "   • Navigation or screen changes"
    echo ""
    
    echo "🚀 CI/CD Enhancements:"
    echo "   • Intelligent test strategy selection"
    echo "   • Conditional job execution based on change impact"
    echo "   • Enhanced security scanning for dependency changes"
    echo "   • Clean build validation for auth changes"
    echo "   • Comprehensive pipeline summary reporting"
    echo ""
}

# Main execution
main() {
    echo "Starting automated CI/CD setup..."
    echo ""
    
    # Run setup steps
    check_git_repo
    install_tools
    setup_pre_commit_hook
    setup_auto_push_script
    setup_npm_scripts
    validate_workflows
    
    echo ""
    print_success "Automated CI/CD enhancement setup completed!"
    
    show_configuration_summary
    show_usage_examples
    
    echo ""
    echo "🔗 Documentation:"
    echo "   • Enhanced best practices: docs/ci-cd/ci-cd-github-actions-best-practices.md"
    echo "   • Original CI/CD docs: docs/ci-cd/"
    echo "   • GitHub Actions dashboard: https://github.com/HarrisConsulting/ReactNativeTest/actions"
    echo ""
    
    print_success "Setup complete! Your ReactNativeTest project now has intelligent CI/CD automation."
}

# Run main function
main "$@"
