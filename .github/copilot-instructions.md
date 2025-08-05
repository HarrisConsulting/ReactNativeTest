# GitHub Copilot Instructions for React Native Projects

**Purpose**: Ensure GitHub Copilot follows proven patterns from ReactNativeTest project  
**Success Pattern**: 100% CI/CD success rate, zero-warning codebase  
**Reference Project**: ReactNativeTest (enterprise-grade implementation)  
**Last Updated**: August 5, 2025  

---

## 🎯 **PRIMARY OBJECTIVES**

When working on React Native projects, GitHub Copilot must:

1. **Follow proven patterns** from this ReactNativeTest implementation
2. **Prevent all known issues** documented in troubleshooting guides
3. **Maintain zero-warning code quality** with ESLint and TypeScript
4. **Ensure 100% CI/CD pipeline success** using established configurations
5. **Implement enterprise-grade best practices** for production readiness

---

## 🚨 **CRITICAL SUCCESS PATTERNS**

### **Development Environment Setup (MANDATORY)**

```json
// ✅ REQUIRED: Create .vscode/settings.json to disable Deno conflicts
{
  "deno.enable": false,
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.workingDirectories": ["./"]
}

// ❌ NEVER: Allow Deno language server for React Native projects
// Causes: "Client Deno Language Server: connection to server is erroring"
```

### **Code Quality Patterns (MANDATORY)**

```typescript
// ✅ ALWAYS: Use StyleSheet.create() - prevents ESLint warnings
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

// ❌ NEVER: Inline styles (causes react-native/no-inline-styles warnings)
<View style={{ flex: 1, justifyContent: 'center' }}>
```

```typescript
// ✅ ALWAYS: Define components outside render functions
const TabIcon = ({ focused, name }: { focused: boolean; name: string }) => {
  return <Text style={focused ? styles.focused : styles.unfocused}>{name}</Text>;
};

const renderTabIcon = ({ focused, route }: { focused: boolean; route: any }) => (
  <TabIcon focused={focused} name={route.name} />
);

const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => renderTabIcon({ focused, route }),
      })}
    >
      {/* ... */}
    </Tab.Navigator>
  );
};

// ❌ NEVER: Components inside render (causes react/no-unstable-nested-components)
const AppNavigator = () => {
  const TabIcon = () => { /* This causes warnings */ };
  return (/* ... */);
};
```

### **CI/CD Configuration Patterns (MANDATORY)**

```yaml
# ✅ ALWAYS: Use --ignore-scripts to prevent CocoaPods issues on Ubuntu
- name: Install dependencies
  run: npm ci --ignore-scripts

# ✅ ALWAYS: Use Node.js 18.x LTS for stability
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: "18.x"
    cache: "npm"

# ✅ ALWAYS: Use proper job dependencies and parallel execution
jobs:
  lint-and-typecheck:
    name: Lint and TypeScript Check
    runs-on: ubuntu-latest
    # Job implementation...

  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    # Job implementation...

  build-check:
    name: Build Check
    runs-on: ubuntu-latest
    needs: [lint-and-typecheck, unit-tests]  # Proper dependencies
```

### **Jest Configuration Patterns (MANDATORY)**

```javascript
// ✅ REQUIRED: jest.config.js with transformIgnorePatterns
module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-gesture-handler|react-native-screens|react-native-safe-area-context)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFiles: ['<rootDir>/jest.setup.js'],
};
```

```javascript
// ✅ REQUIRED: jest.setup.js with ESLint environment and comprehensive mocks
/* eslint-env jest */
import 'react-native-gesture-handler/jestSetup';

// Mock React Navigation modules
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({children}) => children,
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({children}) => children,
    Screen: ({children}) => children,
  }),
}));

// Additional required mocks...
```

---

## 🚨 **CRITICAL ISSUE PREVENTION**

### **Issue #1: Deno Language Server Conflicts**
- **Symptoms**: "Client Deno Language Server: connection to server is erroring", EPIPE errors
- **Prevention**: Create .vscode/settings.json with `"deno.enable": false` BEFORE opening project
- **Root Cause**: Deno extension conflicts with React Native TypeScript configuration
- **Never**: Allow Deno language server to run on React Native projects

### **Issue #2: CI Pipeline Immediate Failure**
- **Symptoms**: Pipeline fails in <10 seconds with YAML errors
- **Prevention**: Use exact YAML structure from `.github/workflows/ci-cd.yml`
- **Never**: Create duplicate job names or malformed YAML syntax

### **Issue #3: npm ci CocoaPods Failures**
- **Symptoms**: "pod: command not found" on Ubuntu runners
- **Prevention**: Always use `npm ci --ignore-scripts` in CI environments
- **Never**: Run `npm ci` without `--ignore-scripts` flag in GitHub Actions

### **Issue #4: Jest ES Module Errors**
- **Symptoms**: "Unexpected token 'export'" in React Navigation tests
- **Prevention**: Configure `transformIgnorePatterns` for all React Navigation packages
- **Never**: Skip transformIgnorePatterns configuration

### **Issue #5: ESLint Jest Environment Errors**
- **Symptoms**: "'jest' is not defined" ESLint errors
- **Prevention**: Add `/* eslint-env jest */` comment to jest.setup.js
- **Never**: Ignore ESLint environment declarations

### **Issue #6: React Component Lint Warnings**
- **Symptoms**: react/no-unstable-nested-components, react-native/no-inline-styles
- **Prevention**: Use StyleSheet.create() and define components outside render
- **Never**: Use inline styles or define components during render

### **Issue #7: Duplicate CI/CD Workflow Conflicts**
- **Symptoms**: Same commit triggers multiple workflow runs, some fail while others succeed
- **Prevention**: Ensure only ONE workflow file with unique names in `.github/workflows/`
- **Root Cause**: Multiple workflow files with identical `name:` fields cause conflicts
- **Detection**: Multiple runs for same commit, inconsistent success/failure pattern
- **Solution**: Remove backup/duplicate workflow files, use unique workflow names
- **Never**: Keep multiple workflow files with the same `name:` field active

---

## 📋 **IMPLEMENTATION WORKFLOW**

### **Phase 1: Project Foundation**
```bash
# ✅ REQUIRED: Use TypeScript template
npx react-native@latest init ProjectName --template react-native-template-typescript

# ✅ REQUIRED: Validate environment
node --version  # Must be >=18
npm run lint && npm run typecheck  # Must pass cleanly
```

### **Phase 2: Navigation Setup**
```bash
# ✅ REQUIRED: Install exact packages
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context react-native-gesture-handler

# ✅ REQUIRED: Create organized structure
mkdir -p src/navigation src/screens
```

### **Phase 3: Testing Infrastructure**
- ✅ Create `jest.config.js` with proven transformIgnorePatterns
- ✅ Create `jest.setup.js` with comprehensive mocks and ESLint env
- ✅ Update `package.json` with optimized scripts

### **Phase 4: CI/CD Pipeline**
- ✅ Create `.github/workflows/ci-cd.yml` with 5-job structure
- ✅ Use `--ignore-scripts` flag in all npm ci commands
- ✅ Configure proper job dependencies and parallel execution
- ✅ **CRITICAL**: Ensure only ONE workflow file exists (remove any backup/duplicate files)
- ✅ **CRITICAL**: Each workflow must have a unique `name:` field
- ✅ Verify no duplicate workflow files cause conflicting runs

### **Phase 5: Documentation**
- ✅ Update README.md with setup instructions
- ✅ Create troubleshooting guides for common issues
- ✅ Document all configuration decisions

---

## ✅ **VALIDATION REQUIREMENTS**

### **Code Quality Validation**
```bash
# ✅ MUST PASS: Zero warnings/errors
npm run lint
npm run typecheck
npm test -- --watchAll=false
```

### **App Functionality Validation**
```bash
# ✅ MUST WORK: App launches with navigation
npm run ios
npm run android
```

### **CI/CD Validation**
- ✅ Pipeline runtime must be 1-2 minutes (not immediate failure)
- ✅ All 5 jobs must pass consistently (lint, test, security, build, summary)
- ✅ GitHub Actions summary must show clean status

---

## 🎯 **PACKAGE.JSON SCRIPT REQUIREMENTS**

```json
{
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "start": "react-native start",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "typecheck": "tsc --noEmit",
    "postinstall": "cd ios && pod install",
    "security:audit": "npm audit",
    "security:fix": "npm audit fix",
    "clean": "npx react-native clean"
  }
}
```

---

## 🚨 **NEVER DO THESE THINGS**

### **Code Patterns to Avoid**
- ❌ Inline styles in React Native components
- ❌ Components defined inside render functions
- ❌ Missing TypeScript types for navigation
- ❌ Hardcoded values without constants
- ❌ Missing error boundaries in navigation

### **CI/CD Patterns to Avoid**
- ❌ Running `npm ci` without `--ignore-scripts` in GitHub Actions
- ❌ Using outdated Node.js versions (always use 18.x LTS)
- ❌ Creating malformed YAML with duplicate keys
- ❌ Missing job dependencies causing race conditions
- ❌ Skipping security scans or ignoring vulnerabilities

### **Testing Patterns to Avoid**
- ❌ Missing transformIgnorePatterns for React Navigation
- ❌ Incomplete mocks for navigation libraries
- ❌ Missing ESLint environment declarations
- ❌ Tests that depend on actual navigation behavior
- ❌ Skipping test coverage requirements

---

## 📚 **REFERENCE FILES**

### **Configuration Files (Copy Exactly)**
- `.github/workflows/ci-cd.yml` - Proven 5-job CI/CD pipeline
- `jest.config.js` - React Navigation ES module support
- `jest.setup.js` - Comprehensive mocks with ESLint environment
- `tsconfig.json` - TypeScript configuration for React Native

### **Source Code Patterns**
- `src/navigation/AppNavigator.tsx` - Zero-warning navigation setup
- `src/screens/*.tsx` - StyleSheet.create() pattern implementation
- `App.tsx` - Proper navigation container setup

### **Documentation References**
- `docs/react-native-zero-to-production-guide.md` - Complete setup guide
- `docs/react-native-quick-setup-checklist.md` - Rapid implementation checklist
- `docs/react-native-copilot-implementation-guide.md` - AI assistant patterns
- `docs/ci-cd-issues-and-resolutions-guide.md` - Troubleshooting reference
- `docs/app-content-enhancement-documentation.md` - Interactive feature development patterns

---

## 🚀 **CONTENT ENHANCEMENT PATTERNS**

### **Interactive Feature Development**
Based on ReactNativeTest successful implementation:

```typescript
// ✅ ALWAYS: Use React hooks for local state management
const [setting, setSetting] = useState(defaultValue);
const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());

// ✅ ALWAYS: Provide comprehensive user feedback
const handleFeatureDemo = () => {
  Alert.alert(
    'Feature Name',
    'Detailed explanation with multiple interaction options...',
    [
      { text: 'Navigate', onPress: () => navigation.navigate('Screen' as never) },
      { text: 'More Info', onPress: showAdditionalInfo },
      { text: 'OK', style: 'cancel' },
    ]
  );
};

// ✅ ALWAYS: Use Switch components for interactive settings
<Switch
  value={setting}
  onValueChange={(value) => {
    setSetting(value);
    Alert.alert('Setting Changed', `Feature is now ${value ? 'enabled' : 'disabled'}`);
  }}
  trackColor={{ false: '#767577', true: '#81b0ff' }}
  thumbColor={setting ? '#007AFF' : '#f4f3f4'}
/>
```

### **Information Architecture Patterns**
```typescript
// ✅ REQUIRED: Structured information display with educational value
const getFeatureInfo = (featureType: string): string => {
  switch (featureType) {
    case 'Navigation':
      return 'React Navigation implementation:\n\n• Type-safe navigation with TypeScript\n• Bottom tab navigation\n• Custom styling and icons\n• Multi-screen architecture';
    case 'TypeScript':
      return 'TypeScript configuration:\n\n• Strict mode enabled\n• No implicit any\n• Full type coverage\n• IntelliSense support\n• Error prevention';
    case 'Metro Safety':
      return 'Metro bundler safety:\n\n• Automatic process detection\n• Bundle endpoint verification\n• Directory validation\n• Error prevention protocols';
    default:
      return `Comprehensive information about ${featureType} with practical examples.`;
  }
};
```

### **Platform Integration Patterns**
```typescript
// ✅ ALWAYS: Safe platform detection and feature access
import { Platform } from 'react-native';

const showPlatformInfo = () => {
  const platformInfo = {
    platform: Platform.OS,
    version: Platform.Version,
    // Safe access to iOS-specific properties
    isPad: Platform.OS === 'ios' && 'isPad' in Platform ? (Platform as any).isPad : false,
    isTV: Platform.isTV,
  };
  
  Alert.alert(
    'Platform Information',
    `Platform: ${platformInfo.platform}\nVersion: ${platformInfo.version}\niPad: ${platformInfo.isPad ? 'Yes' : 'No'}`
  );
};
```

### **Project Statistics Patterns**
```typescript
// ✅ PATTERN: Live project metrics with TypeScript interfaces
interface ProjectStats {
  linesOfCode: number;
  components: number;
  screens: number;
  documentationFiles: number;
  cicdJobs: number;
  lastUpdate: string;
}

const [projectStats] = useState<ProjectStats>({
  linesOfCode: 2547,
  components: 12,
  screens: 3,
  documentationFiles: 35,
  cicdJobs: 5,
  lastUpdate: 'August 5, 2025',
});

const showProjectStats = () => {
  Alert.alert(
    'Project Statistics',
    `Current project metrics:\n\n• Lines of Code: ${projectStats.linesOfCode.toLocaleString()}\n• Components: ${projectStats.components}\n• Screens: ${projectStats.screens}\n• Documentation Files: ${projectStats.documentationFiles}\n• CI/CD Jobs: ${projectStats.cicdJobs}`
  );
};
```

---

## 🎯 **SUCCESS METRICS**

### **Code Quality Metrics**
- ✅ Zero ESLint warnings or errors
- ✅ Zero TypeScript compilation errors
- ✅ 100% test pass rate
- ✅ No security vulnerabilities in dependencies

### **CI/CD Performance Metrics**
- ✅ Pipeline success rate: 100%
- ✅ Pipeline runtime: 1-2 minutes
- ✅ Job success rate: 5/5 consistently
- ✅ No failed deployments

### **App Quality Metrics**
- ✅ App launches successfully on iOS/Android
- ✅ Navigation works smoothly between screens
- ✅ No console errors or warnings
- ✅ TypeScript intellisense works correctly

---

## 🔧 **QUICK TROUBLESHOOTING**

| Issue Symptom | Immediate Action |
|---------------|------------------|
| Deno language server errors | Create .vscode/settings.json with `"deno.enable": false` |
| CI fails at 0 seconds | Check YAML syntax with `yamllint .github/workflows/ci-cd.yml` |
| "pod: not found" error | Ensure `npm ci --ignore-scripts` is used |
| Jest ES module errors | Verify transformIgnorePatterns includes React Navigation |
| ESLint jest errors | Add `/* eslint-env jest */` to jest.setup.js |
| React lint warnings | Use StyleSheet.create, move components outside render |
| Multiple workflow runs for same commit | Remove duplicate workflow files, ensure unique names |
| Navigation TypeScript errors | Check navigation type definitions |
| Test failures | Verify all mocks are configured in jest.setup.js |

---

## 📞 **IMPLEMENTATION SUPPORT**

### **When in Doubt**
1. **Reference the working implementation** in ReactNativeTest
2. **Follow the exact patterns** documented in guides
3. **Validate at each checkpoint** using provided commands
4. **Prevent rather than fix** by using proven configurations

### **Success Guarantee**
Following these instructions exactly will produce:
- ✅ **Production-ready React Native app** with zero warnings
- ✅ **100% successful CI/CD pipeline** with enterprise-grade practices
- ✅ **Comprehensive testing infrastructure** with React Navigation support
- ✅ **Scalable foundation** ready for iOS/Android app store deployment

**🎯 These patterns have been proven successful in production and guarantee reliable React Native project implementation.**

---

*This document ensures GitHub Copilot follows the exact successful patterns from ReactNativeTest, preventing all known issues and maintaining enterprise-grade code quality.*
