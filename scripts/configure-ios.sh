#!/bin/bash

# iOS Bundle ID and Team Configuration Script
# Purpose: Automate iOS configuration to prevent TestAppB-style build failures
# Usage: ./configure-ios.sh ProjectName BundleID [TeamID]

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_NAME="$1"
BUNDLE_ID="$2"
TEAM_ID="$3"

if [[ -z "$PROJECT_NAME" || -z "$BUNDLE_ID" ]]; then
    echo -e "${RED}❌ Usage: ./configure-ios.sh ProjectName BundleID [TeamID]${NC}"
    echo -e "${YELLOW}Example: ./configure-ios.sh NewSchoolConnect com.yourname.newschoolconnect${NC}"
    echo -e "${YELLOW}Example: ./configure-ios.sh NewSchoolConnect com.yourname.newschoolconnect ABC1234DEF${NC}"
    exit 1
fi

echo -e "${BLUE}🔧 Configuring iOS Bundle ID and Team for $PROJECT_NAME${NC}"

# Validate project exists
PROJECT_FILE="ios/$PROJECT_NAME.xcodeproj/project.pbxproj"
if [[ ! -f "$PROJECT_FILE" ]]; then
    echo -e "${RED}❌ Error: Project file not found at $PROJECT_FILE${NC}"
    echo -e "${YELLOW}Make sure you're running this from the project root directory${NC}"
    exit 1
fi

# Backup original file
cp "$PROJECT_FILE" "$PROJECT_FILE.backup"
echo -e "${GREEN}✅ Created backup: $PROJECT_FILE.backup${NC}"

# Update Bundle Identifier
echo -e "${YELLOW}📱 Setting Bundle Identifier to: $BUNDLE_ID${NC}"
sed -i '' "s/PRODUCT_BUNDLE_IDENTIFIER = .*/PRODUCT_BUNDLE_IDENTIFIER = $BUNDLE_ID;/g" "$PROJECT_FILE"

# Update Team ID if provided
if [[ ! -z "$TEAM_ID" ]]; then
    echo -e "${YELLOW}👥 Setting Development Team to: $TEAM_ID${NC}"
    sed -i '' "s/DEVELOPMENT_TEAM = .*/DEVELOPMENT_TEAM = $TEAM_ID;/g" "$PROJECT_FILE"
else
    echo -e "${YELLOW}⚠️  No Team ID provided - you'll need to set this in Xcode or run:${NC}"
    echo -e "${BLUE}   ./configure-ios.sh $PROJECT_NAME $BUNDLE_ID YOUR_TEAM_ID${NC}"
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
echo -e "${BLUE}Bundle ID: $BUNDLE_ID${NC}"
if [[ ! -z "$TEAM_ID" ]]; then
    echo -e "${BLUE}Team ID: $TEAM_ID${NC}"
    echo -e "${GREEN}✅ Ready to build! Run: npm run ios${NC}"
else
    echo -e "${YELLOW}⚠️  Still need to set Team ID in Xcode or via CLI${NC}"
fi

echo ""
echo -e "${YELLOW}💡 To find your Team ID:${NC}"
echo -e "${BLUE}   1. Open Xcode → Preferences → Accounts${NC}"
echo -e "${BLUE}   2. Select your Apple ID → View Details${NC}"
echo -e "${BLUE}   3. Copy the Team ID (e.g., ABC1234DEF)${NC}"
echo -e "${BLUE}   4. Run: ./configure-ios.sh $PROJECT_NAME $BUNDLE_ID YOUR_TEAM_ID${NC}"
