#!/bin/bash

# GITHUB AUTOMATED SETUP SCRIPT
# Run this to set up everything automatically

echo "🚀 SETTING UP GITHUB FOR AUTOMATED BUILDS"
echo "=========================================="
echo ""

# Initialize git if needed
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - Thaziri Clinic Management System"
fi

# Create GitHub Actions workflow directory
echo "📁 Creating GitHub Actions workflow..."
mkdir -p .github/workflows

# Create the workflow file
cat > .github/workflows/build-windows.yml << 'EOF'
name: Build Windows Installers

on:
  push:
    branches: [ main ]
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  build-windows:
    runs-on: windows-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          npm ci --force
          npm install -g node-gyp
      
      - name: Generate Prisma Client
        run: |
          npx prisma generate --schema=./prisma/schema.prisma
      
      - name: Copy Prisma binaries
        run: |
          xcopy /E /I node_modules\.prisma node_modules\@prisma\client\.prisma
      
      - name: Build Electron App
        run: |
          npm run build:win:all
        env:
          CI: false
      
      - name: Upload Windows x64 Installer
        uses: actions/upload-artifact@v3
        with:
          name: windows-x64-installer
          path: release/**/Thaziri-Setup-*-x64.exe
      
      - name: Upload Windows x32 Installer
        uses: actions/upload-artifact@v3
        with:
          name: windows-ia32-installer
          path: release/**/Thaziri-Setup-*-ia32.exe
      
      - name: Upload Universal Installer
        uses: actions/upload-artifact@v3
        with:
          name: windows-universal-installer
          path: release/**/Thaziri-Setup-*.exe
          
      - name: Create Release
        if: startsWith(github.ref, 'refs/tags/')
        uses: softprops/action-gh-release@v1
        with:
          files: |
            release/**/Thaziri-Setup-*.exe
          generate_release_notes: true
          draft: false
          prerelease: false
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
EOF

echo "✅ GitHub Actions workflow created!"
echo ""

# Add remote repository
echo "🔗 Setting up GitHub remote..."
echo "Enter your GitHub username (ilyesmoussaoui):"
read -r username
username=${username:-ilyesmoussaoui}

echo "Enter repository name (e.g., thaziri-clinic):"
read -r reponame
reponame=${reponame:-thaziri-clinic}

# Set remote
git remote remove origin 2>/dev/null
git remote add origin "https://github.com/$username/$reponame.git"

echo ""
echo "✅ Remote repository configured!"
echo ""
echo "📝 NEXT STEPS:"
echo "=============="
echo ""
echo "1. Create repository on GitHub:"
echo "   👉 Go to: https://github.com/new"
echo "   👉 Name: $reponame"
echo "   👉 Make it Private or Public"
echo "   👉 DON'T initialize with README"
echo ""
echo "2. Push your code:"
echo "   git add ."
echo "   git commit -m 'Production ready build with GitHub Actions'"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Trigger a build:"
echo "   git tag v1.0.0"
echo "   git push origin v1.0.0"
echo ""
echo "4. Download your installer:"
echo "   👉 Go to: https://github.com/$username/$reponame/actions"
echo "   👉 Click on the latest build"
echo "   👉 Download artifacts at the bottom"
echo ""
echo "🎉 That's it! Your Windows installer will be built automatically!"
