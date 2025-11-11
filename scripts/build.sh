#!/bin/bash

# Wing Browser Build Script
# This script builds Wing Browser for all platforms

set -e

echo " Wing Browser Build Script"
echo "=============================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "${BLUE}Installing dependencies...${NC}"
    npm install
fi

# Clean previous builds
echo "${BLUE}Cleaning previous builds...${NC}"
rm -rf dist release

# Build TypeScript and Vite
echo "${BLUE}Building application...${NC}"
npm run build

# Determine platform
PLATFORM=$(uname -s)

case "$PLATFORM" in
    Linux*)
        echo "${GREEN}Building for Linux...${NC}"
        npm run build:linux
        ;;
    Darwin*)
        echo "${GREEN}Building for macOS...${NC}"
        npm run build:mac
        ;;
    MINGW*|MSYS*|CYGWIN*)
        echo "${GREEN}Building for Windows...${NC}"
        npm run build:win
        ;;
    *)
        echo "Unknown platform: $PLATFORM"
        echo "Building for current platform..."
        npm run build
        ;;
esac

echo "${GREEN}✓ Build complete!${NC}"
echo "Output directory: ./release"
