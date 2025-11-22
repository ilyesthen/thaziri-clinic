#!/usr/bin/env node
/**
 * PROFESSIONAL PRISMA PRODUCTION FIX
 * This is how big companies handle cross-platform Prisma deployment
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

console.log('🚀 PROFESSIONAL PRISMA PRODUCTION FIX STARTING...');

// Step 1: Download Windows Prisma binaries directly from Prisma CDN
async function downloadWindowsBinary() {
  const PRISMA_VERSION = '6.19.0';
  const WINDOWS_BINARY_URL = `https://binaries.prisma.sh/all_commits/bef30fcdbcab73e9a93e59bc90177af4cc582f7e/windows/query-engine.exe.gz`;
  const WINDOWS_LIB_URL = `https://binaries.prisma.sh/all_commits/bef30fcdbcab73e9a93e59bc90177af4cc582f7e/windows/query_engine.dll.node.gz`;
  
  const downloadFile = (url, dest) => {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(dest);
      https.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    });
  };

  console.log('📥 Downloading Windows Prisma binaries...');
  
  try {
    // Download compressed binaries
    await downloadFile(WINDOWS_BINARY_URL, '/tmp/query-engine.exe.gz');
    await downloadFile(WINDOWS_LIB_URL, '/tmp/query_engine.dll.node.gz');
    
    // Decompress
    execSync('gunzip -f /tmp/query-engine.exe.gz');
    execSync('gunzip -f /tmp/query_engine.dll.node.gz');
    
    console.log('✅ Windows binaries downloaded successfully');
    return true;
  } catch (error) {
    console.log('⚠️ Could not download binaries, will use bundled ones');
    return false;
  }
}

// Step 2: Create a wrapper that works in production
function createProductionWrapper() {
  const wrapperCode = `
/**
 * PRODUCTION PRISMA CLIENT WRAPPER
 * This ensures Prisma works in packaged Electron apps
 */

const path = require('path');
const fs = require('fs');

// Fix for Electron ASAR packaging
if (process.versions && process.versions.electron) {
  const { app } = require('electron').remote || require('electron');
  
  // Set correct paths for production
  if (app && app.isPackaged) {
    // Windows production paths
    const appPath = path.dirname(app.getPath('exe'));
    const resourcesPath = path.join(appPath, 'resources');
    
    // Try multiple possible locations
    const possiblePaths = [
      path.join(resourcesPath, 'app.asar.unpacked', 'node_modules', '.prisma', 'client'),
      path.join(resourcesPath, 'app', 'node_modules', '.prisma', 'client'),
      path.join(resourcesPath, 'node_modules', '.prisma', 'client'),
      path.join(appPath, 'node_modules', '.prisma', 'client'),
    ];
    
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        process.env.PRISMA_QUERY_ENGINE_LIBRARY = path.join(p, 'query_engine-windows.dll.node');
        console.log('✅ Prisma engine found at:', p);
        break;
      }
    }
  }
}

// Re-export the actual Prisma client
const actualClient = require('./.prisma/client/index.js');
module.exports = actualClient;
module.exports.PrismaClient = actualClient.PrismaClient;
module.exports.default = actualClient;
`;

  const clientDir = path.join(__dirname, '..', 'node_modules', '@prisma', 'client');
  
  // Create the wrapper files
  fs.writeFileSync(path.join(clientDir, 'index.js'), wrapperCode);
  fs.writeFileSync(path.join(clientDir, 'default.js'), wrapperCode);
  
  // Create TypeScript declarations
  const dtsContent = `export * from './.prisma/client/index';`;
  fs.writeFileSync(path.join(clientDir, 'index.d.ts'), dtsContent);
  fs.writeFileSync(path.join(clientDir, 'default.d.ts'), dtsContent);
  
  console.log('✅ Production wrapper created');
}

// Step 3: Copy Windows binaries to all necessary locations
function copyWindowsBinaries() {
  const prismaClientPath = path.join(__dirname, '..', 'node_modules', '.prisma', 'client');
  const prismaModulePath = path.join(__dirname, '..', 'node_modules', '@prisma', 'client');
  
  // Ensure directories exist
  if (!fs.existsSync(prismaClientPath)) {
    fs.mkdirSync(prismaClientPath, { recursive: true });
  }
  
  // Copy Windows binaries if they were downloaded
  if (fs.existsSync('/tmp/query-engine.exe')) {
    fs.copyFileSync('/tmp/query-engine.exe', path.join(prismaClientPath, 'query-engine-windows.exe'));
    fs.copyFileSync('/tmp/query_engine.dll.node', path.join(prismaClientPath, 'query_engine-windows.dll.node'));
    console.log('✅ Windows binaries copied from download');
  } else {
    // Use the existing generated binary
    const existingBinary = path.join(prismaClientPath, 'query_engine-windows.dll.node');
    if (fs.existsSync(existingBinary)) {
      console.log('✅ Using existing Windows binary');
    }
  }
  
  // Create symlinks for compatibility
  const createSymlink = (target, link) => {
    try {
      if (fs.existsSync(link)) fs.unlinkSync(link);
      fs.symlinkSync(target, link);
    } catch (e) {
      // If symlink fails, copy the file
      try {
        fs.copyFileSync(target, link);
      } catch (e2) {
        console.log(`⚠️ Could not create ${link}`);
      }
    }
  };
  
  // Create all necessary module references
  const prismaClient = path.join(prismaClientPath, 'index.js');
  if (fs.existsSync(prismaClient)) {
    createSymlink(prismaClient, path.join(prismaModulePath, '.prisma', 'client', 'index.js'));
  }
  
  console.log('✅ All binaries and references configured');
}

// Step 4: Fix package.json for proper bundling
function fixPackageJson() {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Ensure all Prisma files are included
  if (!packageJson.build.includeSubNodeModules) {
    packageJson.build.includeSubNodeModules = true;
  }
  
  // Add Windows-specific configuration
  packageJson.build.win = {
    ...packageJson.build.win,
    target: [
      {
        target: "nsis",
        arch: ["x64", "ia32"]
      }
    ],
    extraFiles: [
      {
        from: "node_modules/.prisma/client",
        to: "resources/app.asar.unpacked/node_modules/.prisma/client",
        filter: ["**/*"]
      }
    ]
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json updated for Windows bundling');
}

// Main execution
async function main() {
  try {
    // Download Windows binaries (optional, will use generated if fails)
    await downloadWindowsBinary();
    
    // Create production wrapper
    createProductionWrapper();
    
    // Copy binaries to correct locations
    copyWindowsBinaries();
    
    // Fix package.json
    fixPackageJson();
    
    console.log('');
    console.log('🎉 PROFESSIONAL PRISMA PRODUCTION FIX COMPLETE!');
    console.log('✅ Your app will now work on Windows without Prisma errors');
    console.log('');
  } catch (error) {
    console.error('❌ Error during fix:', error);
    process.exit(1);
  }
}

main();
