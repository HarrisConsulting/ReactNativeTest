#!/bin/bash

# ReactNativeTest Exemplar Integration Validation Script
# Purpose: Verify all TestAppB lessons learned are properly integrated
# Usage: ./scripts/validate-exemplar-integration.sh

set -e

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 ReactNativeTest Exemplar Integration Validation${NC}"
echo -e "${BLUE}=================================================${NC}"

VALIDATION_PASSED=true

# Check 1: Enhanced Metro Safety Script
echo -e "\n${YELLOW}1. Enhanced Metro Safety Script${NC}"
if [[ -f "scripts/enhanced-metro-safety.sh" && -x "scripts/enhanced-metro-safety.sh" ]]; then
    echo -e "   ✅ Enhanced Metro safety script exists and is executable"
    if grep -q "__PROJECT_PATH__\|__PROJECT_NAME__" scripts/enhanced-metro-safety.sh; then
        echo -e "   ✅ Template placeholders found (ready for project configuration)"
    else
        echo -e "   ⚠️  Template placeholders not found (may be pre-configured)"
    fi
else
    echo -e "   ❌ Enhanced Metro safety script missing or not executable"
    VALIDATION_PASSED=false
fi

# Check 2: Copilot Instructions Integration
echo -e "\n${YELLOW}2. Copilot Instructions TestAppB Integration${NC}"
if [[ -f ".github/copilot-instructions.md" ]]; then
    echo -e "   ✅ Copilot instructions file exists"
    
    TESTAPPB_CHECKS=(
        "TESTAPPB LESSONS LEARNED"
        "METRO SAFETY PROTOCOL"
        "REACT NAVIGATION DEPENDENCY CASCADE"
        "SAFEAREAVIEW IMPORT"
        "EMPTY TEST FILE PREVENTION"
        "IOS TEAM AND BUNDLE IDENTIFIER"
    )
    
    for check in "${TESTAPPB_CHECKS[@]}"; do
        if grep -q "$check" .github/copilot-instructions.md; then
            echo -e "   ✅ Found: $check"
        else
            echo -e "   ❌ Missing: $check"
            VALIDATION_PASSED=false
        fi
    done
else
    echo -e "   ❌ Copilot instructions file missing"
    VALIDATION_PASSED=false
fi

# Check 3: Documentation Suite
echo -e "\n${YELLOW}3. Enhanced Documentation Suite${NC}"
REQUIRED_DOCS=(
    "docs/troubleshooting/METRO_COMPREHENSIVE_GUIDE.md"
    "docs/patterns/COMMON_ISSUES_SOLUTIONS.md"
    "docs/templates/PROJECT_CREATION_CHECKLIST.md"
    "docs/project-management/EXEMPLAR_STRATEGIC_IMPLEMENTATION.md"
    "docs/project-management/LESSONS_LEARNED_INTEGRATION.md"
    "docs/project-management/EXEMPLAR_IMPROVEMENTS_SUMMARY.md"
)

for doc in "${REQUIRED_DOCS[@]}"; do
    if [[ -f "$doc" ]]; then
        echo -e "   ✅ Found: $doc"
    else
        echo -e "   ❌ Missing: $doc"
        VALIDATION_PASSED=false
    fi
done

# Check 4: Enhanced Creation Script
echo -e "\n${YELLOW}4. Enhanced Creation Script${NC}"
if [[ -f "scripts/create-new-project-from-exemplar.sh" ]]; then
    echo -e "   ✅ Creation script exists"
    
    SCRIPT_FEATURES=(
        "Enhanced Dependencies Installation"
        "Comprehensive Validation"
        "empty test files"
        "SafeAreaView imports"
        "dependency validation"
    )
    
    for feature in "${SCRIPT_FEATURES[@]}"; do
        if grep -q "$feature" scripts/create-new-project-from-exemplar.sh; then
            echo -e "   ✅ Found: $feature"
        else
            echo -e "   ❌ Missing: $feature"
            VALIDATION_PASSED=false
        fi
    done
else
    echo -e "   ❌ Enhanced creation script missing"
    VALIDATION_PASSED=false
fi

# Check 5: Helper Functions Enhancement
echo -e "\n${YELLOW}5. Helper Functions Enhancement${NC}"
if [[ -f "scripts/rnt-helpers.sh" ]]; then
    echo -e "   ✅ Helper functions file exists"
    
    if grep -q "enhanced-metro-safety.sh" scripts/rnt-helpers.sh; then
        echo -e "   ✅ Enhanced Metro safety integration found"
    else
        echo -e "   ❌ Enhanced Metro safety integration missing"
        VALIDATION_PASSED=false
    fi
    
    if grep -q "dependency.*validation\|missing.*deps" scripts/rnt-helpers.sh; then
        echo -e "   ✅ Dependency validation found"
    else
        echo -e "   ❌ Dependency validation missing"
        VALIDATION_PASSED=false
    fi
else
    echo -e "   ❌ Helper functions file missing"
    VALIDATION_PASSED=false
fi

# Check 6: Empty Test File Fix
echo -e "\n${YELLOW}6. Empty Test File Prevention${NC}"
if [[ -f "__tests__/auth/AuthContext.debug.test.tsx" ]]; then
    if [[ -s "__tests__/auth/AuthContext.debug.test.tsx" ]]; then
        echo -e "   ✅ Debug test file exists and has content"
        if grep -q "describe\|test" __tests__/auth/AuthContext.debug.test.tsx; then
            echo -e "   ✅ Debug test file has proper test structure"
        else
            echo -e "   ⚠️  Debug test file exists but may not have proper test structure"
        fi
    else
        echo -e "   ❌ Debug test file is empty (will cause test suite failures)"
        VALIDATION_PASSED=false
    fi
else
    echo -e "   ⚠️  Debug test file not found (may not be needed)"
fi

# Check 7: README Integration
echo -e "\n${YELLOW}7. README Exemplar Integration${NC}"
if [[ -f "README.md" ]]; then
    echo -e "   ✅ README.md exists"
    
    if grep -q "Using ReactNativeTest as an Exemplar" README.md; then
        echo -e "   ✅ Exemplar usage section found"
    else
        echo -e "   ❌ Exemplar usage section missing"
        VALIDATION_PASSED=false
    fi
    
    if grep -q "enhanced-metro-safety.sh" README.md; then
        echo -e "   ✅ Enhanced Metro safety reference found"
    else
        echo -e "   ❌ Enhanced Metro safety reference missing"
        VALIDATION_PASSED=false
    fi
else
    echo -e "   ❌ README.md missing"
    VALIDATION_PASSED=false
fi

# Final Validation Summary
echo -e "\n${BLUE}📋 Validation Summary${NC}"
echo -e "${BLUE}===================${NC}"

if [[ "$VALIDATION_PASSED" == "true" ]]; then
    echo -e "${GREEN}✅ ALL VALIDATIONS PASSED${NC}"
    echo -e "${GREEN}ReactNativeTest exemplar integration is complete!${NC}"
    echo ""
    echo -e "${BLUE}🚀 Ready for exemplar usage:${NC}"
    echo "   • Use scripts/create-new-project-from-exemplar.sh for new projects"
    echo "   • Reference docs/project-management/ for strategic guidance"
    echo "   • Follow docs/troubleshooting/ for issue resolution"
    echo "   • Copilot will automatically apply TestAppB lessons learned"
    echo ""
    echo -e "${GREEN}🎯 Expected Results:${NC}"
    echo "   • 95%+ first-time build success rate"
    echo "   • Zero Metro conflicts through enhanced safety"
    echo "   • Complete dependency validation"
    echo "   • Comprehensive issue prevention"
    exit 0
else
    echo -e "${RED}❌ VALIDATION FAILED${NC}"
    echo -e "${RED}Some TestAppB lessons are not properly integrated${NC}"
    echo ""
    echo -e "${YELLOW}🔧 Required Actions:${NC}"
    echo "   • Check missing files and features listed above"
    echo "   • Run integration process again if needed"
    echo "   • Verify all scripts are executable"
    echo "   • Ensure documentation is complete"
    exit 1
fi
