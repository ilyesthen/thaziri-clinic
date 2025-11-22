import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Fix for Prisma Client path resolution in production
 * This ensures Prisma can find its generated files in the packaged app
 */
export function fixPrismaPath(): void {
  if (app.isPackaged) {
    // In production, fix the Prisma client path
    const resourcesPath = process.resourcesPath;
    const prismaPath = path.join(resourcesPath, 'app.asar.unpacked', 'node_modules', '.prisma', 'client');
    
    // Check if the prisma client exists in the expected location
    if (fs.existsSync(prismaPath)) {
      // Set environment variable to help Prisma find its files
      // Use the correct Windows binary file name
      process.env.PRISMA_QUERY_ENGINE_LIBRARY = path.join(prismaPath, 'query_engine-windows.dll.node');
      
      console.log('✅ Prisma paths fixed for production');
      console.log(`   Query Engine Library: ${process.env.PRISMA_QUERY_ENGINE_LIBRARY}`);
    } else {
      console.error('❌ Prisma client not found at expected path:', prismaPath);
      // Try alternative path
      const altPath = path.join(resourcesPath, 'app', 'node_modules', '.prisma', 'client');
      if (fs.existsSync(altPath)) {
        process.env.PRISMA_QUERY_ENGINE_LIBRARY = path.join(altPath, 'query_engine-windows.dll.node');
        console.log('✅ Found Prisma at alternative path:', altPath);
      }
    }
  }
}

/**
 * Get the correct database path for Windows
 */
export function getWindowsDatabasePath(): string {
  if (app.isPackaged) {
    // In production, use AppData folder
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'database', 'thaziri.db');
    
    // Ensure directory exists
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // Copy initial database if it doesn't exist
    if (!fs.existsSync(dbPath)) {
      const sourcePath = path.join(process.resourcesPath, 'prisma', 'dev.db');
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, dbPath);
        console.log('✅ Initial database copied to:', dbPath);
      }
    }
    
    return dbPath;
  } else {
    // In development
    return path.join(process.cwd(), 'prisma', 'dev.db');
  }
}
