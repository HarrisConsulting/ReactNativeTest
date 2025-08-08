#!/bin/bash
# ReactNativeTest Helper Functions
# Source this file in your shell profile for easy access to ReactNativeTest templates
# Usage: source /path/to/ReactNativeTest/scripts/rnt-helpers.sh

# Set the ReactNativeTest path (update this to your local path)
export RNT_PATH="${RNT_PATH:-$(dirname "$(dirname "$(realpath "${BASH_SOURCE[0]}")")")}"

# Helper function to copy core configuration files
rnt_copy_config() {
    echo "🔧 Copying core configuration files from ReactNativeTest..."
    
    # Create directories if they don't exist
    mkdir -p .vscode .github/workflows
    
    # Copy essential configuration files
    cp "$RNT_PATH/jest.config.js" . 2>/dev/null || echo "⚠️  jest.config.js not found"
    cp "$RNT_PATH/jest.setup.js" . 2>/dev/null || echo "⚠️  jest.setup.js not found"
    cp "$RNT_PATH/tsconfig.json" . 2>/dev/null || echo "⚠️  tsconfig.json not found"
    cp "$RNT_PATH/.eslintrc.js" . 2>/dev/null || echo "⚠️  .eslintrc.js not found"
    cp "$RNT_PATH/.prettierrc.js" . 2>/dev/null || echo "⚠️  .prettierrc.js not found"
    cp "$RNT_PATH/.vscode/settings.json" .vscode/ 2>/dev/null || echo "⚠️  .vscode/settings.json not found"
    cp "$RNT_PATH/.github/workflows/ci-cd.yml" .github/workflows/ 2>/dev/null || echo "⚠️  ci-cd.yml not found"
    
    echo "✅ Core configuration files copied!"
    echo "📝 Remember to update app names and paths for your project"
}

# Helper function to copy safety scripts
rnt_copy_safety() {
    echo "🛡️ Copying enhanced safety scripts from ReactNativeTest..."
    
    # Copy the enhanced Metro safety script
    cp "$RNT_PATH/scripts/enhanced-metro-safety.sh" . 2>/dev/null || echo "⚠️  enhanced-metro-safety.sh not found"
    chmod +x enhanced-metro-safety.sh 2>/dev/null
    
    # Copy the legacy start-metro.sh as backup
    cp "$RNT_PATH/start-metro.sh" . 2>/dev/null || echo "⚠️  start-metro.sh not found"
    chmod +x start-metro.sh 2>/dev/null
    
    # Get the current project directory and name
    local current_dir=$(pwd)
    local project_name=$(basename "$current_dir")
    
    # Update enhanced script with correct paths
    if [[ -f "enhanced-metro-safety.sh" ]]; then
        sed -i.bak "s|__PROJECT_PATH__|$current_dir|g" enhanced-metro-safety.sh 2>/dev/null || \
        sed -i "s|__PROJECT_PATH__|$current_dir|g" enhanced-metro-safety.sh 2>/dev/null
        
        sed -i.bak "s|__PROJECT_NAME__|$project_name|g" enhanced-metro-safety.sh 2>/dev/null || \
        sed -i "s|__PROJECT_NAME__|$project_name|g" enhanced-metro-safety.sh 2>/dev/null
        
        rm -f enhanced-metro-safety.sh.bak 2>/dev/null
        echo "✅ Enhanced Metro safety script configured for $project_name"
    fi
    
    # Update legacy script paths
    if [[ -f "start-metro.sh" ]]; then
        sed -i.bak "s|/Users/.*/ReactNativeTest|$current_dir|g" start-metro.sh 2>/dev/null || \
        sed -i "s|/Users/.*/ReactNativeTest|$current_dir|g" start-metro.sh 2>/dev/null
        rm -f start-metro.sh.bak 2>/dev/null
        echo "✅ Legacy safety script updated as backup"
    fi
}

# Helper function to copy testing infrastructure
rnt_copy_testing() {
    echo "🧪 Copying testing infrastructure from ReactNativeTest..."
    
    cp -r "$RNT_PATH/__tests__" . 2>/dev/null || echo "⚠️  __tests__ directory not found"
    cp -r "$RNT_PATH/__mocks__" . 2>/dev/null || echo "⚠️  __mocks__ directory not found"
    
    echo "✅ Testing infrastructure copied!"
    echo "📝 Remember to update test files for your specific components"
}

# Helper function to copy authentication system
rnt_copy_auth() {
    echo "🔐 Copying authentication system from ReactNativeTest..."
    
    mkdir -p src
    cp -r "$RNT_PATH/src/auth" src/ 2>/dev/null || echo "⚠️  src/auth directory not found"
    cp -r "$RNT_PATH/src/navigation" src/ 2>/dev/null || echo "⚠️  src/navigation directory not found"
    cp -r "$RNT_PATH/src/screens" src/ 2>/dev/null || echo "⚠️  src/screens directory not found"
    cp -r "$RNT_PATH/src/services" src/ 2>/dev/null || echo "⚠️  src/services directory not found"
    
    echo "✅ Authentication system copied!"
    echo "📝 Remember to update Supabase configuration and app-specific details"
}

# Helper function to copy Supabase configuration
rnt_copy_supabase() {
    echo "🗄️ Copying Supabase configuration from ReactNativeTest..."
    
    cp -r "$RNT_PATH/supabase" . 2>/dev/null || echo "⚠️  supabase directory not found"
    
    echo "✅ Supabase configuration copied!"
    echo "📝 Remember to update database URLs and configuration for your project"
}

# Enhanced complete setup function with comprehensive validation
rnt_setup_new_project() {
    local project_name="$1"
    
    if [[ -z "$project_name" ]]; then
        echo "❌ Error: Project name required"
        echo "Usage: rnt_setup_new_project MyNewApp"
        return 1
    fi
    
    echo "🚀 Setting up new project: $project_name"
    echo "📁 Using ReactNativeTest exemplar patterns..."
    
    # Validate we're in the project directory
    local current_dir=$(pwd)
    local current_name=$(basename "$current_dir")
    
    if [[ "$current_name" != "$project_name" ]]; then
        echo "⚠️  Warning: Current directory ($current_name) doesn't match project name ($project_name)"
        echo "   Make sure you're in the project directory: cd /path/to/$project_name"
    fi
    
    # Phase 1: Copy core configuration
    echo ""
    echo "📋 Phase 1: Core Configuration"
    rnt_copy_config
    
    # Phase 2: Copy enhanced safety scripts
    echo ""
    echo "🛡️ Phase 2: Enhanced Safety Scripts"
    rnt_copy_safety
    
    # Phase 3: Copy testing infrastructure
    echo ""
    echo "🧪 Phase 3: Testing Infrastructure"
    rnt_copy_testing
    
    # Phase 4: Update app names and identifiers
    echo ""
    echo "🏷️ Phase 4: Project Customization"
    
    # Update package.json name if it exists
    if [[ -f "package.json" ]]; then
        if command -v jq >/dev/null 2>&1; then
            # Use jq for safe JSON manipulation
            jq --arg name "$project_name" '.name = $name' package.json > package.json.tmp && mv package.json.tmp package.json
            echo "   ✅ Updated package.json name to $project_name"
        else
            # Fallback to sed (less safe but widely available)
            sed -i.bak "s/\"ReactNativeTest\"/\"$project_name\"/g" package.json 2>/dev/null || \
            sed -i "s/\"ReactNativeTest\"/\"$project_name\"/g" package.json 2>/dev/null
            rm -f package.json.bak 2>/dev/null
            echo "   ✅ Updated package.json name (using sed fallback)"
        fi
    fi
    
    # Update app.json if it exists
    if [[ -f "app.json" ]]; then
        sed -i.bak "s/ReactNativeTest/$project_name/g" app.json 2>/dev/null || \
        sed -i "s/ReactNativeTest/$project_name/g" app.json 2>/dev/null
        rm -f app.json.bak 2>/dev/null
        echo "   ✅ Updated app.json"
    fi
    
    # Phase 5: Dependency validation
    echo ""
    echo "📦 Phase 5: Dependency Validation"
    
    # Check for critical React Navigation dependencies
    local missing_deps=()
    local required_deps=(
        "@react-navigation/native"
        "@react-navigation/stack"
        "react-native-gesture-handler"
        "react-native-screens"
        "react-native-safe-area-context"
    )
    
    if [[ -f "package.json" ]]; then
        for dep in "${required_deps[@]}"; do
            if ! grep -q "\"$dep\"" package.json; then
                missing_deps+=("$dep")
            fi
        done
        
        if [[ ${#missing_deps[@]} -eq 0 ]]; then
            echo "   ✅ All critical React Navigation dependencies present"
        else
            echo "   ⚠️  Missing critical dependencies:"
            printf '      - %s\n' "${missing_deps[@]}"
            echo ""
            echo "   � Install missing dependencies:"
            echo "      npm install ${missing_deps[*]}"
            echo "      cd ios && pod install && cd .."
        fi
    fi
    
    # Phase 6: Success summary and next steps
    echo ""
    echo "🎉 Project setup complete!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Install any missing dependencies (see above)"
    echo "2. Start Metro safely: ./enhanced-metro-safety.sh"
    echo "3. Test bundle generation: curl -s 'http://localhost:8081/index.bundle?platform=ios' | head -2"
    echo "4. Build iOS app: npx react-native run-ios --simulator 'iPhone 15 Pro'"
    echo ""
    echo "📚 Documentation:"
    echo "- Troubleshooting: docs/troubleshooting/METRO_COMPREHENSIVE_GUIDE.md"
    echo "- Creation checklist: docs/templates/PROJECT_CREATION_CHECKLIST.md"
    echo ""
    echo "🛡️ Metro Safety: Always use ./enhanced-metro-safety.sh for zero-conflict startup"
}

# Show available functions
rnt_help() {
    echo "🎯 ReactNativeTest Helper Functions:"
    echo ""
    echo "📋 Available commands:"
    echo "  rnt_copy_config      - Copy core configuration files"
    echo "  rnt_copy_safety      - Copy safety scripts"
    echo "  rnt_copy_testing     - Copy testing infrastructure"
    echo "  rnt_copy_auth        - Copy authentication system"
    echo "  rnt_copy_supabase    - Copy Supabase configuration"
    echo "  rnt_setup_new_project [name] - Complete project setup"
    echo "  rnt_help             - Show this help"
    echo ""
    echo "📁 ReactNativeTest path: $RNT_PATH"
    echo "📚 Documentation: $RNT_PATH/docs/README-REUSABLE.md"
    echo ""
    echo "💡 Example usage:"
    echo "  rnt_setup_new_project MyAwesomeApp"
    echo "  rnt_copy_config"
    echo "  rnt_copy_auth"
}

# Display help when sourced
echo "✅ ReactNativeTest helper functions loaded!"
echo "📋 Type 'rnt_help' for available commands"
echo "📁 RNT_PATH: $RNT_PATH"
