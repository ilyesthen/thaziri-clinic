import { app } from 'electron'
import path from 'path'
import fs from 'fs'

/**
 * Get the correct database path for the current environment
 * Handles both development and production, and cross-platform compatibility
 */
export function getDatabasePath(): string {
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

  if (isDev) {
    // Development: Use the prisma folder in the project root
    return path.join(process.cwd(), 'prisma', 'dev.db')
  } else {
    // Production: Database should be in userData folder
    // Windows: C:\Users\{Username}\AppData\Roaming\Thaziri\prisma\dev.db
    // Mac: ~/Library/Application Support/Thaziri/prisma/dev.db
    
    const dbPath = path.join(app.getPath('userData'), 'prisma', 'dev.db')
    
    // Ensure the directory exists
    const dbDir = path.dirname(dbPath)
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
      console.log(`📁 Created database directory: ${dbDir}`)
    }

    return dbPath
  }
}

/**
 * Get the database URL for Prisma
 */
export function getDatabaseUrl(): string {
  const dbPath = getDatabasePath()
  // Normalize path for Prisma (use forward slashes, even on Windows)
  const normalizedPath = dbPath.replace(/\\/g, '/')
  return `file:${normalizedPath}`
}

/**
 * Ensure the database file exists and is readable/writable
 */
export function ensureDatabaseAccess(): boolean {
  try {
    const dbPath = getDatabasePath()
    
    if (!fs.existsSync(dbPath)) {
      console.log(`📝 Database file will be created at: ${dbPath}`)
      // Create empty file - Prisma will initialize it
      fs.writeFileSync(dbPath, '')
      return true
    }

    // Check if we can read and write
    fs.accessSync(dbPath, fs.constants.R_OK | fs.constants.W_OK)
    
    console.log(`✅ Database accessible at: ${dbPath}`)
    return true
  } catch (error) {
    console.error('❌ Database access check failed:', error)
    return false
  }
}
