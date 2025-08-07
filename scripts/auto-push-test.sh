#!/bin/bash
# scripts/auto-push-test.sh
# Automated Push and Test Protocol for ReactNativeTest
# Integrates with GitHub Actions CI/CD pipeline

set -e

echo "🚀 ReactNativeTest: Automated Push and Test Protocol"
echo "=================================================="
echo ""

# Configuration
SIGNIFICANT_CHANGE_THRESHOLD=10
REPO_URL="https://github.com/HarrisConsulting/ReactNativeTest"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check git status
check_git_status() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository"
        exit 1
    fi
    
    if [ -z "$(git diff --cached --name-only)" ]; then
        print_error "No staged changes found. Stage your changes first with 'git add'"
        exit 1
    fi
}

# Function to analyze change significance
analyze_changes() {
    print_status "Analyzing staged changes..."
    
    local staged_files=$(git diff --cached --name-only)
    local file_count=$(echo "$staged_files" | wc -l | tr -d ' ')
    
    # Count specific types of changes
    local auth_changes=$(echo "$staged_files" | grep -E "(src/auth/|__tests__/auth/)" | wc -l | tr -d ' ')
    local workflow_changes=$(echo "$staged_files" | grep -E "\.github/workflows/" | wc -l | tr -d ' ')
    local dependency_changes=$(echo "$staged_files" | grep -E "package.*\.json|yarn.lock|Podfile" | wc -l | tr -d ' ')
    local navigation_changes=$(echo "$staged_files" | grep -E "src/navigation/" | wc -l | tr -d ' ')
    local screen_changes=$(echo "$staged_files" | grep -E "src/screens/" | wc -l | tr -d ' ')
    
    echo ""
    echo "📊 Change Analysis Summary:"
    echo "   Total files: $file_count"
    echo "   Auth system: $auth_changes files"
    echo "   Workflows: $workflow_changes files"
    echo "   Dependencies: $dependency_changes files"
    echo "   Navigation: $navigation_changes files"
    echo "   Screens: $screen_changes files"
    echo ""
    
    # Determine if changes are significant
    local significant=false
    local reasons=()
    
    if [ "$file_count" -gt "$SIGNIFICANT_CHANGE_THRESHOLD" ]; then
        significant=true
        reasons+=("Large number of files changed ($file_count > $SIGNIFICANT_CHANGE_THRESHOLD)")
    fi
    
    if [ "$auth_changes" -gt 0 ]; then
        significant=true
        reasons+=("Authentication system changes detected")
    fi
    
    if [ "$workflow_changes" -gt 0 ]; then
        significant=true
        reasons+=("GitHub Actions workflow changes detected")
    fi
    
    if [ "$dependency_changes" -gt 0 ]; then
        significant=true
        reasons+=("Dependency changes detected")
    fi
    
    # Export analysis results
    export CHANGE_SIGNIFICANT=$significant
    export AUTH_CHANGES=$auth_changes
    export WORKFLOW_CHANGES=$workflow_changes
    export DEPENDENCY_CHANGES=$dependency_changes
    export TOTAL_FILES=$file_count
    
    if [ "$significant" = true ]; then
        print_warning "SIGNIFICANT CHANGES DETECTED"
        echo "Reasons:"
        for reason in "${reasons[@]}"; do
            echo "   • $reason"
        done
    else
        print_success "Standard changes detected"
    fi
    
    return 0
}

# Function to run pre-push validation
run_pre_push_validation() {
    print_status "Running pre-push validation suite..."
    echo ""
    
    # TypeScript compilation check
    echo "🔍 Checking TypeScript compilation..."
    if ! npm run typecheck; then
        print_error "TypeScript compilation failed"
        return 1
    fi
    print_success "TypeScript compilation passed"
    echo ""
    
    # ESLint check
    echo "🔍 Running ESLint..."
    if ! npm run lint; then
        print_error "ESLint failed"
        echo ""
        print_warning "Consider running 'npm run lint:fix' to auto-fix issues"
        return 1
    fi
    print_success "ESLint passed"
    echo ""
    
    # Unit tests
    echo "🧪 Running unit tests..."
    if ! npm test -- --watchAll=false --passWithNoTests; then
        print_error "Unit tests failed"
        return 1
    fi
    print_success "Unit tests passed"
    echo ""
    
    # Special validations for specific change types
    if [ "$AUTH_CHANGES" -gt 0 ]; then
        echo "🔐 Running auth-specific tests..."
        if ! npm test -- --testPathPattern="auth" --watchAll=false; then
            print_error "Authentication tests failed"
            return 1
        fi
        print_success "Authentication tests passed"
        echo ""
    fi
    
    if [ "$WORKFLOW_CHANGES" -gt 0 ]; then
        echo "⚙️ Validating workflow syntax..."
        if command -v actionlint &> /dev/null; then
            if ! actionlint .github/workflows/*.yml; then
                print_error "Workflow validation failed"
                return 1
            fi
            print_success "Workflow syntax validated"
        else
            print_warning "actionlint not found - install with: brew install actionlint"
        fi
        echo ""
    fi
    
    return 0
}

# Function to show CI implications
show_ci_implications() {
    echo ""
    echo "🔄 GitHub Actions CI/CD Implications:"
    echo "======================================"
    
    if [ "$CHANGE_SIGNIFICANT" = true ]; then
        echo ""
        print_warning "COMPREHENSIVE CI TESTING WILL BE TRIGGERED"
        echo ""
        echo "This push will activate:"
        echo "   ✓ Enhanced test matrix (Node 18 & 20)"
        echo "   ✓ Security audit scans"
        echo "   ✓ Build validation across platforms"
        echo "   ✓ Change impact analysis"
        
        if [ "$AUTH_CHANGES" -gt 0 ]; then
            echo "   ✓ Clean build protocols (auth changes detected)"
            echo "   ✓ Authentication-specific test suite"
        fi
        
        if [ "$WORKFLOW_CHANGES" -gt 0 ]; then
            echo "   ✓ Workflow validation and syntax checking"
        fi
        
        if [ "$DEPENDENCY_CHANGES" -gt 0 ]; then
            echo "   ✓ Dependency security scanning"
            echo "   ✓ Build environment validation"
        fi
        
        echo ""
        echo "⏱️  Estimated CI runtime: 15-30 minutes"
        echo "💰 Estimated GitHub Actions cost: ~2-4 credits"
    else
        echo ""
        print_success "STANDARD CI TESTING WILL BE TRIGGERED"
        echo ""
        echo "This push will activate:"
        echo "   ✓ Basic lint and type checking"
        echo "   ✓ Standard unit test suite"
        echo "   ✓ Quick build validation"
        echo ""
        echo "⏱️  Estimated CI runtime: 3-5 minutes"
        echo "💰 Estimated GitHub Actions cost: ~1 credit"
    fi
}

# Function to get user confirmation
get_user_confirmation() {
    echo ""
    echo "🤔 Proceed with push and CI testing?"
    echo ""
    echo "Options:"
    echo "   y) Yes, push and trigger CI"
    echo "   n) No, cancel push"
    echo "   l) Run additional local tests first"
    echo "   s) Show git diff summary"
    echo ""
    
    while true; do
        read -p "Your choice (y/n/l/s): " -r choice
        case $choice in
            [Yy]* ) return 0;;
            [Nn]* ) 
                print_status "Push cancelled by user"
                exit 0
                ;;
            [Ll]* )
                echo ""
                print_status "Running additional local tests..."
                if [ "$AUTH_CHANGES" -gt 0 ]; then
                    echo "🔐 Running comprehensive auth tests..."
                    npm test -- --testPathPattern="auth" --verbose
                fi
                echo ""
                ;;
            [Ss]* )
                echo ""
                echo "📋 Git diff summary:"
                git diff --cached --stat
                echo ""
                ;;
            * ) echo "Please answer y, n, l, or s.";;
        esac
    done
}

# Function to execute push
execute_push() {
    local branch=$(git rev-parse --abbrev-ref HEAD)
    local remote=${1:-origin}
    
    print_status "Pushing to $remote/$branch..."
    
    if git push "$remote" "$branch"; then
        print_success "Push successful!"
        
        echo ""
        echo "🔗 Monitor your workflow at:"
        echo "   $REPO_URL/actions"
        echo ""
        
        # Auto-open GitHub Actions if on macOS
        if [[ "$OSTYPE" == "darwin"* ]]; then
            read -p "Open GitHub Actions in browser? (y/N): " -r
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                open "$REPO_URL/actions"
            fi
        fi
        
        # Wait and check initial CI status if GitHub CLI is available
        if command -v gh &> /dev/null; then
            echo ""
            print_status "Waiting for CI to start..."
            sleep 15
            
            echo ""
            echo "📊 Current CI status:"
            gh run list --limit 3 --json status,conclusion,url,workflowName,createdAt --template '{{range .}}{{.workflowName}}: {{.status}}{{if .conclusion}} ({{.conclusion}}){{end}} - {{timeago .createdAt}}{{"\n"}}{{end}}'
            
            echo ""
            print_status "Use 'gh run watch' to monitor the latest run"
        else
            echo ""
            print_warning "Install GitHub CLI for enhanced monitoring: brew install gh"
        fi
        
        return 0
    else
        print_error "Push failed"
        return 1
    fi
}

# Function to show post-push recommendations
show_post_push_recommendations() {
    echo ""
    echo "📋 Post-Push Recommendations:"
    echo "============================"
    
    if [ "$CHANGE_SIGNIFICANT" = true ]; then
        echo ""
        echo "🔍 Monitor these key areas:"
        echo "   • CI pipeline completion (~15-30 minutes)"
        
        if [ "$AUTH_CHANGES" -gt 0 ]; then
            echo "   • Authentication test results"
            echo "   • Consider manual testing on iOS Simulator after CI passes"
        fi
        
        if [ "$WORKFLOW_CHANGES" -gt 0 ]; then
            echo "   • Workflow syntax validation results"
            echo "   • Check for any new CI/CD pipeline behaviors"
        fi
        
        if [ "$DEPENDENCY_CHANGES" -gt 0 ]; then
            echo "   • Security audit results"
            echo "   • Build environment compatibility"
        fi
        
        echo ""
        echo "🧹 If CI fails, consider clean build protocol:"
        echo "   npm run clean && rm -rf node_modules && npm install"
        echo "   cd ios && pod deintegrate && pod install && cd .."
    fi
    
    echo ""
    echo "🎯 Next steps:"
    echo "   1. Monitor CI completion at: $REPO_URL/actions"
    echo "   2. Address any CI failures promptly"
    echo "   3. Review code changes in GitHub UI"
    echo "   4. Merge PR if all checks pass"
    echo ""
}

# Main execution
main() {
    # Parse command line arguments
    local remote="origin"
    if [ $# -gt 0 ]; then
        remote="$1"
    fi
    
    # Execute pipeline
    check_git_status
    analyze_changes
    
    if ! run_pre_push_validation; then
        echo ""
        print_error "Pre-push validation failed. Fix issues before pushing."
        echo ""
        echo "Common fixes:"
        echo "   • npm run lint:fix    # Auto-fix ESLint issues"
        echo "   • npm run typecheck   # Check TypeScript errors"
        echo "   • npm test            # Run failing tests"
        exit 1
    fi
    
    show_ci_implications
    get_user_confirmation
    
    if execute_push "$remote"; then
        show_post_push_recommendations
        print_success "Auto-push protocol completed successfully!"
    else
        print_error "Push failed. Check error messages above."
        exit 1
    fi
}

# Execute main function with all arguments
main "$@"
