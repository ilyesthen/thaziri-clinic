#!/bin/bash

# INSTANT DEPLOYMENT SCRIPT
# Just run this and paste your token when asked

echo "🚀 DEPLOYING TO GITHUB IN 3... 2... 1..."
echo "========================================="
echo ""

# Set up Git user
git config user.name "ilyesmoussaoui"
git config user.email "ilyes@thaziri.com"

# Add remote
git remote remove origin 2>/dev/null || true
git remote add origin https://ilyesmoussaoui:YOUR_TOKEN@github.com/ilyesmoussaoui/thaziri-clinic.git

# Push
echo "📤 Pushing to GitHub..."
git branch -M main
git push -u origin main --force

# Tag for release
VERSION="v1.0.$(date +%s)"
git tag $VERSION
git push origin $VERSION --force

echo ""
echo "✅✅✅ SUCCESS! ✅✅✅"
echo ""
echo "Your Windows installer is building NOW!"
echo ""
echo "👉 Check: https://github.com/ilyesmoussaoui/thaziri-clinic/actions"
echo "👉 Wait: 10-15 minutes"
echo "👉 Download: Click the build and get your .exe file!"
echo ""
echo "🎉 DONE!"
