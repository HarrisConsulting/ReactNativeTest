# React Native CI/CD Quick Troubleshooting Checklist

**🚀 Use this checklist when setting up or debugging React Native CI/CD pipelines**

---

## ⚡ **Pre-Flight Checklist**

### **Before Creating CI/CD Pipeline:**
- [ ] ✅ Verify local tests pass: `npm test -- --watchAll=false`
- [ ] ✅ Confirm linting works: `npm run lint`
- [ ] ✅ Check TypeScript: `npm run typecheck`
- [ ] ✅ Validate package.json scripts exist
- [ ] ✅ Remove or handle `postinstall` scripts for CI

---

## 🚨 **When Pipeline Fails Immediately (0s elapsed)**

**Likely Cause: YAML Syntax Errors**

```bash
# Quick diagnosis
gh run view --log
# Look for: "Invalid workflow file"
```

**Quick Fixes:**
1. Check for duplicate job definitions
2. Validate YAML syntax: `yamllint .github/workflows/ci-cd.yml`
3. Look for corrupted lines like `fi  job-name:`
4. Simplify workflow to minimal working version

---

## 🚨 **When npm ci Fails**

**Error Pattern:**
```
sh: 1: pod: not found
npm error code 127
```

**Fix:**
```yaml
# Change from:
run: npm ci
# To:
run: npm ci --ignore-scripts
```

**Why:** React Native projects often have `postinstall` scripts that run iOS CocoaPods, which aren't available on Ubuntu CI runners.

---

## 🚨 **When Jest Tests Fail**

**Error Pattern:**
```
SyntaxError: Unexpected token 'export'
@react-navigation/native/lib/module/index.js
```

**Fix 1 - jest.config.js:**
```javascript
module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-gesture-handler|react-native-screens|react-native-safe-area-context)/)',
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
};
```

**Fix 2 - Create jest.setup.js:**
```javascript
/* eslint-env jest */
import 'react-native-gesture-handler/jestSetup';

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({children}) => children,
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({children}) => children,
    Screen: ({children}) => children,
  }),
}));
```

---

## 🚨 **When ESLint Fails**

**Error Pattern:**
```
'jest' is not defined.eslint(no-undef)
```

**Fix:**
```javascript
// Add to top of jest.setup.js
/* eslint-env jest */
```

**Alternative:**
```javascript
/* global jest */
```

---

## 🔍 **Common Debugging Commands**

```bash
# Check pipeline status
gh run list --limit 5

# View detailed logs
gh run view --log

# Get JSON status
gh run view --json status,conclusion

# Test locally before pushing
npm ci --ignore-scripts
npm run lint
npm run typecheck  
npm test -- --watchAll=false
```

---

## 📋 **Essential Package.json Scripts**

```json
{
  "scripts": {
    "lint": "eslint .",
    "typecheck": "tsc --noEmit", 
    "test": "jest",
    "security:audit": "npm audit"
  }
}
```

---

## ⚡ **Minimal Working CI/CD Workflow**

```yaml
name: React Native CI/CD
on: [push, pull_request]
env:
  NODE_VERSION: "18.x"

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"
      - run: npm ci --ignore-scripts
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --watchAll=false
```

---

## 🚀 **Success Criteria**

**✅ Pipeline is working when:**
- Runtime > 30 seconds (not immediate failure)
- All jobs show green checkmarks ✅
- No "pod: not found" errors
- Jest tests execute without syntax errors
- ESLint completes without blocking errors

**❌ Pipeline needs fixes when:**
- Fails in 0-5 seconds (YAML/setup issue)
- "npm ci" fails with script errors
- Jest shows ES module syntax errors
- ESLint shows "not defined" errors

---

## 💡 **Pro Tips**

1. **Start Simple**: Begin with a 1-job workflow, then expand
2. **Test Locally**: Always verify fixes work locally first  
3. **Use --ignore-scripts**: Standard for React Native CI
4. **Mock Everything**: React Navigation, native modules, etc.
5. **Check Dependencies**: Ensure all npm scripts exist

---

**🎯 Goal: Green checkmarks on all jobs in under 2 minutes!**
