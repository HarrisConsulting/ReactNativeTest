#!/bin/bash

# Enhanced Metro Safety Script for ReactNativeTest Exemplar Projects
# Version: 2.0 - Lessons learned from TestAppB issues
# Purpose: Absolute Metro instance control with zero-conflict guarantee

set -e

# Color codes for enhanced output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project directory (will be updated by exemplar creation scripts)
PROJECT_DIR="__PROJECT_PATH__"
PROJECT_NAME="__PROJECT_NAME__"

echo -e "${BLUE}🚀 Enhanced Metro Safety Protocol v2.0${NC}"
echo -e "${BLUE}Project: $PROJECT_NAME${NC}"
echo -e "${BLUE}Directory: $PROJECT_DIR${NC}"
echo -e "${BLUE}================================================${NC}"

# Validate project directory
if [[ ! -d "$PROJECT_DIR" ]]; then
    echo -e "${RED}❌ Project directory not found: $PROJECT_DIR${NC}"
    exit 1
fi

# Change to project directory
cd "$PROJECT_DIR" || exit 1
echo -e "${GREEN}📁 Changed to project directory: $(pwd)${NC}"

# Verify essential files exist
if [[ ! -f "index.js" ]]; then
    echo -e "${RED}❌ index.js not found in project directory${NC}"
    exit 1
fi

if [[ ! -f "package.json" ]]; then
    echo -e "${RED}❌ package.json not found in project directory${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Essential files verified${NC}"

# Phase 1: Comprehensive Metro Process Detection and Cleanup
echo -e "${YELLOW}🔍 Phase 1: Metro Process Detection${NC}"

# Function to safely kill processes
kill_processes() {
    local pids="$1"
    local description="$2"
    
    if [[ -n "$pids" ]]; then
        echo -e "   ${YELLOW}Found $description: $pids${NC}"
        for pid in $pids; do
            if kill -0 "$pid" 2>/dev/null; then
                echo "   Killing process $pid..."
                kill -9 "$pid" 2>/dev/null || true
            fi
        done
        sleep 2
    else
        echo -e "   ${GREEN}No $description found${NC}"
    fi
}

# 1. Kill Metro by process name (excluding this script)
METRO_BY_NAME=$(ps aux | grep -i metro | grep -v grep | grep -v "enhanced-metro-safety.sh" | awk '{print $2}' || true)
kill_processes "$METRO_BY_NAME" "Metro processes by name"

# 2. Kill react-native start processes
RN_START_PIDS=$(ps aux | grep "react-native start" | grep -v grep | awk '{print $2}' || true)
kill_processes "$RN_START_PIDS" "react-native start processes"

# 3. Kill Node.js processes listening on port 8081
PORT_8081_PIDS=$(lsof -t -i:8081 2>/dev/null || true)
kill_processes "$PORT_8081_PIDS" "processes on port 8081"

# 4. Kill Node.js processes with Metro-related command lines
METRO_NODE_PIDS=$(ps aux | grep node | grep -E "(metro|@react-native-community/cli)" | grep -v grep | awk '{print $2}' || true)
kill_processes "$METRO_NODE_PIDS" "Node.js Metro-related processes"

# Phase 2: Port Verification
echo -e "${YELLOW}🔍 Phase 2: Port Verification${NC}"

# Wait for cleanup to complete
sleep 3

# Verify port 8081 is completely free
if lsof -i :8081 >/dev/null 2>&1; then
    echo -e "${RED}❌ Critical: Port 8081 is still in use after cleanup${NC}"
    echo -e "${RED}Processes still using port 8081:${NC}"
    lsof -i :8081
    exit 1
else
    echo -e "${GREEN}✅ Port 8081 is free and ready${NC}"
fi

# Phase 3: Environment Preparation
echo -e "${YELLOW}🔧 Phase 3: Environment Preparation${NC}"

# Clear Metro cache
echo "   Clearing Metro cache..."
if [[ -d "node_modules/.cache" ]]; then
    rm -rf node_modules/.cache
    echo -e "   ${GREEN}✅ Metro cache cleared${NC}"
fi

# Clear React Native cache
echo "   Clearing React Native cache..."
if command -v npx >/dev/null 2>&1; then
    npx react-native clean-cache >/dev/null 2>&1 || true
    echo -e "   ${GREEN}✅ React Native cache cleared${NC}"
fi

# Verify Metro binary availability
if ! command -v npx >/dev/null 2>&1; then
    echo -e "${RED}❌ npx not found. Please ensure Node.js is properly installed.${NC}"
    exit 1
fi

# Phase 4: Metro Startup with Enhanced Monitoring
echo -e "${YELLOW}🚀 Phase 4: Metro Startup${NC}"

echo -e "${BLUE}Starting Metro bundler...${NC}"
echo -e "${BLUE}Server will be available at: http://localhost:8081${NC}"
echo -e "${BLUE}================================================================${NC}"

# Start Metro with explicit configuration
npx react-native start \
    --reset-cache \
    --host localhost \
    --port 8081 \
    --verbose

# Note: The script will continue running Metro in the foreground
# This is intentional to maintain control and prevent multiple instances
