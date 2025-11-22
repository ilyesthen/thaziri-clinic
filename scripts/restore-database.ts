import * as fs from 'fs'
import * as path from 'path'

/**
 * Simple database restore script
 * Usage: tsx scripts/restore-database.ts [path-to-backup-db-file]
 * Example: tsx scripts/restore-database.ts C:\Users\YourName\Desktop\MY_DATABASE_BACKUP.db
 */

async function restoreDatabase() {
  console.log('🔄 Starting database restore...')
  
  // Get backup file path from command line argument
  const backupFilePath = process.argv[2]
  
  if (!backupFilePath) {
    console.error('❌ Error: Please provide the path to your backup file')
    console.log('\n📖 Usage:')
    console.log('   npm run db:restore [path-to-backup-file]')
    console.log('\n💡 Examples:')
    console.log('   Mac:     npm run db:restore /Users/yourname/Desktop/MY_DATABASE_BACKUP.db')
    console.log('   Windows: npm run db:restore C:\\Users\\YourName\\Desktop\\MY_DATABASE_BACKUP.db')
    process.exit(1)
  }
  
  try {
    // Check if backup file exists
    if (!fs.existsSync(backupFilePath)) {
      throw new Error(`Backup file not found: ${backupFilePath}`)
    }
    
    console.log(`📁 Found backup file: ${backupFilePath}`)
    
    // Get file size for confirmation
    const stats = fs.statSync(backupFilePath)
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2)
    console.log(`📊 Backup file size: ${fileSizeMB} MB`)
    
    // Determine target database path
    const targetDbPath = path.join(__dirname, '..', 'prisma', 'dev.db')
    
    // Backup existing database if it exists
    if (fs.existsSync(targetDbPath)) {
      const backupOldPath = path.join(__dirname, '..', 'prisma', `dev.db.old-${Date.now()}`)
      console.log(`\n💾 Backing up existing database to: ${backupOldPath}`)
      fs.copyFileSync(targetDbPath, backupOldPath)
    }
    
    // Copy backup to database location
    console.log(`\n🔄 Restoring database...`)
    fs.copyFileSync(backupFilePath, targetDbPath)
    
    console.log('\n✅ Database restored successfully!')
    console.log(`📍 Database location: ${targetDbPath}`)
    
    console.log('\n🎯 Next steps:')
    console.log('   1. Run: npx prisma generate')
    console.log('   2. Start the app: npm start')
    console.log('\n🎉 All your data is ready to use!')
    
  } catch (error) {
    console.error('❌ Error restoring database:', error)
    if (error instanceof Error) {
      console.error(`   ${error.message}`)
    }
    process.exit(1)
  }
}

// Run the restore
restoreDatabase()
