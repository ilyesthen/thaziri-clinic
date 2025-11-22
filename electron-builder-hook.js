/**
 * PROFESSIONAL ELECTRON BUILDER HOOK
 * This is how enterprise apps handle native modules
 */

const fs = require('fs');
const path = require('path');

exports.default = async function(context) {
  console.log('🔧 Running Professional Electron Builder Hook...');
  
  const appDir = context.appOutDir;
  const platform = context.electronPlatformName || context.platform;
  const projectDir = context.projectDir || __dirname;
  
  if (platform === 'win32' || platform === 'win') {
    console.log('🪟 Fixing Windows Prisma binaries...');
    
    // Paths for Windows
    const resourcesDir = path.join(appDir, 'resources');
    const appAsarUnpacked = path.join(resourcesDir, 'app.asar.unpacked');
    const prismaDir = path.join(appAsarUnpacked, 'node_modules', '.prisma', 'client');
    
    // Ensure directory exists
    if (!fs.existsSync(prismaDir)) {
      fs.mkdirSync(prismaDir, { recursive: true });
    }
    
    // Copy Prisma Windows binaries
    const sourcePrismaDir = path.join(projectDir, 'node_modules', '.prisma', 'client');
    
    // Files to copy
    const filesToCopy = [
      'query_engine-windows.dll.node',
      'schema.prisma',
      'index.js',
      'index.d.ts',
      'package.json'
    ];
    
    filesToCopy.forEach(file => {
      const src = path.join(sourcePrismaDir, file);
      const dest = path.join(prismaDir, file);
      
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`✅ Copied ${file}`);
      }
    });
    
    // Create @prisma/client module resolution fix
    const prismaPkgDir = path.join(appAsarUnpacked, 'node_modules', '@prisma', 'client');
    if (!fs.existsSync(prismaPkgDir)) {
      fs.mkdirSync(prismaPkgDir, { recursive: true });
    }
    
    // Create module wrapper
    const moduleWrapper = `
const path = require('path');
const clientPath = path.join(__dirname, '..', '..', '.prisma', 'client');
module.exports = require(clientPath);
module.exports.PrismaClient = require(clientPath).PrismaClient;
`;
    
    fs.writeFileSync(path.join(prismaPkgDir, 'index.js'), moduleWrapper);
    fs.writeFileSync(path.join(prismaPkgDir, 'default.js'), moduleWrapper);
    
    console.log('✅ Windows Prisma binaries fixed!');
  }
};
