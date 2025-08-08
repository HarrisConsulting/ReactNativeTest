#!/bin/bash

# cleanup-ios-setup.sh - Clean up iOS configuration files after successful setup
# Removes setup files that are no longer needed once iOS configuration is complete

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

echo -e "${CYAN}🧹 iOS Setup Cleanup Tool${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Auto-detect project
if [ -f "package.json" ] && [ -d "ios" ]; then
    PROJECT_DIR="$(pwd)"
    PROJECT_NAME=$(basename "$PROJECT_DIR")
    echo -e "${BLUE}📁 Detected project: $PROJECT_NAME${NC}"
else
    echo -e "${RED}❌ No React Native project found in current directory${NC}"
    echo -e "${YELLOW}Please run this script from your React Native project root${NC}"
    exit 1
fi

echo ""

# Identify iOS setup files that can be cleaned up
echo -e "${YELLOW}🔍 Scanning for iOS setup files...${NC}"

SETUP_FILES=()
BACKUP_FILES=()
TEMP_FILES=()

# Check for iOS configuration script
if [ -f "configure-ios.sh" ]; then
    SETUP_FILES+=("configure-ios.sh")
fi

# Check for iOS build test script
if [ -f "test-ios-build.sh" ]; then
    SETUP_FILES+=("test-ios-build.sh")
fi

# Check for Xcode project backup files
if [ -f "ios/$PROJECT_NAME.xcodeproj/project.pbxproj.backup" ]; then
    BACKUP_FILES+=("ios/$PROJECT_NAME.xcodeproj/project.pbxproj.backup")
fi

# Check for additional backup files with timestamps
for backup in ios/$PROJECT_NAME.xcodeproj/project.pbxproj.backup*; do
    if [ -f "$backup" ] && [[ "$backup" != *".backup" ]]; then
        BACKUP_FILES+=("$backup")
    fi
done

# Check for temporary test files
if [ -f "test-supabase-connection.js" ]; then
    TEMP_FILES+=("test-supabase-connection.js")
fi

if [ -f "test-whitelist.js" ]; then
    TEMP_FILES+=("test-whitelist.js")
fi

# Check for debug test files
for debug_test in __tests__/**/*.debug.test.*; do
    if [ -f "$debug_test" ]; then
        TEMP_FILES+=("$debug_test")
    fi
done

# Calculate total files
TOTAL_FILES=$((${#SETUP_FILES[@]} + ${#BACKUP_FILES[@]} + ${#TEMP_FILES[@]}))

if [ $TOTAL_FILES -eq 0 ]; then
    echo -e "${GREEN}✅ No iOS setup files found to clean up${NC}"
    echo -e "${BLUE}Your project appears to be already cleaned up!${NC}"
    exit 0
fi

echo ""
echo -e "${CYAN}📋 Found $TOTAL_FILES iOS setup files that can be cleaned up:${NC}"
echo ""

# Display setup scripts
if [ ${#SETUP_FILES[@]} -gt 0 ]; then
    echo -e "${YELLOW}🔧 iOS Configuration Scripts (${#SETUP_FILES[@]} files):${NC}"
    for file in "${SETUP_FILES[@]}"; do
        echo -e "${BLUE}   • $file${NC} - iOS configuration automation (no longer needed after setup)"
    done
    echo ""
fi

# Display backup files
if [ ${#BACKUP_FILES[@]} -gt 0 ]; then
    echo -e "${YELLOW}💾 Xcode Project Backup Files (${#BACKUP_FILES[@]} files):${NC}"
    for file in "${BACKUP_FILES[@]}"; do
        echo -e "${BLUE}   • $file${NC} - Backup created during configuration"
    done
    echo ""
fi

# Display temporary files
if [ ${#TEMP_FILES[@]} -gt 0 ]; then
    echo -e "${YELLOW}🧪 Temporary Test Files (${#TEMP_FILES[@]} files):${NC}"
    for file in "${TEMP_FILES[@]}"; do
        echo -e "${BLUE}   • $file${NC} - Development/testing file"
    done
    echo ""
fi

# Verification questions
echo -e "${CYAN}🚀 Pre-Cleanup Verification${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Question 1: React Native setup completed successfully
echo -e "${YELLOW}❓ Has your React Native project been set up successfully?${NC}"
echo -e "${BLUE}   This means:${NC}"
echo -e "${BLUE}   • iOS build works (npm run ios or npm run ios-simulator)${NC}"
echo -e "${BLUE}   • Welcome screen displays without errors${NC}"
echo -e "${BLUE}   • Bundle ID and Team ID are properly configured${NC}"
echo -e "${BLUE}   • No iOS configuration issues remain${NC}"
echo ""
echo -n -e "${CYAN}Is React Native setup complete and working? (y/n): ${NC}"
read SETUP_COMPLETE

if [[ ! "$SETUP_COMPLETE" =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${YELLOW}⚠️  Setup not complete - keeping all files for troubleshooting${NC}"
    echo -e "${BLUE}Complete your React Native setup first, then run this script again${NC}"
    echo ""
    echo -e "${CYAN}💡 To complete setup:${NC}"
    echo -e "${BLUE}   1. Run: ./test-ios-build.sh (if available)${NC}"
    echo -e "${BLUE}   2. Fix any issues shown${NC}"
    echo -e "${BLUE}   3. Test: npm run ios-simulator${NC}"
    echo -e "${BLUE}   4. Verify Welcome screen displays correctly${NC}"
    exit 0
fi

echo ""

# Question 2: Confirm file deletion
echo -e "${YELLOW}❓ Do you want to delete the $TOTAL_FILES iOS setup files listed above?${NC}"
echo -e "${BLUE}   These files are no longer needed after successful iOS configuration${NC}"
echo -e "${BLUE}   You can always re-copy them from ReactNativeTest if needed later${NC}"
echo ""
echo -n -e "${CYAN}Delete iOS setup files? (y/n): ${NC}"
read DELETE_CONFIRM

if [[ ! "$DELETE_CONFIRM" =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}✅ Keeping all files - no changes made${NC}"
    echo -e "${YELLOW}💡 You can run this script again anytime to clean up${NC}"
    exit 0
fi

echo ""

# Question 3: Type "delete" to confirm
echo -e "${RED}⚠️  FINAL CONFIRMATION REQUIRED${NC}"
echo -e "${YELLOW}This will permanently delete $TOTAL_FILES files${NC}"
echo -e "${YELLOW}Type 'delete' to confirm file deletion:${NC}"
echo -n -e "${CYAN}Confirmation: ${NC}"
read DELETE_TYPED

if [ "$DELETE_TYPED" != "delete" ]; then
    echo ""
    echo -e "${BLUE}✅ Deletion cancelled - no files removed${NC}"
    echo -e "${YELLOW}💡 To proceed, you must type exactly 'delete'${NC}"
    exit 0
fi

echo ""

# Perform deletion
echo -e "${CYAN}🗑️  Deleting iOS setup files...${NC}"
echo ""

DELETED_COUNT=0

# Delete setup scripts
for file in "${SETUP_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${YELLOW}🔧 Deleting: $file${NC}"
        rm "$file"
        DELETED_COUNT=$((DELETED_COUNT + 1))
    fi
done

# Delete backup files
for file in "${BACKUP_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${YELLOW}💾 Deleting: $file${NC}"
        rm "$file"
        DELETED_COUNT=$((DELETED_COUNT + 1))
    fi
done

# Delete temporary files
for file in "${TEMP_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${YELLOW}🧪 Deleting: $file${NC}"
        rm "$file"
        DELETED_COUNT=$((DELETED_COUNT + 1))
    fi
done

echo ""

# Success summary
echo -e "${GREEN}✅ Cleanup Complete!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}📊 Successfully deleted $DELETED_COUNT iOS setup files${NC}"
echo ""

echo -e "${CYAN}📋 Your project is now cleaned up and ready for development${NC}"
echo ""

echo -e "${BLUE}💡 What's left in your project:${NC}"
echo -e "${BLUE}   • Core React Native files${NC}"
echo -e "${BLUE}   • Configured iOS project (ios/$PROJECT_NAME.xcodeproj/)${NC}"
echo -e "${BLUE}   • Source code and assets${NC}"
echo -e "${BLUE}   • Package dependencies${NC}"
echo ""

echo -e "${YELLOW}🔧 If you need iOS setup tools again:${NC}"
echo -e "${BLUE}   Copy from ReactNativeTest: scripts/configure-ios.sh, scripts/test-ios-build.sh${NC}"
echo ""

echo -e "${CYAN}🎯 Ready for development!${NC}"
echo -e "${BLUE}   npm run ios-simulator     # Test on simulator${NC}"
echo -e "${BLUE}   npm run ios-safe          # Test on device${NC}"

echo ""
echo -e "${CYAN}🧹 Cleanup Complete${NC}"
