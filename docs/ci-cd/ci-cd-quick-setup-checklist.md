# CI/CD Quick Setup Checklist

**Date**: August 5, 2025\
**Project**: ReactNativeTest\
**Purpose**: Rapid CI/CD pipeline setup for React Native projects

---

## 🚀 30-Minute CI/CD Setup

### Prerequisites ✅

- [ ] GitHub repository created
- [ ] React Native project initialized
- [ ] iOS and Android builds working locally
- [ ] App Store Connect and Google Play Console accounts ready

---

## 📋 Setup Steps

### 1. Repository Configuration (5 minutes)

#### Add CI/CD Files

```bash
# Create workflow directory
mkdir -p .github/workflows

# Copy CI/CD workflow (from ci-cd-implementation-guide.md)
cp ci-cd.yml .github/workflows/

# Add security policy
cp SECURITY.md ./

# Update package.json with CI/CD scripts
npm run typecheck
npm run lint
```

#### Commit Changes

```bash
git add .github/ SECURITY.md package.json
git commit -m "feat: Add CI/CD pipeline and security configuration"
git push
```

### 2. GitHub Secrets Setup (10 minutes)

#### Navigate to Repository Settings

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**

#### iOS Secrets (if deploying to TestFlight)

```bash
BUILD_CERTIFICATE_BASE64      # iOS signing certificate (base64)
P12_PASSWORD                  # Certificate password
BUILD_PROVISION_PROFILE_BASE64 # Provisioning profile (base64)
KEYCHAIN_PASSWORD            # Temporary keychain password
APP_STORE_CONNECT_API_KEY_ID # App Store Connect API key
APP_STORE_CONNECT_ISSUER_ID  # App Store Connect issuer ID
APP_STORE_CONNECT_PRIVATE_KEY # App Store Connect private key
```

#### Android Secrets (if deploying to Play Console)

```bash
ANDROID_KEYSTORE_BASE64      # Android keystore (base64)
ANDROID_KEYSTORE_PASSWORD    # Keystore password
ANDROID_KEY_ALIAS           # Key alias
ANDROID_KEY_PASSWORD        # Key password
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON # Play Console service account
```

#### Optional Secrets

```bash
SLACK_WEBHOOK_URL           # Slack notifications
SNYK_TOKEN                  # Security scanning
```

### 3. iOS Configuration (5 minutes)

#### Update exportOptions.plist

```xml
<!-- ios/exportOptions.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>signingStyle</key>
    <string>automatic</string>
</dict>
</plist>
```

#### Generate Certificate Base64

```bash
# Export certificate from Keychain Access as .p12
# Convert to base64
base64 -i certificate.p12 | pbcopy
# Paste into BUILD_CERTIFICATE_BASE64 secret
```

### 4. Android Configuration (5 minutes)

#### Generate Release Keystore

```bash
cd android/app
keytool -genkey -v -keystore release.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

#### Convert Keystore to Base64

```bash
base64 -i release.keystore | pbcopy
# Paste into ANDROID_KEYSTORE_BASE64 secret
```

#### Update build.gradle (if needed)

```gradle
// android/app/build.gradle
android {
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
}
```

### 5. Branch Protection (3 minutes)

#### Configure Main Branch Protection

1. Go to **Settings** → **Branches**
2. Click **Add rule** for `main` branch
3. Enable:
   - [ ] **Require status checks**
   - [ ] **Require branches to be up to date**
   - [ ] **Require review from code owners**
   - [ ] **Restrict pushes that create files**

### 6. Test Pipeline (2 minutes)

#### Trigger First Run

```bash
# Make a small change and push
echo "# CI/CD Pipeline Active" >> README.md
git add README.md
git commit -m "test: Trigger CI/CD pipeline"
git push
```

#### Verify in GitHub Actions

1. Go to **Actions** tab in repository
2. Watch pipeline execution
3. Verify all jobs complete successfully

---

## ✅ Verification Checklist

### Pipeline Jobs Working

- [ ] **Lint and TypeScript** - Code quality checks pass
- [ ] **Unit Tests** - All tests pass with coverage
- [ ] **Security Scan** - No high-severity vulnerabilities
- [ ] **iOS Build** - Builds successfully (if iOS configured)
- [ ] **Android Build** - Builds successfully (if Android configured)
- [ ] **Bundle Analysis** - Bundle size reported

### Notifications Working

- [ ] **GitHub Status** - Commit status updates show
- [ ] **Slack Notifications** - Messages sent (if configured)
- [ ] **Email Alerts** - Team receives notifications

### Security Working

- [ ] **npm audit** - Dependency scanning active
- [ ] **Snyk scanning** - Advanced security checks (if token configured)
- [ ] **Secret protection** - Secrets not exposed in logs

---

## 🚨 Common Issues & Quick Fixes

### iOS Build Fails

```bash
# Clean and reinstall pods
cd ios
rm -rf build/ Pods/ Podfile.lock
pod install
```

### Android Build Fails

```bash
# Clean gradle build
cd android
./gradlew clean
```

### Tests Fail

```bash
# Update snapshots
npm test -- --updateSnapshot

# Clear Jest cache
npx jest --clearCache
```

### Security Scan Fails

```bash
# Fix automatic vulnerabilities
npm audit fix

# Review and resolve manually
npm audit
```

---

## 🎯 What You Get

After completing this checklist, your React Native project will have:

✅ **Automated Testing** - Every commit tested for quality\
✅ **Security Scanning** - Vulnerability detection and prevention\
✅ **Multi-Platform Builds** - iOS and Android built automatically\
✅ **Deployment Ready** - One-click deployment to app stores\
✅ **Team Notifications** - Real-time pipeline status updates\
✅ **Professional Workflow** - Industry-standard CI/CD practices

---

## 🚀 Next Steps

1. **Create First Release** - Tag a version and watch auto-deployment
2. **Add Team Members** - Invite collaborators to repository
3. **Configure Environments** - Set up staging and production
4. **Monitor Metrics** - Track build success rates and deployment frequency
5. **Iterate and Improve** - Add more tests and optimize pipeline

Your React Native project now has enterprise-grade CI/CD! 🎉
