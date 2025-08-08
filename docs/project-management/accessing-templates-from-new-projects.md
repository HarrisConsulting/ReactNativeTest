# Accessing ReactNativeTest Templates from New Projects

**Scenario**: You're in a new project directory and want to use ReactNativeTest files as templates  
**Goal**: Easy access and copying of proven configurations and patterns  
**Updated**: August 7, 2025  

---

## 🎯 **RECOMMENDED APPROACHES**

### **🚀 Option 1: Helper Script (Fastest & Easiest)**
**Best for**: Quick project setup with minimal manual work

Use the ReactNativeTest helper functions:

```bash
# From your new project directory, source the helper script
source /path/to/ReactNativeTest/scripts/rnt-helpers.sh

# Complete project setup in one command
rnt_setup_new_project MyNewApp

# Or copy specific components
rnt_copy_config       # Core configuration files
rnt_copy_safety       # Safety scripts
rnt_copy_testing      # Testing infrastructure
rnt_copy_auth         # Authentication system
rnt_copy_supabase     # Database configuration

# See all available commands
rnt_help
```

**What it does**:
- ✅ Copies all essential configuration files
- ✅ Updates app names and paths automatically
- ✅ Sets up safety scripts and prevention protocols
- ✅ Creates proper directory structure
- ✅ Provides selective copying functions

---

### **📋 Option 2: Manual Template Copying (Most Control)**
**Best for**: Selective copying and customization

#### **Step 1: Set Up Easy Access**
```bash
# Define ReactNativeTest path for easy reference
export RNT_PATH="/path/to/ReactNativeTest"
# Or if cloned from GitHub:
export RNT_PATH="$HOME/Projects/ReactNativeTest"

# Add to your shell profile for permanent access
echo 'export RNT_PATH="/path/to/ReactNativeTest"' >> ~/.zshrc
source ~/.zshrc
```

#### **Step 2: Essential Files First (Copy These Always)**
```bash
# From your new project directory:

# 🔧 Core Configuration Files
cp $RNT_PATH/.github/workflows/ci-cd.yml .github/workflows/
cp $RNT_PATH/jest.config.js .
cp $RNT_PATH/jest.setup.js .
cp $RNT_PATH/tsconfig.json .
cp $RNT_PATH/.eslintrc.js .
cp $RNT_PATH/.prettierrc.js .
cp $RNT_PATH/.vscode/settings.json .vscode/

# 🛡️ Safety Scripts
cp $RNT_PATH/start-metro.sh .
chmod +x start-metro.sh

# 📝 Update start-metro.sh for your project
sed -i '' 's/ReactNativeTest/YourProjectName/g' start-metro.sh
sed -i '' 's|/Users/.*Projects/ReactNativeTest|'$(pwd)'|g' start-metro.sh
```

#### **Step 3: Package.json Scripts**
```bash
# Copy essential scripts to your package.json
# (You'll need to merge these manually)

cat $RNT_PATH/package.json | jq '.scripts | {
  "start-safe": .,
  "test-bundle": .,
  "verify-project": .,
  "clean-start": .,
  "ios-safe": .,
  "lint": .,
  "lint:fix": .,
  "typecheck": .,
  "clean": .
} | with_entries(select(.value != null))'
```

#### **Step 4: Selective Template Copying**
```bash
# 🏛️ Architecture Patterns (adapt as needed)
cp -r $RNT_PATH/src/navigation src/
cp -r $RNT_PATH/src/auth src/        # If using authentication
cp -r $RNT_PATH/src/services src/    # If using similar backend

# 🧪 Testing Infrastructure
cp -r $RNT_PATH/__tests__ .
cp -r $RNT_PATH/__mocks__ .

# 🗄️ Database (if using Supabase)
cp -r $RNT_PATH/supabase .

# 📚 Documentation Templates
cp $RNT_PATH/docs/sessions/lessons-learned-template.md docs/
cp $RNT_PATH/docs/troubleshooting/metro-protocol.md docs/
```

---

### **🔗 Option 3: Git Submodule (For Teams)**
**Best for**: Teams that want to stay updated with ReactNativeTest improvements

```bash
# From your new project directory
git submodule add https://github.com/HarrisConsulting/ReactNativeTest.git templates/reactnativetest

# Access files like this:
cp templates/reactnativetest/jest.config.js .
cp templates/reactnativetest/start-metro.sh .

# Update templates when ReactNativeTest improves:
git submodule update --remote
```

---

### **🌟 Option 4: Symlink Reference (Development)**
**Best for**: Active development where you want to reference original files

```bash
# Create a templates directory in your new project
mkdir templates
ln -s /path/to/ReactNativeTest templates/rnt

# Now you can reference files easily:
cp templates/rnt/jest.config.js .
cp templates/rnt/start-metro.sh .
ls templates/rnt/docs/templates/universal-configuration/
```

---

## 📋 **QUICK COPY CHECKLISTS**

### **🚨 Essential Files (Copy First - 5 minutes)**
```bash
# Must-have configuration (prevents common issues)
[ ] .github/workflows/ci-cd.yml
[ ] jest.config.js + jest.setup.js  
[ ] tsconfig.json
[ ] .eslintrc.js
[ ] .vscode/settings.json
[ ] start-metro.sh (update paths)
```

### **🏗️ Architecture Files (Copy if Similar - 10 minutes)**
```bash
# Navigation and structure
[ ] src/navigation/AppNavigator.tsx
[ ] src/screens/ (as templates)
[ ] src/auth/ (if using authentication)
[ ] src/services/ (adapt for your backend)
```

### **🧪 Testing Files (Copy for Quality - 5 minutes)**
```bash
# Testing infrastructure
[ ] __tests__/ directory structure
[ ] __mocks__/ directory
[ ] Test file patterns and examples
```

### **🗄️ Backend Files (Copy if Using Supabase - 10 minutes)**
```bash
# Database and backend
[ ] supabase/ directory (schema, functions, migrations)
[ ] Database integration patterns
[ ] Authentication service patterns
```

---

## 🔧 **CUSTOMIZATION AFTER COPYING**

### **Required Updates (Always Do These)**
```bash
# 1. Update app name in copied files
find . -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.yml" | \
  xargs sed -i '' 's/ReactNativeTest/YourAppName/g'

# 2. Update paths in start-metro.sh
sed -i '' "s|/Users/.*/ReactNativeTest|$(pwd)|g" start-metro.sh

# 3. Update CI/CD workflow name (prevent conflicts)
sed -i '' 's/React Native CI\/CD Pipeline/YourApp React Native Pipeline/g' .github/workflows/ci-cd.yml

# 4. Update package.json app name and bundle ID
```

### **Validation After Setup**
```bash
# Verify everything works
npm run lint               # Should pass with zero warnings
npm run typecheck         # Should pass with zero errors  
npm test                  # Should run successfully
./start-metro.sh          # Should start without directory errors
```

---

## 📚 **REFERENCE DOCUMENTATION ACCESS**

### **Online Access (Always Latest)**
```bash
# Browse templates online
open https://github.com/HarrisConsulting/ReactNativeTest/tree/main/docs/templates

# View specific template categories
open https://github.com/HarrisConsulting/ReactNativeTest/tree/main/docs/templates/universal-configuration
open https://github.com/HarrisConsulting/ReactNativeTest/tree/main/docs/templates/architecture-patterns
```

### **Local Documentation Reference**
```bash
# If you have ReactNativeTest locally
open $RNT_PATH/docs/README-REUSABLE.md
open $RNT_PATH/docs/templates/README.md
open $RNT_PATH/docs/patterns/README.md

# Or use CLI to view key info
cat $RNT_PATH/docs/templates/universal-configuration/README.md
```

---

## 🎯 **RECOMMENDED WORKFLOW BY PROJECT TYPE**

### **🚀 New React Native Project (Same Stack)**
1. **Use Option 1**: Automated script for complete setup
2. **Validate setup**: Run all quality checks
3. **Customize**: Update branding and app-specific details
4. **Start development**: Begin with proven foundation

### **📱 Existing React Native Project (Adding Features)**
1. **Use Option 2**: Manual selective copying
2. **Focus on**: Prevention protocols and testing infrastructure
3. **Add automation**: Copy GitHub Copilot instructions and safety scripts
4. **Gradual adoption**: Implement patterns incrementally

### **👥 Team Development**
1. **Use Option 3**: Git submodule for team consistency
2. **Document team patterns**: Create team-specific adaptations
3. **Regular updates**: Keep templates current with improvements
4. **Training**: Ensure team understands pattern applications

### **🔬 Experimental/Research Projects**
1. **Use Option 4**: Symlink for quick access
2. **Rapid prototyping**: Copy only essential configuration
3. **Focus on**: Prevention protocols to avoid common issues
4. **Documentation**: Use templates to maintain quality standards

---

## ⚡ **POWER USER SHORTCUTS**

### **⚡ POWER USER SHORTCUTS**

### **Permanent Helper Functions Setup**
Add ReactNativeTest helpers to your shell profile for permanent access:

```bash
# Add to ~/.zshrc or ~/.bashrc
echo 'export RNT_PATH="/path/to/ReactNativeTest"' >> ~/.zshrc
echo 'source "$RNT_PATH/scripts/rnt-helpers.sh"' >> ~/.zshrc
source ~/.zshrc

# Now you can use RNT helpers from any directory:
cd /path/to/new/project
rnt_setup_new_project MyAwesomeApp
```

### **Bash Functions for Quick Access**
If you prefer custom functions, add these to your `~/.zshrc` or `~/.bashrc`:

```bash
# ReactNativeTest template functions
rnt_copy_config() {
    local rnt_path="/path/to/ReactNativeTest"
    cp "$rnt_path/jest.config.js" .
    cp "$rnt_path/jest.setup.js" .
    cp "$rnt_path/tsconfig.json" .
    cp "$rnt_path/.eslintrc.js" .
    mkdir -p .vscode && cp "$rnt_path/.vscode/settings.json" .vscode/
    echo "✅ Core configuration copied"
}

rnt_copy_safety() {
    local rnt_path="/path/to/ReactNativeTest"
    cp "$rnt_path/start-metro.sh" .
    chmod +x start-metro.sh
    sed -i '' "s|/Users/.*/ReactNativeTest|$(pwd)|g" start-metro.sh
    echo "✅ Safety scripts copied and configured"
}

rnt_setup_new_project() {
    rnt_copy_config
    rnt_copy_safety
    mkdir -p .github/workflows
    cp "/path/to/ReactNativeTest/.github/workflows/ci-cd.yml" .github/workflows/
    echo "✅ New project setup complete"
}
```

### **VS Code Workspace Setup**
Create a multi-root workspace including ReactNativeTest for easy reference:

```json
{
    "folders": [
        {
            "name": "Current Project",
            "path": "."
        },
        {
            "name": "ReactNativeTest Templates",
            "path": "/path/to/ReactNativeTest"
        }
    ]
}
```

---

**🎯 The automated script (Option 1) is recommended for most new projects, while manual copying (Option 2) gives you the most control for selective implementation. Choose the approach that best fits your workflow and team needs.**
