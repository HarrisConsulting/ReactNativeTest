# React Native New Project Exemplar Guide

**Purpose**: Use ReactNativeTest as a blueprint for creating new React Native projects  
**Success Pattern**: 100% CI/CD success rate, zero-warning codebase, enterprise-grade implementation  
**Reference Project**: ReactNativeTest (proven production patterns)  
**Created**: August 7, 2025  

---

## 🎯 **EXEMPLAR EXTRACTION STRATEGY**

This guide extracts all proven patterns, protocols, and procedures from ReactNativeTest into a reusable framework for new projects with different content but similar user journeys.

### **🏗️ REUSABLE FOUNDATION ELEMENTS**

#### **1. Project Architecture Patterns**
- **Authentication Flow**: Email-based auth with OTP verification
- **Navigation Structure**: Bottom tab navigation with conditional screens
- **State Management**: Context-based authentication with reducer patterns
- **Database Integration**: Supabase with TypeScript interfaces
- **Preference System**: JSONB-based scalable user preferences
- **Testing Architecture**: Jest with comprehensive mocking strategies

#### **2. Development Workflow Protocols**
- **Phase-based Development**: 6-phase implementation methodology
- **Feature Branch Strategy**: Automated detection and branching recommendations
- **Quality Gates**: Zero-warning code quality standards
- **CI/CD Pipeline**: 5-job enterprise-grade automation
- **Documentation Standards**: Comprehensive session tracking and knowledge management

#### **3. User Journey Framework**
- **Onboarding Flow**: Progressive profile setup with personalization
- **Authentication Experience**: Seamless email-based authentication
- **Protected Content Access**: Context-aware navigation flows
- **Preference Management**: Server-side persistence with smart fallbacks
- **Personalization Strategy**: Display name optimization and contextual experiences

---

## 📋 **NEW PROJECT CREATION FRAMEWORK**

### **Phase 0: Pre-Creation Planning (30 minutes)**

#### **0.1 Project Definition**
```bash
# Define project specifics
export NEW_PROJECT_NAME="YourNewProjectName"
export NEW_PROJECT_PATH="/Users/rogerharris/Projects/$NEW_PROJECT_NAME"
export NEW_PROJECT_CONTENT_TYPE="your-content-type"  # games -> your-content
export NEW_PROJECT_DESCRIPTION="Brief description of new project"
```

#### **0.2 Content Adaptation Planning**
```markdown
# Content Mapping from ReactNativeTest to New Project
- Game references → Your content references
- GameScreen → YourContentScreen  
- Game preferences → Your content preferences
- Play functionality → Your main functionality
- Score tracking → Your metrics tracking
```

#### **0.3 User Journey Comparison**
```typescript
// ReactNativeTest Journey
const ReactNativeTestJourney = {
  onboarding: 'Email auth → Profile setup → Game access',
  mainFlow: 'Home → Select game → Play → Results',
  preferences: 'Notification settings → Game preferences → Profile customization'
};

// Your New Project Journey (adapt accordingly)
const YourProjectJourney = {
  onboarding: 'Email auth → Profile setup → Content access',
  mainFlow: 'Home → Select content → Engage → Results',
  preferences: 'Notification settings → Content preferences → Profile customization'
};
```

### **Phase 1: Project Foundation Setup (45 minutes)**

#### **1.1 Initialize with ReactNativeTest Patterns**
```bash
# Navigate to projects directory
cd /Users/rogerharris/Projects

# Create new project with TypeScript template
npx react-native@latest init $NEW_PROJECT_NAME --template react-native-template-typescript

# Navigate to new project
cd $NEW_PROJECT_NAME

# Copy essential configuration files from ReactNativeTest
cp ../ReactNativeTest/.github/copilot-instructions.md .github/
cp ../ReactNativeTest/jest.config.js .
cp ../ReactNativeTest/jest.setup.js .
cp ../ReactNativeTest/tsconfig.json .
cp ../ReactNativeTest/metro.config.js .
```

#### **1.2 Apply Metro Safety Protocols**
```bash
# Copy Metro safety script and adapt
cp ../ReactNativeTest/start-metro.sh .
sed -i '' "s/ReactNativeTest/$NEW_PROJECT_NAME/g" start-metro.sh
sed -i '' "s|/Users/rogerharris/Projects/ReactNativeTest|$NEW_PROJECT_PATH|g" start-metro.sh
chmod +x start-metro.sh
```

#### **1.3 Copy Package.json Enhancements**
```bash
# Extract proven package.json scripts
node -e "
const oldPkg = require('../ReactNativeTest/package.json');
const newPkg = require('./package.json');
newPkg.scripts = {
  ...newPkg.scripts,
  'lint': oldPkg.scripts.lint,
  'lint:fix': oldPkg.scripts['lint:fix'],
  'typecheck': oldPkg.scripts.typecheck,
  'test:coverage': oldPkg.scripts['test:coverage'],
  'security:audit': oldPkg.scripts['security:audit'],
  'clean': oldPkg.scripts.clean,
  'start-safe': oldPkg.scripts['start-safe'],
  'verify-project': oldPkg.scripts['verify-project']
};
require('fs').writeFileSync('./package.json', JSON.stringify(newPkg, null, 2));
"
```

### **Phase 2: Directory Structure Setup (30 minutes)**

#### **2.1 Create Source Code Architecture**
```bash
# Create directory structure based on ReactNativeTest
mkdir -p src/{auth,hooks,navigation,screens,services,utils}
mkdir -p src/screens/{auth,content}  # Adapt 'content' to your domain
mkdir -p __tests__/{auth,content,navigation,services}
mkdir -p docs/{authentication,project-management,setup-guides,troubleshooting}

# Copy and adapt core TypeScript interfaces
cp ../ReactNativeTest/src/auth/types.ts src/auth/
cp ../ReactNativeTest/src/navigation/types.ts src/navigation/
```

#### **2.2 Copy Authentication Foundation**
```bash
# Copy authentication infrastructure (universal patterns)
cp ../ReactNativeTest/src/auth/AuthContext.tsx src/auth/
cp ../ReactNativeTest/src/auth/authService.ts src/auth/
cp ../ReactNativeTest/src/auth/hooks.ts src/auth/
cp ../ReactNativeTest/src/auth/storage.ts src/auth/
cp ../ReactNativeTest/src/auth/utils.ts src/auth/
```

#### **2.3 Copy Navigation Framework**
```bash
# Copy navigation structure for adaptation
cp ../ReactNativeTest/src/navigation/AppNavigator.tsx src/navigation/
cp ../ReactNativeTest/src/screens/HomeScreen.tsx src/screens/
```

### **Phase 3: Content Adaptation (60 minutes)**

#### **3.1 Adapt Screen Components**
```bash
# Copy authentication screens (universal)
cp ../ReactNativeTest/src/screens/auth/* src/screens/auth/

# Copy and adapt content-specific screens
cp ../ReactNativeTest/src/screens/GameScreen.tsx src/screens/content/YourContentScreen.tsx
```

#### **3.2 Content-Specific Adaptations**
```typescript
// Create content adaptation script
cat > adapt-content.js << 'EOF'
const fs = require('fs');
const path = require('path');

const adaptations = {
  'Game': 'YourContent',
  'game': 'yourcontent', 
  'GameScreen': 'YourContentScreen',
  'Play Game': 'Access Content',
  'game preferences': 'content preferences',
  'gaming': 'your-domain'
};

function adaptFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  Object.entries(adaptations).forEach(([from, to]) => {
    content = content.replace(new RegExp(from, 'g'), to);
  });
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Adapted: ${filePath}`);
}

// Adapt all relevant files
const filesToAdapt = [
  'src/screens/content/YourContentScreen.tsx',
  'src/navigation/AppNavigator.tsx',
  'src/screens/HomeScreen.tsx'
];

filesToAdapt.forEach(adaptFile);
EOF

node adapt-content.js
rm adapt-content.js
```

### **Phase 4: Database & Backend Setup (45 minutes)**

#### **4.1 Supabase Project Creation**
```bash
# Create new Supabase project for your content domain
# 1. Go to https://supabase.com/dashboard
# 2. Create new project: "your-project-name"
# 3. Note project URL and API keys

# Create Supabase configuration
mkdir -p supabase
```

#### **4.2 Adapt Database Schema**
```bash
# Copy database schema as foundation
cp ../ReactNativeTest/supabase/schema.sql supabase/
cp ../ReactNativeTest/supabase/auth-functions.sql supabase/
cp ../ReactNativeTest/supabase/check-current-database-state.sql supabase/

# Create content-specific adaptations script
cat > adapt-database.js << 'EOF'
const fs = require('fs');

// Adapt database schema for your content type
let schema = fs.readFileSync('supabase/schema.sql', 'utf8');

// Example adaptations (customize for your content)
const dbAdaptations = {
  'game_types': 'content_types',
  'GameType': 'ContentType', 
  'game preferences': 'content preferences',
  'gaming': 'your_domain'
};

Object.entries(dbAdaptations).forEach(([from, to]) => {
  schema = schema.replace(new RegExp(from, 'g'), to);
});

fs.writeFileSync('supabase/adapted-schema.sql', schema);
console.log('✅ Database schema adapted');
EOF

node adapt-database.js
rm adapt-database.js
```

### **Phase 5: CI/CD Pipeline Setup (30 minutes)**

#### **5.1 Copy CI/CD Configuration**
```bash
# Copy proven CI/CD pipeline
mkdir -p .github/workflows
cp ../ReactNativeTest/.github/workflows/ci-cd.yml .github/workflows/

# Adapt project name in CI/CD
sed -i '' "s/ReactNativeTest/$NEW_PROJECT_NAME/g" .github/workflows/ci-cd.yml
```

#### **5.2 Copy Development Tools**
```bash
# Copy VS Code configuration
mkdir -p .vscode
cp ../ReactNativeTest/.vscode/* .vscode/ 2>/dev/null || true

# Copy development scripts
cp ../ReactNativeTest/scripts/* scripts/ 2>/dev/null || true
```

### **Phase 6: Testing Infrastructure (45 minutes)**

#### **6.1 Copy Test Framework**
```bash
# Copy test files and adapt
cp ../ReactNativeTest/__tests__/App.test.tsx __tests__/
cp -r ../ReactNativeTest/__tests__/auth/* __tests__/auth/
cp -r ../ReactNativeTest/__mocks__/* __mocks__/
```

#### **6.2 Adapt Test Content**
```bash
# Create test adaptation script
cat > adapt-tests.js << 'EOF'
const fs = require('fs');
const path = require('path');

function adaptTestFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Adapt test descriptions and content
  content = content.replace(/GameScreen/g, 'YourContentScreen');
  content = content.replace(/game/g, 'content');
  content = content.replace(/Game/g, 'YourContent');
  
  fs.writeFileSync(filePath, content);
}

// Adapt test files
const testFiles = [
  '__tests__/App.test.tsx'
];

testFiles.forEach(adaptTestFile);
console.log('✅ Tests adapted');
EOF

node adapt-tests.js
rm adapt-tests.js
```

---

## 🛠️ **CONTENT-SPECIFIC CUSTOMIZATION GUIDE**

### **Authentication Adaptation (Keep Universal)**

```typescript
// ✅ KEEP UNCHANGED: Universal authentication patterns
- Email-based authentication flow
- OTP verification system  
- User profile management
- Session handling
- Security implementations

// ✅ ADAPT: Content-specific preferences
interface UserPreferences {
  notifications?: {
    email: boolean;
    push: boolean;
  };
  device?: {
    rememberDevice: boolean;
    sessionExtension: boolean;
  };
  // ADAPT: Replace game preferences with your content preferences
  contentTypes?: YourContentType[];  // Was: gameTypes?: GameType[];
  theme?: 'light' | 'dark';
  accessibility?: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
  };
}
```

### **Navigation Adaptation**

```typescript
// ✅ KEEP UNCHANGED: Navigation structure
const Tab = createBottomTabNavigator();
const AuthStack = createStackNavigator();

// ✅ ADAPT: Screen names and icons
const AppNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
      <Tab.Screen name="About" component={AboutScreen} />
      {/* ADAPT: Replace Auth with your domain-specific tab */}
      <Tab.Screen name="YourContent" component={YourContentScreen} />
    </Tab.Navigator>
  );
};
```

### **Content Screen Adaptation**

```typescript
// Pattern: GameScreen.tsx → YourContentScreen.tsx
const YourContentScreen = () => {
  const { user, userProfile } = useAuth();
  
  // ✅ KEEP: Personalization patterns
  const welcomeMessage = userProfile?.preferredName 
    ? `Hello ${userProfile.preferredName}! Ready to explore?`
    : `Hello ${user?.email?.split('@')[0] || 'User'}! Ready to explore?`;
    
  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>{welcomeMessage}</Text>
      
      {/* ADAPT: Replace game content with your content */}
      <Text style={styles.description}>
        Your main content interaction goes here
      </Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={handleYourMainAction}  // Was: handlePlayGame
      >
        <Text style={styles.buttonText}>Start Your Experience</Text>
      </TouchableOpacity>
    </View>
  );
};
```

---

## 📚 **DOCUMENTATION FRAMEWORK**

### **Essential Documentation to Copy**

```bash
# Copy core documentation structure
cp ../ReactNativeTest/docs/project-management/project-creation-checklist.md docs/project-management/
cp ../ReactNativeTest/docs/troubleshooting/anti-error-protocol.md docs/troubleshooting/
cp ../ReactNativeTest/docs/authentication/feature-development-procedures.md docs/authentication/
cp ../ReactNativeTest/docs/setup-guides/react-native-quick-setup-checklist.md docs/setup-guides/
```

### **Documentation Adaptation Strategy**

```markdown
# Create project-specific documentation
1. **Update project name** in all documentation references
2. **Adapt content examples** from games to your domain
3. **Maintain procedural patterns** (6-phase development, quality gates)
4. **Keep troubleshooting protocols** (universal React Native issues)
5. **Adapt user journey documentation** to your content flow
```

---

## 🚀 **DEPLOYMENT FRAMEWORK**

### **Quality Validation Checklist (Universal)**

```bash
# ✅ MANDATORY: Execute before any deployment
npm run lint           # Must pass with zero warnings
npm run typecheck      # Must pass with zero errors  
npm test              # Must achieve >85% pass rate
npm run ios           # Must launch successfully

# ✅ MANDATORY: CI/CD validation
git add .
git commit -m "Initial project setup following ReactNativeTest patterns"
git push origin main
# Wait for CI/CD pipeline to pass (5/5 jobs green)
```

### **Production Readiness Protocol**

```typescript
// ✅ CHECKLIST: Before production deployment
const ProductionReadiness = {
  authentication: '✅ Email auth with OTP verification working',
  navigation: '✅ All screens accessible and functional',
  preferences: '✅ User preferences persist to database',
  personalization: '✅ Display names and contextual content working',
  testing: '✅ >85% test pass rate with comprehensive coverage',
  cicd: '✅ All pipeline jobs passing consistently',
  security: '✅ No vulnerabilities in dependency audit',
  performance: '✅ App launches and functions smoothly',
  documentation: '✅ All features documented with troubleshooting guides'
};
```

---

## 🎯 **SUCCESS METRICS & VALIDATION**

### **Implementation Success Indicators**

```bash
# ✅ Code Quality Metrics (ReactNativeTest standards)
- Zero ESLint warnings or errors
- Zero TypeScript compilation errors
- >85% test pass rate minimum
- No security vulnerabilities in dependencies

# ✅ CI/CD Performance Metrics (ReactNativeTest patterns)
- Pipeline success rate: 100%
- Pipeline runtime: 1-3 minutes (not immediate failure)
- Job success rate: 5/5 consistently
- No failed deployments

# ✅ App Quality Metrics (ReactNativeTest standards)
- App launches successfully on iOS/Android
- Navigation works smoothly between screens
- Authentication flow functional
- User preferences persist correctly
- Personalization features working
- No console errors or warnings
```

### **Content Adaptation Validation**

```typescript
// ✅ Verify content adaptations successful
const validateAdaptation = {
  terminology: 'All game references replaced with your content terms',
  functionality: 'Core user journey works with your content',
  branding: 'App reflects your project identity',
  database: 'Schema adapted for your content types',
  preferences: 'User preferences relevant to your domain',
  testing: 'Tests adapted and passing for your content'
};
```

---

## 🚀 **NEXT STEPS FRAMEWORK**

### **Immediate Actions (Day 1)**
1. **Execute Phase 1-3**: Project setup with content adaptation
2. **Validate build**: Ensure app launches with your content
3. **Test authentication**: Verify email auth flow works
4. **Commit foundation**: Push initial setup to repository

### **Development Phase (Week 1)**
1. **Implement content-specific features**: Build your main functionality
2. **Adapt preferences**: Customize user preferences for your domain
3. **Enhance UI/UX**: Adapt screens and navigation for your content
4. **Test thoroughly**: Ensure all adapted components work correctly

### **Production Phase (Week 2-4)**
1. **Security hardening**: Implement production security measures
2. **Performance optimization**: Optimize for your content types
3. **Comprehensive testing**: Full test coverage for your features
4. **Documentation completion**: Document all customizations

---

## 📋 **ADAPTATION CHECKLIST**

```bash
# ✅ Project Foundation
- [ ] Project created with ReactNativeTest patterns
- [ ] Metro safety protocols implemented
- [ ] Configuration files copied and adapted
- [ ] Directory structure established

# ✅ Content Adaptation  
- [ ] Authentication screens copied (universal)
- [ ] Content screens adapted from GameScreen pattern
- [ ] Navigation updated for your content domain
- [ ] Database schema adapted for your content types

# ✅ Quality Framework
- [ ] CI/CD pipeline configured and passing
- [ ] Testing infrastructure adapted and working
- [ ] Documentation updated for your project
- [ ] Clean build validation successful

# ✅ Production Readiness
- [ ] All ReactNativeTest quality standards met
- [ ] Content-specific features implemented
- [ ] User journey tested and optimized
- [ ] Ready for deployment with enterprise-grade quality
```

---

## 🎉 **EXPECTED OUTCOMES**

Following this exemplar guide will produce:

✅ **Production-ready React Native app** with your content using proven ReactNativeTest patterns  
✅ **100% successful CI/CD pipeline** with enterprise-grade automation  
✅ **Comprehensive authentication system** with email-based flow and user preferences  
✅ **Zero-warning code quality** following ReactNativeTest standards  
✅ **Scalable foundation** ready for your content domain with proven user journey patterns  
✅ **Enterprise-grade testing infrastructure** adapted for your content  
✅ **Complete documentation framework** supporting long-term development  

**🎯 This framework ensures you inherit all ReactNativeTest successes while building content specific to your domain.**

---

*This exemplar guide extracts all proven patterns, protocols, and procedures from ReactNativeTest into a reusable framework, ensuring new projects benefit from the 100% CI/CD success rate and enterprise-grade implementation standards while adapting content for different domains.*
