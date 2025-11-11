#!/bin/bash

# Wing Browser Package Script
# Creates distribution packages for all platforms

set -e

echo " Wing Browser Package Script"
echo "================================"

# Build for all platforms
echo "Building for Windows..."
npm run build:win

echo "Building for Linux..."
npm run build:linux

echo "Building for macOS..."
npm run build:mac

echo "✓ All packages created successfully!"
echo "Check the ./release directory for installers"

# List created files
echo ""
echo "Created packages:"
ls -lh release/
