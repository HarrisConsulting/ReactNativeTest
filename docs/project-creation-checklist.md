# React Native Project Creation Checklist

**Use this checklist for EVERY new React Native project to prevent Metro
directory errors**

## 📋 Pre-Creation Phase

- [ ] **Verify Parent Directory**: Ensure you're in
      `/Users/rogerharris/Projects`
- [ ] **Check for Conflicts**: No existing Metro processes running
      (`ps aux | grep metro`)
- [ ] **Clean Terminal State**: Fresh terminal session

## 📋 Creation Phase (Execute in Order)

### Step 1: Project Initialization

```bash
cd /Users/rogerharris/Projects
npx @react-native-community/cli@latest init YourProjectName --skip-install
cd YourProjectName
pwd  # Verify: /Users/rogerharris/Projects/YourProjectName
```

- [ ] **Project created in correct location**
- [ ] **Terminal now in project directory**

### Step 2: Immediate Safety Setup (CRITICAL - Do Before Anything Else)

#### Create Metro Safety Script

```bash
cat > start-metro.sh << 'EOF'
#!/bin/bash
PROJECT_DIR="/Users/rogerharris/Projects/YourProjectName"

echo "🚀 Starting Metro from correct project directory..."
echo "📁 Project Directory: $PROJECT_DIR"

cd "$PROJECT_DIR" || exit 1

echo "📍 Current Directory: $(pwd)"
echo "✅ Verifying index.js exists: $(ls -la index.js 2>/dev/null || echo 'NOT FOUND')"

echo "🔄 Stopping any existing Metro processes..."
pkill -f metro 2>/dev/null || true

echo "▶️ Starting Metro with cache reset..."
npm start -- --reset-cache
EOF
chmod +x start-metro.sh
```

- [ ] **Metro safety script created**
- [ ] **Script made executable**

#### Add Safety Scripts to package.json

```bash
npm pkg set scripts.start-safe="./start-metro.sh"
npm pkg set scripts.verify-project="pwd && ls -la index.js package.json ios/"
npm pkg set scripts.test-bundle="curl -s 'http://localhost:8081/index.bundle?platform=ios' | head -2"
npm pkg set scripts.clean-start="pkill -f metro || true && ./start-metro.sh"
npm pkg set scripts.ios-safe="npm run verify-project && npx react-native run-ios"
```

- [ ] **Safety scripts added to package.json**

#### Create Protocol Documentation

````bash
cat > METRO_PROTOCOL.md << 'EOF'
# Metro Start Protocol for YourProjectName

## ⚠️ CRITICAL: Always follow this sequence

1. **Verify Directory**: `npm run verify-project`
2. **Start Metro Safely**: `npm run start-safe`
3. **Test Bundle**: `npm run test-bundle` (should return JavaScript)
4. **Launch App**: `npm run ios-safe`

## 🚨 Emergency Protocol (If Errors Occur)

```bash
npm run clean-start
# Wait for Metro to fully start
npm run test-bundle
# If bundle test passes, then:
npm run ios-safe
````

## Red Flags

- Red error screen → Metro directory issue
- "No script URL provided" → Metro wrong directory
- Bundle test returns error → Metro not serving correctly EOF

````
- [ ] **Protocol documentation created**

## 📋 Dependency Installation Phase

### Step 3: Install Dependencies Safely
```bash
# Verify location first
npm run verify-project

# Install dependencies
npm install
cd ios && pod install && cd ..

# Verify you're back in project root
pwd  # Should be /Users/rogerharris/Projects/YourProjectName
````

- [ ] **Dependencies installed from correct directory**
- [ ] **CocoaPods dependencies installed**
- [ ] **Returned to project root directory**

## 📋 First Build Phase (CRITICAL)

### Step 4: Pre-Build Verification

```bash
# 1. Verify project structure
npm run verify-project

# 2. Kill any existing Metro processes
pkill -f metro

# 3. Verify no Metro is running
ps aux | grep metro | grep -v grep  # Should be empty
```

- [ ] **Project structure verified**
- [ ] **No Metro processes running**

### Step 5: Start Metro Safely

```bash
# Start Metro using safety protocol
npm run start-safe
```

- [ ] **Metro started from correct directory**
- [ ] **Metro shows project directory in output**
- [ ] **Metro displays "Dev server ready" message**

### Step 6: Verify Metro Bundle (CRITICAL TEST)

```bash
# In NEW terminal, navigate to project
cd /Users/rogerharris/Projects/YourProjectName

# Test bundle endpoint
npm run test-bundle
```

**Expected Result**: Should return JavaScript code like:

```
var __BUNDLE_START_TIME__=globalThis.nativePerformanceNow?...
(function (global) {
```

**❌ FAILURE**: If you see error messages or "Unable to resolve module", STOP
and run `npm run clean-start`

- [ ] **Bundle test returns JavaScript (not errors)**

### Step 7: Launch App (Only After Bundle Test Passes)

```bash
# Launch iOS app
npm run ios-safe
```

- [ ] **App builds successfully**
- [ ] **App launches on simulator**
- [ ] **React Native welcome screen displays (not red error screen)**

## 📋 Post-Success Verification

### Step 8: Final Validation

- [ ] **App displays React Native logo and welcome text**
- [ ] **No red error screens**
- [ ] **Metro console shows successful bundle serving**
- [ ] **App responds to touch interactions**

### Step 9: Document Success

```bash
echo "✅ $(date): YourProjectName successfully created and verified" >> docs/creation-success.log
```

- [ ] **Success logged for future reference**

## 📋 Long-term Setup (Optional but Recommended)

### Step 10: VS Code Integration

```bash
mkdir -p .vscode
cat > .vscode/tasks.json << 'EOF'
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Start Metro Safely",
            "type": "shell",
            "command": "./start-metro.sh",
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "panel": "new"
            }
        },
        {
            "label": "Verify Project Directory",
            "type": "shell",
            "command": "npm run verify-project",
            "group": "test"
        }
    ]
}
EOF
```

- [ ] **VS Code tasks configured**

## 🚨 Emergency Protocols

### If Metro Directory Error Occurs

```bash
pkill -f metro
cd /Users/rogerharris/Projects/YourProjectName  # Use FULL path
npm run clean-start
npm run test-bundle  # Must pass before proceeding
npm run ios-safe
```

### If App Shows Red Error Screen

```bash
# 1. Check Metro is running from correct directory
ps aux | grep metro  # Should show YourProjectName in path

# 2. If wrong directory, restart Metro
npm run clean-start

# 3. Verify bundle before relaunching
npm run test-bundle

# 4. If bundle test passes, restart app
npm run ios-safe
```

## ✅ Success Criteria

- [ ] **Metro starts from `/Users/rogerharris/Projects/YourProjectName`**
- [ ] **Bundle test returns JavaScript code**
- [ ] **App displays React Native welcome screen**
- [ ] **No red error screens or Metro connection issues**

---

**Key Principle**: NEVER proceed to the next step until the current step's
verification passes. This checklist prevents the Metro directory errors that
caused circular debugging in ReactNativeTest.
