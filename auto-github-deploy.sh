#!/bin/bash

# AUTOMATIC GITHUB DEPLOYMENT SCRIPT
# This does EVERYTHING for you!

set -e

echo "🚀 AUTOMATIC GITHUB DEPLOYMENT"
echo "=============================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git..."
    git init
fi

# Configure git user if needed
if ! git config user.name > /dev/null 2>&1; then
    echo "Setting up Git user..."
    git config user.name "ilyesmoussaoui"
    git config user.email "ilyesmoussaoui@github.com"
fi

# Add all files
echo "📁 Preparing files for upload..."
git add -A
git commit -m "Production build - $(date '+%Y-%m-%d %H:%M')" || true

# Set up remote
echo ""
echo "🔗 Setting up GitHub connection..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/ilyesmoussaoui/thaziri-clinic.git

# Create main branch
git branch -M main

echo ""
echo "📤 Pushing to GitHub..."
echo "When prompted for username, enter: ilyesmoussaoui"
echo "When prompted for password, create a new token at:"
echo "👉 https://github.com/settings/tokens/new"
echo "   - Select 'repo' scope"
echo "   - Click 'Generate token'"
echo "   - Use the token as your password"
echo ""
echo "Press Enter to continue..."
read

# Push to GitHub
git push -u origin main --force

echo ""
echo "🏷️ Creating release tag..."
VERSION="v1.0.$(date +%s)"
git tag $VERSION
git push origin $VERSION

echo ""
echo "✅ SUCCESS! Your build is starting on GitHub!"
echo ""
echo "📦 YOUR WINDOWS INSTALLER WILL BE READY IN 10-15 MINUTES"
echo ""
echo "👉 Check build status: https://github.com/ilyesmoussaoui/thaziri-clinic/actions"
echo "👉 Download installer: https://github.com/ilyesmoussaoui/thaziri-clinic/releases"
echo ""
echo "🎉 That's it! GitHub is building your Windows app right now!"
