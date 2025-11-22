import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function backupDatabase() {
  console.log('🔄 Starting database backup...')
  
  try {
    // Create backups directory if it doesn't exist
    const backupsDir = path.join(__dirname, '..', 'backups')
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true })
    }

    // Get current timestamp for filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
    const backupFile = path.join(backupsDir, `database-backup-${timestamp}.json`)

    console.log('📦 Fetching all data from database...')

    // Fetch all data from all tables
    const data = {
      users: await prisma.user.findMany(),
      assistantSessions: await prisma.assistantSession.findMany(),
      assistantUsers: await prisma.assistantUser.findMany(),
      salles: await prisma.salle.findMany(),
      patients: await prisma.patient.findMany(),
      visitExaminations: await prisma.visitExamination.findMany(),
      ordonnances: await prisma.ordonnance.findMany(),
      messages: await prisma.message.findMany(),
      messageTemplates: await prisma.messageTemplate.findMany(),
      actesHonoraires: await prisma.actesHonoraires.findMany(),
      honoraires: await prisma.honoraire.findMany(),
      paymentValidations: await prisma.paymentValidation.findMany(),
      paymentLogs: await prisma.paymentLog.findMany(),
      patientQueue: await prisma.patientQueue.findMany(),
      medicines: await prisma.medicine.findMany(),
      quantities: await prisma.quantity.findMany(),
      notes: await prisma.note.findMany(),
      tasks: await prisma.task.findMany(),
      tags: await prisma.tag.findMany(),
      auditLogs: await prisma.auditLog.findMany(),
      backupMetadata: {
        createdAt: new Date().toISOString(),
        version: '1.0',
        totalTables: 20
      }
    }

    // Write to file
    console.log('💾 Writing backup to file...')
    fs.writeFileSync(backupFile, JSON.stringify(data, null, 2), 'utf-8')

    // Also create a simple backup file in the main application folder for easy access
    const simpleBackupPath = path.join(__dirname, '..', 'MY_DATABASE_BACKUP.json')
    fs.writeFileSync(simpleBackupPath, JSON.stringify(data, null, 2), 'utf-8')

    console.log('✅ Backup completed successfully!')
    console.log(`📁 Backup file: ${backupFile}`)
    console.log(`📁 Easy access copy: ${simpleBackupPath}`)
    console.log('\n📊 Backup Summary:')
    console.log(`   Users: ${data.users.length}`)
    console.log(`   Assistant Sessions: ${data.assistantSessions.length}`)
    console.log(`   Assistant Users: ${data.assistantUsers.length}`)
    console.log(`   Salles: ${data.salles.length}`)
    console.log(`   Patients: ${data.patients.length}`)
    console.log(`   Visit Examinations: ${data.visitExaminations.length}`)
    console.log(`   Ordonnances: ${data.ordonnances.length}`)
    console.log(`   Messages: ${data.messages.length}`)
    console.log(`   Message Templates: ${data.messageTemplates.length}`)
    console.log(`   Actes Honoraires: ${data.actesHonoraires.length}`)
    console.log(`   Honoraires: ${data.honoraires.length}`)
    console.log(`   Payment Validations: ${data.paymentValidations.length}`)
    console.log(`   Payment Logs: ${data.paymentLogs.length}`)
    console.log(`   Patient Queue: ${data.patientQueue.length}`)
    console.log(`   Medicines: ${data.medicines.length}`)
    console.log(`   Quantities: ${data.quantities.length}`)
    console.log(`   Notes: ${data.notes.length}`)
    console.log(`   Tasks: ${data.tasks.length}`)
    console.log(`   Tags: ${data.tags.length}`)
    console.log(`   Audit Logs: ${data.auditLogs.length}`)

    // Also copy the actual database file
    const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db')
    const dbBackupPath = path.join(backupsDir, `dev-backup-${timestamp}.db`)
    const simpleDbBackupPath = path.join(__dirname, '..', 'MY_DATABASE_BACKUP.db')
    
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, dbBackupPath)
      fs.copyFileSync(dbPath, simpleDbBackupPath)
      console.log(`\n✅ Database file also copied to: ${dbBackupPath}`)
      console.log(`✅ Easy access DB copy: ${simpleDbBackupPath}`)
    }

    console.log('\n🎯 IMPORTANT: You can find your backup files at:')
    console.log(`   📄 /Applications/allah/MY_DATABASE_BACKUP.json`)
    console.log(`   📄 /Applications/allah/MY_DATABASE_BACKUP.db`)
    console.log('\n💡 Copy these 2 files to your new PC and tell me their location!')

    return { backupFile, simpleBackupPath }
  } catch (error) {
    console.error('❌ Error backing up database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the backup
backupDatabase()
  .then((result) => {
    console.log(`\n🎉 Backup complete!`)
    process.exit(0)
  })
  .catch((error) => {
    console.error('Failed to backup database:', error)
    process.exit(1)
  })
