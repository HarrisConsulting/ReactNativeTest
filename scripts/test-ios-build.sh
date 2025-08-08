#!/bin/bash

# test-ios-build.sh - Test iOS build readiness after configuration
# Validates that iOS project is properly configured for building

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

PROJECT_NAME=""
PROJECT_DIR=""

echo -e "${CYAN}🧪 iOS Build Readiness Test${NC}"
echo ""

# Auto-detect project
if [ -n "$1" ]; then
    PROJECT_DIR="$1"
    PROJECT_NAME=$(basename "$PROJECT_DIR")
    echo -e "${BLUE}📁 Using specified project: $PROJECT_DIR${NC}"
else
    # Try to detect from current directory
    if [ -f "package.json" ] && [ -d "ios" ]; then
        PROJECT_DIR="$(pwd)"
        PROJECT_NAME=$(basename "$PROJECT_DIR")
        echo -e "${BLUE}📁 Auto-detected project: $PROJECT_NAME${NC}"
    else
        echo -e "${RED}❌ No React Native project found. Please run from project directory or specify path.${NC}"
        exit 1
    fi
fi

echo ""

# Check for required files
echo -e "${YELLOW}🔍 Checking Project Structure...${NC}"

if [ ! -f "$PROJECT_DIR/package.json" ]; then
    echo -e "${RED}❌ package.json not found${NC}"
    exit 1
fi

if [ ! -d "$PROJECT_DIR/ios" ]; then
    echo -e "${RED}❌ ios directory not found${NC}"
    exit 1
fi

PROJECT_FILE="$PROJECT_DIR/ios/$PROJECT_NAME.xcodeproj/project.pbxproj"
if [ ! -f "$PROJECT_FILE" ]; then
    echo -e "${RED}❌ Xcode project file not found: $PROJECT_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Project structure valid${NC}"

# Check iOS configuration
echo -e "${YELLOW}📱 Checking iOS Configuration...${NC}"

# Check Bundle Identifier
BUNDLE_ID=$(grep -o 'PRODUCT_BUNDLE_IDENTIFIER = [^;]*' "$PROJECT_FILE" | head -1 | sed 's/PRODUCT_BUNDLE_IDENTIFIER = //')
if [ -z "$BUNDLE_ID" ]; then
    echo -e "${RED}❌ Bundle Identifier not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Bundle Identifier: $BUNDLE_ID${NC}"

# Check Team ID
if grep -q "DEVELOPMENT_TEAM" "$PROJECT_FILE"; then
    TEAM_ID=$(grep -o 'DEVELOPMENT_TEAM = [^;]*' "$PROJECT_FILE" | head -1 | sed 's/DEVELOPMENT_TEAM = //' | sed 's/;//')
    if [ -n "$TEAM_ID" ] && [ "$TEAM_ID" != '""' ]; then
        echo -e "${GREEN}✅ Development Team: $TEAM_ID${NC}"
    else
        echo -e "${YELLOW}⚠️  Development Team not set (will require manual configuration in Xcode)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Development Team not configured (will require manual configuration in Xcode)${NC}"
fi

# Check for CocoaPods
echo -e "${YELLOW}🏗️ Checking CocoaPods...${NC}"
if [ ! -f "$PROJECT_DIR/ios/Podfile" ]; then
    echo -e "${RED}❌ Podfile not found${NC}"
    exit 1
fi

if [ ! -d "$PROJECT_DIR/ios/Pods" ]; then
    echo -e "${YELLOW}⚠️  Pods not installed. Running 'pod install'...${NC}"
    cd "$PROJECT_DIR/ios"
    if command -v pod >/dev/null 2>&1; then
        pod install
        echo -e "${GREEN}✅ Pods installed${NC}"
    else
        echo -e "${RED}❌ CocoaPods not installed. Install with: sudo gem install cocoapods${NC}"
        exit 1
    fi
    cd "$PROJECT_DIR"
else
    echo -e "${GREEN}✅ Pods installed${NC}"
fi

# Check workspace file
WORKSPACE_FILE="$PROJECT_DIR/ios/$PROJECT_NAME.xcworkspace"
if [ ! -d "$WORKSPACE_FILE" ]; then
    echo -e "${RED}❌ Xcode workspace not found: $WORKSPACE_FILE${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Xcode workspace ready${NC}"

# Test Metro availability
echo -e "${YELLOW}📡 Checking Metro Bundler...${NC}"
if curl -s --max-time 2 http://localhost:8081/status >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Metro bundler running${NC}"
else
    echo -e "${YELLOW}⚠️  Metro bundler not running${NC}"
    echo -e "${BLUE}💡 Start Metro with: npm start or ./start-metro.sh${NC}"
fi

# Summary
echo ""
echo -e "${CYAN}📋 Build Readiness Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Project: $PROJECT_NAME${NC}"
echo -e "${GREEN}Bundle ID: $BUNDLE_ID${NC}"
if [ -n "$TEAM_ID" ] && [ "$TEAM_ID" != '""' ]; then
    echo -e "${GREEN}Team ID: $TEAM_ID${NC}"
    echo -e "${GREEN}✅ Ready for iOS build!${NC}"
    echo ""
    echo -e "${BLUE}💡 To build:${NC}"
    echo -e "${BLUE}   npm run ios${NC}"
    echo -e "${BLUE}   # or specific simulator:${NC}"
    echo -e "${BLUE}   npx react-native run-ios --simulator=\"iPhone 15\"${NC}"
else
    echo -e "${YELLOW}Team ID: Not set${NC}"
    echo -e "${YELLOW}⚠️  Manual Xcode configuration required${NC}"
    echo ""
    echo -e "${BLUE}💡 To complete setup:${NC}"
    echo -e "${BLUE}   1. Open: $WORKSPACE_FILE${NC}"
    echo -e "${BLUE}   2. Select project → Target → Signing & Capabilities${NC}"
    echo -e "${BLUE}   3. Set Team and verify Bundle Identifier${NC}"
    echo -e "${BLUE}   4. Then run: npm run ios${NC}"
fi

echo ""
echo -e "${CYAN}🎯 Test Complete${NC}"
