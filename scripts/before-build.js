#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Running before-build script...');

// Ensure @prisma/client/default exists
const prismaClientPath = path.join(__dirname, '..', 'node_modules', '@prisma', 'client');
const defaultPath = path.join(prismaClientPath, 'default.js');
const defaultDTSPath = path.join(prismaClientPath, 'default.d.ts');

// Create default.js if it doesn't exist
if (!fs.existsSync(defaultPath)) {
  console.log('📝 Creating @prisma/client/default.js');
  fs.writeFileSync(defaultPath, `
// Re-export the main Prisma Client
module.exports = require('./index.js');
  `);
}

// Create default.d.ts if it doesn't exist
if (!fs.existsSync(defaultDTSPath)) {
  console.log('📝 Creating @prisma/client/default.d.ts');
  fs.writeFileSync(defaultDTSPath, `export * from './index';`);
}

// Copy .prisma/client files to @prisma/client if needed
const prismaSrcPath = path.join(__dirname, '..', 'node_modules', '.prisma', 'client');
const prismaDestPath = path.join(__dirname, '..', 'node_modules', '@prisma', 'client');

// Copy Windows binary if exists
const windowsBinary = path.join(prismaSrcPath, 'query_engine-windows.dll.node');
if (fs.existsSync(windowsBinary)) {
  const destBinary = path.join(prismaDestPath, 'query_engine-windows.dll.node');
  if (!fs.existsSync(destBinary)) {
    console.log('📋 Copying Windows query engine binary...');
    fs.copyFileSync(windowsBinary, destBinary);
  }
}

// Ensure the generated client files exist
const generatedIndexPath = path.join(prismaSrcPath, 'index.js');
const generatedIndexDTSPath = path.join(prismaSrcPath, 'index.d.ts');

if (fs.existsSync(generatedIndexPath)) {
  console.log('✅ Prisma client files found and ready');
} else {
  console.error('❌ Prisma client not generated! Run: npx prisma generate');
  process.exit(1);
}

console.log('✅ Before-build script completed successfully');
