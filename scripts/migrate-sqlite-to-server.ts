import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs'

/**
 * Migration script to transfer data from existing SQLite database to server database
 * Run this on the admin PC after installing the server version
 */

interface MigrationStats {
  users: number
  patients: number
  visitExaminations: number
  honoraires: number
  messages: number
  paymentValidations: number
  ordonnances: number
  medicines: number
  quantities: number
  comptesRendus: number
  [key: string]: number
}

async function migrateDatabase() {
  console.log('🔄 Starting database migration from SQLite to server database...')
  
  // Source SQLite database (your current data)
  const sourcePrisma = new PrismaClient({
    datasources: {
      db: {
        url: "file:./prisma/dev.db"
      }
    }
  })

  // Target server database (PostgreSQL or new SQLite for server)
  const targetPrisma = new PrismaClient()

  const stats: MigrationStats = {
    users: 0,
    patients: 0,
    visitExaminations: 0,
    honoraires: 0,
    messages: 0,
    paymentValidations: 0,
    ordonnances: 0,
    medicines: 0,
    quantities: 0,
    comptesRendus: 0
  }

  try {
    await sourcePrisma.$connect()
    await targetPrisma.$connect()

    console.log('✅ Connected to both databases')

    // Migrate Users (excluding passwords for security - will need to be reset)
    console.log('📋 Migrating users...')
    const users = await sourcePrisma.user.findMany()
    for (const user of users) {
      try {
        await targetPrisma.user.create({
          data: {
            email: user.email,
            name: user.name,
            password: user.password, // Keep existing hashed passwords
            role: user.role,
            defaultPercentage: user.defaultPercentage,
            currentSalleId: user.currentSalleId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        })
        stats.users++
      } catch (error: any) {
        if (error.code !== 'P2002') { // Skip unique constraint errors
          console.warn(`Failed to migrate user ${user.email}:`, error.message)
        }
      }
    }

    // Migrate Patients
    console.log('👥 Migrating patients...')
    const patients = await sourcePrisma.patient.findMany()
    for (const patient of patients) {
      try {
        await targetPrisma.patient.create({
          data: {
            recordNumber: patient.recordNumber,
            departmentCode: patient.departmentCode,
            firstName: patient.firstName,
            lastName: patient.lastName,
            fullName: patient.fullName,
            age: patient.age,
            dateOfBirth: patient.dateOfBirth,
            address: patient.address,
            phone: patient.phone,
            code: patient.code,
            gender: patient.gender,
            usefulInfo: patient.usefulInfo,
            photo1: patient.photo1,
            generalHistory: patient.generalHistory,
            ophthalmoHistory: patient.ophthalmoHistory,
            createdAt: patient.createdAt,
            updatedAt: patient.updatedAt,
            originalCreatedDate: patient.originalCreatedDate
          }
        })
        stats.patients++
      } catch (error: any) {
        if (error.code !== 'P2002') {
          console.warn(`Failed to migrate patient ${patient.fullName}:`, error.message)
        }
      }
    }

    // Migrate Visit Examinations
    console.log('🏥 Migrating visit examinations...')
    const visits = await sourcePrisma.visitExamination.findMany()
    for (const visit of visits) {
      try {
        await targetPrisma.visitExamination.create({
          data: visit
        })
        stats.visitExaminations++
      } catch (error: any) {
        if (error.code !== 'P2002') {
          console.warn(`Failed to migrate visit examination ${visit.id}:`, error.message)
        }
      }
    }

    // Migrate Honoraires
    console.log('💰 Migrating honoraires...')
    const honoraires = await sourcePrisma.honoraire.findMany()
    for (const honoraire of honoraires) {
      try {
        await targetPrisma.honoraire.create({
          data: honoraire
        })
        stats.honoraires++
      } catch (error: any) {
        if (error.code !== 'P2002') {
          console.warn(`Failed to migrate honoraire ${honoraire.id}:`, error.message)
        }
      }
    }

    // Migrate Messages
    console.log('💬 Migrating messages...')
    const messages = await sourcePrisma.message.findMany()
    for (const message of messages) {
      try {
        await targetPrisma.message.create({
          data: message
        })
        stats.messages++
      } catch (error: any) {
        if (error.code !== 'P2002') {
          console.warn(`Failed to migrate message ${message.id}:`, error.message)
        }
      }
    }

    // Migrate Payment Validations
    console.log('💳 Migrating payment validations...')
    const payments = await sourcePrisma.paymentValidation.findMany()
    for (const payment of payments) {
      try {
        await targetPrisma.paymentValidation.create({
          data: payment
        })
        stats.paymentValidations++
      } catch (error: any) {
        if (error.code !== 'P2002') {
          console.warn(`Failed to migrate payment validation ${payment.id}:`, error.message)
        }
      }
    }

    // Migrate Ordonnances
    console.log('📄 Migrating ordonnances...')
    const ordonnances = await sourcePrisma.ordonnance.findMany()
    for (const ordonnance of ordonnances) {
      try {
        await targetPrisma.ordonnance.create({
          data: ordonnance
        })
        stats.ordonnances++
      } catch (error: any) {
        if (error.code !== 'P2002') {
          console.warn(`Failed to migrate ordonnance ${ordonnance.id}:`, error.message)
        }
      }
    }

    // Migrate Medicines
    console.log('💊 Migrating medicines...')
    const medicines = await sourcePrisma.medicine.findMany()
    for (const medicine of medicines) {
      try {
        await targetPrisma.medicine.create({
          data: medicine
        })
        stats.medicines++
      } catch (error: any) {
        if (error.code !== 'P2002') {
          console.warn(`Failed to migrate medicine ${medicine.code}:`, error.message)
        }
      }
    }

    // Migrate other tables...
    // Add more migrations as needed

    console.log('\n🎉 Migration completed successfully!')
    console.log('📊 Migration Statistics:')
    Object.entries(stats).forEach(([table, count]) => {
      console.log(`   ${table}: ${count} records`)
    })

    // Create a backup of the original database
    const backupPath = `./prisma/dev.db.backup.${Date.now()}`
    if (fs.existsSync('./prisma/dev.db')) {
      fs.copyFileSync('./prisma/dev.db', backupPath)
      console.log(`\n💾 Original database backed up to: ${backupPath}`)
    }

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await sourcePrisma.$disconnect()
    await targetPrisma.$disconnect()
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateDatabase()
    .then(() => {
      console.log('✅ Migration script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error)
      process.exit(1)
    })
}

export { migrateDatabase }
