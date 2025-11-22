/**
 * Prisma Client Loader
 * Handles cross-platform Prisma client loading for Electron apps
 * Supports both development and production environments on macOS and Windows
 */

import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Dynamic Prisma Client loader that works across platforms
 */
export function loadPrismaClient(): any {
  console.log('🔍 Loading Prisma Client...');
  console.log('  Platform:', process.platform);
  console.log('  Packaged:', app.isPackaged);
  console.log('  Resource Path:', app.isPackaged ? process.resourcesPath : 'N/A');

  // Try multiple paths to find Prisma Client
  const possiblePaths = getPossiblePrismaClientPaths();
  
  for (const prismaPath of possiblePaths) {
    try {
      console.log(`  Trying: ${prismaPath}`);
      
      // Check if the path exists
      if (!fs.existsSync(prismaPath)) {
        console.log(`    ❌ Path does not exist`);
        continue;
      }
      
      // Try to require the module
      const PrismaClientModule = require(prismaPath);
      console.log(`    ✅ Successfully loaded from ${prismaPath}`);
      
      // Return the PrismaClient constructor
      if (PrismaClientModule.PrismaClient) {
        return PrismaClientModule;
      } else if (PrismaClientModule.default?.PrismaClient) {
        return PrismaClientModule.default;
      } else {
        return PrismaClientModule;
      }
    } catch (error) {
      console.log(`    ❌ Failed to load: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }
  }
  
  // If all paths fail, throw an error
  throw new Error('Failed to load Prisma Client from any known path');
}

/**
 * Get all possible paths where Prisma Client might be located
 */
function getPossiblePrismaClientPaths(): string[] {
  const paths: string[] = [];
  
  if (app.isPackaged) {
    // Production paths
    const resourcesPath = process.resourcesPath;
    
    // Windows specific paths
    if (process.platform === 'win32') {
      paths.push(
        // Try unpacked locations first (most likely)
        path.join(resourcesPath, 'app.asar.unpacked', 'node_modules', '@prisma', 'client', 'default'),
        path.join(resourcesPath, 'app.asar.unpacked', 'node_modules', '@prisma', 'client', 'index'),
        path.join(resourcesPath, 'app.asar.unpacked', 'node_modules', '@prisma', 'client'),
        path.join(resourcesPath, 'app.asar.unpacked', 'node_modules', '.prisma', 'client'),
        
        // Try in regular app.asar (less likely to work due to native modules)
        path.join(resourcesPath, 'app', 'node_modules', '@prisma', 'client', 'default'),
        path.join(resourcesPath, 'app', 'node_modules', '@prisma', 'client'),
        path.join(resourcesPath, 'app', 'node_modules', '.prisma', 'client')
      );
    }
    
    // macOS paths
    if (process.platform === 'darwin') {
      paths.push(
        path.join(resourcesPath, 'app.asar.unpacked', 'node_modules', '@prisma', 'client'),
        path.join(resourcesPath, 'app.asar.unpacked', 'node_modules', '.prisma', 'client'),
        path.join(resourcesPath, 'app', 'node_modules', '@prisma', 'client'),
        path.join(resourcesPath, 'app', 'node_modules', '.prisma', 'client')
      );
    }
  } else {
    // Development paths
    const projectRoot = path.join(__dirname, '..', '..', '..');
    paths.push(
      path.join(projectRoot, 'node_modules', '@prisma', 'client', 'default'),
      path.join(projectRoot, 'node_modules', '@prisma', 'client'),
      path.join(projectRoot, 'node_modules', '.prisma', 'client')
    );
  }
  
  // Also try requiring directly (in case Node.js can resolve it)
  paths.push('@prisma/client/default');
  paths.push('@prisma/client');
  
  return paths;
}

/**
 * Setup Windows-specific Prisma environment
 */
export function setupWindowsPrismaEnvironment(): void {
  if (process.platform !== 'win32' || !app.isPackaged) {
    return;
  }
  
  console.log('⚙️ Setting up Windows Prisma environment...');
  
  const resourcesPath = process.resourcesPath;
  const possibleEngines = [
    path.join(resourcesPath, 'app.asar.unpacked', 'node_modules', '.prisma', 'client', 'query_engine-windows.dll.node'),
    path.join(resourcesPath, 'app.asar.unpacked', 'node_modules', '@prisma', 'engines', 'query_engine-windows.dll.node'),
    path.join(resourcesPath, 'app', 'node_modules', '.prisma', 'client', 'query_engine-windows.dll.node'),
  ];
  
  for (const enginePath of possibleEngines) {
    if (fs.existsSync(enginePath)) {
      process.env.PRISMA_QUERY_ENGINE_LIBRARY = enginePath;
      console.log(`  ✅ Query engine found at: ${enginePath}`);
      return;
    }
  }
  
  console.warn('  ⚠️ Could not find Windows query engine');
}

/**
 * Get the database path based on platform and environment
 */
export function getDatabasePath(): string {
  if (app.isPackaged) {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'database', 'thaziri.db');
    
    // Ensure directory exists
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // Copy initial database if it doesn't exist
    if (!fs.existsSync(dbPath)) {
      const possibleSources = [
        path.join(process.resourcesPath, 'prisma', 'dev.db'),
        path.join(process.resourcesPath, 'app.asar.unpacked', 'prisma', 'dev.db'),
        path.join(process.resourcesPath, 'app', 'prisma', 'dev.db'),
      ];
      
      for (const sourcePath of possibleSources) {
        if (fs.existsSync(sourcePath)) {
          fs.copyFileSync(sourcePath, dbPath);
          console.log('✅ Initial database copied from:', sourcePath);
          console.log('   To:', dbPath);
          break;
        }
      }
    }
    
    return dbPath;
  } else {
    // Development
    return path.join(process.cwd(), 'prisma', 'dev.db');
  }
}
