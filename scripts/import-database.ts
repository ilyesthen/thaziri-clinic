#!/usr/bin/env tsx

/**
 * DATABASE IMPORT SCRIPT
 * Imports database from JSON export file
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function importDatabase() {
  console.log('📥 IMPORTING DATABASE...')
  console.log('='.repeat(50))

  try {
    // Read the export file
    const exportPath = path.join(process.cwd(), 'database-export.json')
    
    if (!fs.existsSync(exportPath)) {
      console.error('❌ database-export.json not found!')
      console.log('💡 Please place database-export.json in the app folder')
      process.exit(1)
    }

    console.log('📂 Reading export file...')
    const exportData = JSON.parse(fs.readFileSync(exportPath, 'utf-8'))
    
    console.log(`✅ Export date: ${exportData.exportDate}`)
    console.log(`✅ Version: ${exportData.version}`)
    console.log('')

    // Clear existing data (optional - comment out if you want to merge)
    console.log('🗑️  Clearing existing data...')
    await prisma.paymentLog.deleteMany()
    await prisma.paymentValidation.deleteMany()
    await prisma.patientQueue.deleteMany()
    await prisma.message.deleteMany()
    await prisma.ordonnance.deleteMany()
    await prisma.visitExamination.deleteMany()
    await prisma.honoraire.deleteMany()
    await prisma.assistantSession.deleteMany()
    await prisma.task.deleteMany()
    await prisma.note.deleteMany()
    await prisma.messageTemplate.deleteMany()
    await prisma.assistantUser.deleteMany()
    await prisma.patient.deleteMany()
    await prisma.user.deleteMany()
    console.log('✅ Cleared')
    console.log('')

    // Import Users
    console.log('📥 Importing users...')
    for (const user of exportData.data.users) {
      await prisma.user.create({ data: user })
    }
    console.log(`   ✅ ${exportData.data.users.length} users imported`)

    // Import Assistant Users
    console.log('📥 Importing assistant users...')
    for (const assistantUser of exportData.data.assistantUsers) {
      await prisma.assistantUser.create({ data: assistantUser })
    }
    console.log(`   ✅ ${exportData.data.assistantUsers.length} assistant users imported`)

    // Import Salles
    console.log('📥 Importing salles...')
    for (const salle of exportData.data.salles) {
      await prisma.salle.create({ data: salle })
    }
    console.log(`   ✅ ${exportData.data.salles.length} salles imported`)

    // Import Patients
    console.log('📥 Importing patients...')
    for (const patient of exportData.data.patients) {
      await prisma.patient.create({ data: patient })
    }
    console.log(`   ✅ ${exportData.data.patients.length} patients imported`)

    // Import Templates
    console.log('📥 Importing templates...')
    for (const template of exportData.data.templates) {
      await prisma.messageTemplate.create({ data: template })
    }
    console.log(`   ✅ ${exportData.data.templates.length} templates imported`)

    // Import Notes
    console.log('📥 Importing notes...')
    for (const note of exportData.data.notes) {
      await prisma.note.create({ data: note })
    }
    console.log(`   ✅ ${exportData.data.notes.length} notes imported`)

    // Import Tasks
    console.log('📥 Importing tasks...')
    for (const task of exportData.data.tasks) {
      await prisma.task.create({ data: task })
    }
    console.log(`   ✅ ${exportData.data.tasks.length} tasks imported`)

    // Import Assistant Sessions
    console.log('📥 Importing assistant sessions...')
    for (const session of exportData.data.assistantSessions) {
      await prisma.assistantSession.create({ data: session })
    }
    console.log(`   ✅ ${exportData.data.assistantSessions.length} sessions imported`)

    // Import Visit Examinations
    console.log('📥 Importing visit examinations...')
    for (const exam of exportData.data.visitExaminations) {
      await prisma.visitExamination.create({ data: exam })
    }
    console.log(`   ✅ ${exportData.data.visitExaminations.length} examinations imported`)

    // Import Medicines
    console.log('📥 Importing medicines...')
    for (const medicine of exportData.data.medicines) {
      await prisma.medicine.create({ data: medicine })
    }
    console.log(`   ✅ ${exportData.data.medicines.length} medicines imported`)

    // Import Quantities
    console.log('📥 Importing quantities...')
    for (const quantity of exportData.data.quantities) {
      await prisma.quantity.create({ data: quantity })
    }
    console.log(`   ✅ ${exportData.data.quantities.length} quantities imported`)

    // Import Ordonnances
    console.log('📥 Importing ordonnances...')
    for (const ordonnance of exportData.data.ordonnances) {
      await prisma.ordonnance.create({ data: ordonnance })
    }
    console.log(`   ✅ ${exportData.data.ordonnances.length} ordonnances imported`)

    // Import Actes Honoraires
    console.log('📥 Importing actes honoraires...')
    for (const acte of exportData.data.actesHonoraires) {
      await prisma.actesHonoraires.create({ data: acte })
    }
    console.log(`   ✅ ${exportData.data.actesHonoraires.length} actes imported`)

    // Import Honoraires
    console.log('📥 Importing honoraires...')
    for (const honoraire of exportData.data.honoraires) {
      await prisma.honoraire.create({ data: honoraire })
    }
    console.log(`   ✅ ${exportData.data.honoraires.length} honoraires imported`)

    // Import Payment Validations
    console.log('📥 Importing payment validations...')
    for (const payment of exportData.data.paymentValidations) {
      await prisma.paymentValidation.create({ data: payment })
    }
    console.log(`   ✅ ${exportData.data.paymentValidations.length} validations imported`)

    // Import Payment Logs
    console.log('📥 Importing payment logs...')
    for (const log of exportData.data.paymentLogs) {
      await prisma.paymentLog.create({ data: log })
    }
    console.log(`   ✅ ${exportData.data.paymentLogs.length} logs imported`)

    // Import Messages
    console.log('📥 Importing messages...')
    for (const message of exportData.data.messages) {
      await prisma.message.create({ data: message })
    }
    console.log(`   ✅ ${exportData.data.messages.length} messages imported`)

    // Import Patient Queue
    console.log('📥 Importing patient queue...')
    for (const queueEntry of exportData.data.patientQueue) {
      await prisma.patientQueue.create({ data: queueEntry })
    }
    console.log(`   ✅ ${exportData.data.patientQueue.length} queue entries imported`)

    // Import Comptes Rendus
    console.log('📥 Importing comptes rendus...')
    for (const compteRendu of exportData.data.compteRendus) {
      await prisma.compteRendu.create({ data: compteRendu })
    }
    console.log(`   ✅ ${exportData.data.compteRendus.length} report templates imported`)

    console.log('\n' + '='.repeat(50))
    console.log('✅ IMPORT COMPLETE!')
    console.log('🎉 Your database is now ready to use!')
    console.log('='.repeat(50))

  } catch (error) {
    console.error('❌ Import failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

importDatabase()
