#!/usr/bin/env node

/**
 * PROFESSIONAL CLOUD BUILD SETUP
 * This is how Netflix, Spotify, Discord, and other big companies handle cross-platform builds
 * Using GitHub Actions, Docker, and Cloud Services
 */

const fs = require('fs');
const path = require('path');

console.log('☁️  SETTING UP PROFESSIONAL CLOUD BUILD SYSTEM');
console.log('==============================================');

// Create GitHub Actions workflow for cloud building
const githubWorkflow = `
name: Professional Cloud Build

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:
    inputs:
      build_type:
        description: 'Build Type'
        required: true
        default: 'all'
        type: choice
        options:
          - all
          - windows
          - mac
          - linux

jobs:
  build-windows:
    runs-on: windows-latest
    if: github.event.inputs.build_type == 'windows' || github.event.inputs.build_type == 'all' || startsWith(github.ref, 'refs/tags/')
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install Dependencies
        run: |
          npm ci --force
          
      - name: Generate Prisma Client for Windows
        run: |
          npx prisma generate --schema=./prisma/schema.prisma
          
      - name: Build Electron App
        env:
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          npm run build:win:all
          
      - name: Upload Windows Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: windows-builds
          path: |
            release/*/*.exe
            release/*/*.msi
            release/*/*.appx

  build-mac:
    runs-on: macos-latest
    if: github.event.inputs.build_type == 'mac' || github.event.inputs.build_type == 'all' || startsWith(github.ref, 'refs/tags/')
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install Dependencies
        run: |
          npm ci --force
          
      - name: Generate Prisma Client for macOS
        run: |
          npx prisma generate --schema=./prisma/schema.prisma
          
      - name: Build Electron App
        env:
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          CSC_LINK: \${{ secrets.MAC_CERTS }}
          CSC_KEY_PASSWORD: \${{ secrets.MAC_CERTS_PASSWORD }}
        run: |
          npm run build:mac
          
      - name: Upload macOS Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: mac-builds
          path: |
            release/*/*.dmg
            release/*/*.zip
            release/*/*.pkg

  release:
    needs: [build-windows, build-mac]
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/')
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Download all artifacts
        uses: actions/download-artifact@v4
        
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            windows-builds/**/*.exe
            mac-builds/**/*.dmg
          generate_release_notes: true
          draft: false
          prerelease: false
`;

// Create Docker configuration for consistent builds
const dockerfile = `
FROM electronuserland/builder:wine

# Install Node.js and dependencies
RUN apt-get update && apt-get install -y \\
    nodejs \\
    npm \\
    git \\
    python3 \\
    make \\
    g++ \\
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --force

# Generate Prisma Client for all platforms
RUN npx prisma generate

# Copy application source
COPY . .

# Build for Windows
RUN npm run build:win:all

# The built files will be in /app/release/
`;

// Create Docker Compose for local cloud-like builds
const dockerCompose = `
version: '3.8'

services:
  builder-windows:
    build:
      context: .
      dockerfile: Dockerfile.build
    volumes:
      - ./release:/app/release
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - ELECTRON_CACHE=/root/.cache/electron
      - ELECTRON_BUILDER_CACHE=/root/.cache/electron-builder
    command: npm run build:win:all

  builder-mac:
    image: electronuserland/builder:latest
    volumes:
      - .:/project
      - ./release:/project/release
    working_dir: /project
    command: npm run build:mac
`;

// Create Vercel/Netlify configuration for web deployment
const vercelConfig = `{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url",
    "NODE_ENV": "production"
  }
}`;

// Create build script that uses cloud services
const cloudBuildScript = `
#!/bin/bash

# Professional Cloud Build Script
# Uses multiple cloud services for redundancy

echo "🚀 Starting Professional Cloud Build"
echo "===================================="

# Option 1: GitHub Actions (Recommended)
setup_github_actions() {
    echo "📦 Setting up GitHub Actions..."
    
    # Create .github/workflows directory
    mkdir -p .github/workflows
    
    # Copy workflow file
    cp cloud-build.yml .github/workflows/
    
    echo "✅ GitHub Actions configured!"
    echo "Push your code to GitHub and tag it with 'v1.0.0' to trigger build"
}

# Option 2: Docker Build (Local Cloud Simulation)
docker_build() {
    echo "🐳 Building with Docker..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker not installed. Please install Docker Desktop"
        exit 1
    fi
    
    # Build using Docker
    docker build -f Dockerfile.build -t thaziri-builder .
    
    # Run the build
    docker run -v \$(pwd)/release:/app/release thaziri-builder
    
    echo "✅ Docker build complete!"
}

# Option 3: CircleCI Build
setup_circleci() {
    echo "⭕ Setting up CircleCI..."
    
    cat > .circleci/config.yml << 'EOF'
version: 2.1

orbs:
  node: circleci/node@5.0.2
  win: circleci/windows@5.0

jobs:
  build-windows:
    executor: win/default
    steps:
      - checkout
      - node/install:
          node-version: '18.0.0'
      - run:
          name: Install dependencies
          command: npm ci --force
      - run:
          name: Generate Prisma
          command: npx prisma generate
      - run:
          name: Build Windows
          command: npm run build:win:all
      - store_artifacts:
          path: release

workflows:
  build:
    jobs:
      - build-windows
EOF
    
    echo "✅ CircleCI configured!"
}

# Option 4: Azure DevOps Pipeline
setup_azure() {
    echo "☁️ Setting up Azure DevOps..."
    
    cat > azure-pipelines.yml << 'EOF'
trigger:
- main

pool:
  vmImage: 'windows-latest'

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '18.x'
  displayName: 'Install Node.js'

- script: |
    npm ci --force
    npx prisma generate
  displayName: 'Install dependencies'

- script: |
    npm run build:win:all
  displayName: 'Build Windows App'

- task: PublishBuildArtifacts@1
  inputs:
    pathToPublish: 'release'
    artifactName: 'windows-builds'
EOF
    
    echo "✅ Azure DevOps configured!"
}

# Select build method
echo ""
echo "Select your cloud build method:"
echo "1) GitHub Actions (Recommended)"
echo "2) Docker (Local Cloud)"
echo "3) CircleCI"
echo "4) Azure DevOps"
echo "5) All of the above"

read -p "Enter choice [1-5]: " choice

case $choice in
    1) setup_github_actions ;;
    2) docker_build ;;
    3) setup_circleci ;;
    4) setup_azure ;;
    5) 
        setup_github_actions
        docker_build
        setup_circleci
        setup_azure
        ;;
    *) echo "Invalid choice" ;;
esac

echo ""
echo "🎉 Cloud Build Setup Complete!"
echo "Your app is now ready for professional cloud building!"
`;

// Write all configuration files
const configDir = path.join(__dirname, '..', '.cloud-build');
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

// Write GitHub Actions workflow
fs.writeFileSync(path.join(configDir, 'github-workflow.yml'), githubWorkflow.trim());
console.log('✅ Created GitHub Actions workflow');

// Write Dockerfile
fs.writeFileSync(path.join(configDir, 'Dockerfile.build'), dockerfile.trim());
console.log('✅ Created Docker build configuration');

// Write Docker Compose
fs.writeFileSync(path.join(configDir, 'docker-compose.yml'), dockerCompose.trim());
console.log('✅ Created Docker Compose configuration');

// Write Vercel config
fs.writeFileSync(path.join(configDir, 'vercel.json'), vercelConfig.trim());
console.log('✅ Created Vercel configuration');

// Write cloud build script
fs.writeFileSync(path.join(configDir, 'cloud-build.sh'), cloudBuildScript.trim());
fs.chmodSync(path.join(configDir, 'cloud-build.sh'), '755');
console.log('✅ Created cloud build script');

console.log('\n🎉 PROFESSIONAL CLOUD BUILD SETUP COMPLETE!');
console.log('===========================================');
console.log('\n📦 Available Cloud Build Options:');
console.log('');
console.log('1️⃣ GitHub Actions (RECOMMENDED):');
console.log('   - Copy .cloud-build/github-workflow.yml to .github/workflows/build.yml');
console.log('   - Push to GitHub and create a tag like v1.0.0');
console.log('   - Build runs automatically in the cloud!');
console.log('');
console.log('2️⃣ Docker Build (Local Cloud):');
console.log('   - Install Docker Desktop');
console.log('   - Run: docker build -f .cloud-build/Dockerfile.build -t thaziri .');
console.log('   - Consistent builds across all platforms');
console.log('');
console.log('3️⃣ Quick Start:');
console.log('   - Run: .cloud-build/cloud-build.sh');
console.log('   - Follow the interactive menu');
console.log('');
console.log('This is how the professionals do it! 🚀');
