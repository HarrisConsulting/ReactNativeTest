#!/bin/bash

# iOS Bundle ID and Team Configuration Script
# Purpose: Interactive iOS configuration to prevent TestAppB-style build failures
# Usage: ./configure-ios.sh [ProjectName]

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Auto-detect project name from directory structure
AUTO_PROJECT_NAME=""
if [[ -d "ios" ]]; then
    # Look for main project (not Pods)
    AUTO_PROJECT_NAME=$(find ios -maxdepth 1 -name "*.xcodeproj" -not -name "Pods.xcodeproj" -type d | head -1 | xargs basename | sed 's/\.xcodeproj$//')
fi

# Use provided project name or auto-detected name
PROJECT_NAME="${1:-$AUTO_PROJECT_NAME}"

if [[ -z "$PROJECT_NAME" ]]; then
    echo -e "${RED}❌ Error: Could not detect project name${NC}"
    echo -e "${YELLOW}Make sure you're in a React Native project directory with an ios/ folder${NC}"
    echo -e "${YELLOW}Or run: ./configure-ios.sh YourProjectName${NC}"
    exit 1
fi

echo -e "${CYAN}🔧 iOS Configuration Setup for $PROJECT_NAME${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""

# Validate project exists
PROJECT_FILE="ios/$PROJECT_NAME.xcodeproj/project.pbxproj"
if [[ ! -f "$PROJECT_FILE" ]]; then
    echo -e "${RED}❌ Error: Project file not found at $PROJECT_FILE${NC}"
    echo -e "${YELLOW}Make sure you're running this from the project root directory${NC}"
    exit 1
fi

# Interactive Bundle ID input
echo -e "${CYAN}📱 Bundle Identifier Setup${NC}"
echo -e "${YELLOW}A Bundle ID uniquely identifies your app (e.g., com.yourname.projectname)${NC}"
SUGGESTED_BUNDLE=$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]')
echo -e "${BLUE}💡 Suggested format: com.yourname.${SUGGESTED_BUNDLE}${NC}"
echo ""
echo -n -e "${CYAN}Enter Bundle ID: ${NC}"
read BUNDLE_ID

if [[ -z "$BUNDLE_ID" ]]; then
    echo -e "${RED}❌ Bundle ID cannot be empty${NC}"
    exit 1
fi

echo ""

# Interactive Team ID input
echo -e "${CYAN}👥 Development Team Setup${NC}"
echo -e "${YELLOW}Your Team ID is required for code signing (10-character alphanumeric)${NC}"
echo ""
echo -e "${BLUE}💡 To find your Team ID:${NC}"
echo -e "${BLUE}   1. Open Xcode → Settings → Accounts${NC}"
echo -e "${BLUE}   2. Select your Apple ID → View Details${NC}"
echo -e "${BLUE}   3. Copy the Team ID (e.g., ABC1234DEF)${NC}"
echo ""
echo -n -e "${CYAN}Enter Team ID (or press Enter to skip): ${NC}"
read TEAM_ID

echo ""
echo -e "${BLUE}🔧 Starting Configuration...${NC}"

# Backup original file
cp "$PROJECT_FILE" "$PROJECT_FILE.backup"
echo -e "${GREEN}✅ Created backup: $PROJECT_FILE.backup${NC}"

# Update Bundle Identifier
echo -e "${YELLOW}📱 Setting Bundle Identifier to: $BUNDLE_ID${NC}"
sed -i '' "s/PRODUCT_BUNDLE_IDENTIFIER = .*/PRODUCT_BUNDLE_IDENTIFIER = $BUNDLE_ID;/g" "$PROJECT_FILE"

# Update Team ID if provided
if [[ ! -z "$TEAM_ID" ]]; then
    echo -e "${YELLOW}👥 Setting Development Team to: $TEAM_ID${NC}"
    # Check if DEVELOPMENT_TEAM already exists
    if grep -q "DEVELOPMENT_TEAM" "$PROJECT_FILE"; then
        sed -i '' "s/DEVELOPMENT_TEAM = .*/DEVELOPMENT_TEAM = $TEAM_ID;/g" "$PROJECT_FILE"
    else
        # Add DEVELOPMENT_TEAM after PRODUCT_BUNDLE_IDENTIFIER
        sed -i '' "s/\(PRODUCT_BUNDLE_IDENTIFIER = [^;]*;\)/\1\n\t\t\t\tDEVELOPMENT_TEAM = $TEAM_ID;/" "$PROJECT_FILE"
    fi
else
    echo -e "${YELLOW}⚠️  Team ID skipped - you can set this later in Xcode${NC}"
fi

# Validate changes
echo -e "${BLUE}🔍 Validating configuration...${NC}"
BUNDLE_COUNT=$(grep -c "PRODUCT_BUNDLE_IDENTIFIER = $BUNDLE_ID;" "$PROJECT_FILE")
if [[ $BUNDLE_COUNT -eq 2 ]]; then
    echo -e "${GREEN}✅ Bundle Identifier updated successfully (2 configurations)${NC}"
else
    echo -e "${RED}❌ Warning: Bundle Identifier update may be incomplete${NC}"
fi

if [[ ! -z "$TEAM_ID" ]]; then
    TEAM_COUNT=$(grep -c "DEVELOPMENT_TEAM = $TEAM_ID;" "$PROJECT_FILE")
    if [[ $TEAM_COUNT -eq 2 ]]; then
        echo -e "${GREEN}✅ Development Team updated successfully (2 configurations)${NC}"
    else
        echo -e "${RED}❌ Warning: Development Team update may be incomplete${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🎉 iOS Configuration Complete!${NC}"
echo -e "${CYAN}===============================================${NC}"
echo -e "${BLUE}📱 Bundle ID: $BUNDLE_ID${NC}"
if [[ ! -z "$TEAM_ID" ]]; then
    echo -e "${BLUE}👥 Team ID: $TEAM_ID${NC}"
    echo ""
    echo -e "${GREEN}✅ Ready to build!${NC}"
    echo ""
    echo -e "${CYAN}💡 Recommended - Simulator Build (Fast & Reliable):${NC}"
    echo -e "${BLUE}   npx react-native run-ios --simulator=\"iPhone 16 Plus\"${NC}"
    echo ""
    echo -e "${CYAN}💡 Physical Device Build:${NC}"
    echo -e "${BLUE}   npm run ios${NC}"
else
    echo -e "${YELLOW}👥 Team ID: Not set (can be added later)${NC}"
    echo ""
    echo -e "${GREEN}✅ Ready for Simulator Build (No Team ID Required):${NC}"
    echo -e "${BLUE}   npx react-native run-ios --simulator=\"iPhone 16 Plus\"${NC}"
    echo ""
    echo -e "${YELLOW}📋 For Physical Device (Requires Team ID):${NC}"
    echo -e "${BLUE}   1. Run this script again to add Team ID${NC}"
    echo -e "${BLUE}   2. Or set Team ID manually in Xcode${NC}"
    echo -e "${BLUE}   3. Then run: npm run ios${NC}"
fi

echo ""
echo -e "${CYAN}💡 Need your Team ID? Here's how to find it:${NC}"
echo -e "${BLUE}   1. Open Xcode → Settings → Accounts${NC}"
echo -e "${BLUE}   2. Select your Apple ID → View Details${NC}"
echo -e "${BLUE}   3. Copy the 10-character Team ID (e.g., ABC1234DEF)${NC}"
echo -e "${BLUE}   4. Run this script again and enter it when prompted${NC}"
