#!/usr/bin/env tsx

/**
 * DATABASE EXPORT SCRIPT
 * Exports entire SQLite database to JSON for easy transfer
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface ExportData {
  exportDate: string
  version: string
  data: {
    users: any[]
    patients: any[]
    visitExaminations: any[]
    medicines: any[]
    quantities: any[]
    ordonnances: any[]
    paymentValidations: any[]
    paymentLogs: any[]
    templates: any[]
    notes: any[]
    tasks: any[]
    assistantSessions: any[]
    assistantUsers: any[]
    salles: any[]
    messages: any[]
    actesHonoraires: any[]
    honoraires: any[]
    patientQueue: any[]
    compteRendus: any[]
  }
}

async function exportDatabase() {
  console.log('🗄️  EXPORTING DATABASE...')
  console.log('=' .repeat(50))

  try {
    const exportData: ExportData = {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      data: {
        users: [],
        patients: [],
        visitExaminations: [],
        medicines: [],
        quantities: [],
        ordonnances: [],
        paymentValidations: [],
        paymentLogs: [],
        templates: [],
        notes: [],
        tasks: [],
        assistantSessions: [],
        assistantUsers: [],
        salles: [],
        messages: [],
        actesHonoraires: [],
        honoraires: [],
        patientQueue: [],
        compteRendus: []
      }
    }

    // Export Users
    console.log('📤 Exporting users...')
    exportData.data.users = await prisma.user.findMany()
    console.log(`   ✅ ${exportData.data.users.length} users exported`)

    // Export Patients
    console.log('📤 Exporting patients...')
    exportData.data.patients = await prisma.patient.findMany()
    console.log(`   ✅ ${exportData.data.patients.length} patients exported`)

    // Export Salles
    console.log('📤 Exporting salles (rooms)...')
    exportData.data.salles = await prisma.salle.findMany()
    console.log(`   ✅ ${exportData.data.salles.length} salles exported`)

    // Export Visit Examinations
    console.log('📤 Exporting visit examinations...')
    exportData.data.visitExaminations = await prisma.visitExamination.findMany()
    console.log(`   ✅ ${exportData.data.visitExaminations.length} examinations exported`)

    // Export Medicines
    console.log('📤 Exporting medicines...')
    exportData.data.medicines = await prisma.medicine.findMany()
    console.log(`   ✅ ${exportData.data.medicines.length} medicines exported`)

    // Export Quantities
    console.log('📤 Exporting quantities...')
    exportData.data.quantities = await prisma.quantity.findMany()
    console.log(`   ✅ ${exportData.data.quantities.length} quantities exported`)

    // Export Ordonnances
    console.log('📤 Exporting ordonnances...')
    exportData.data.ordonnances = await prisma.ordonnance.findMany()
    console.log(`   ✅ ${exportData.data.ordonnances.length} ordonnances exported`)

    // Export Payment Logs
    console.log('📤 Exporting payment logs...')
    exportData.data.paymentLogs = await prisma.paymentLog.findMany()
    console.log(`   ✅ ${exportData.data.paymentLogs.length} payment logs exported`)

    // Export Payment Validations
    console.log('📤 Exporting payment validations...')
    exportData.data.paymentValidations = await prisma.paymentValidation.findMany()
    console.log(`   ✅ ${exportData.data.paymentValidations.length} validations exported`)

    // Export Templates
    console.log('📤 Exporting templates...')
    exportData.data.templates = await prisma.messageTemplate.findMany()
    console.log(`   ✅ ${exportData.data.templates.length} templates exported`)

    // Export Notes
    console.log('📤 Exporting notes...')
    exportData.data.notes = await prisma.note.findMany()
    console.log(`   ✅ ${exportData.data.notes.length} notes exported`)

    // Export Tasks
    console.log('📤 Exporting tasks...')
    exportData.data.tasks = await prisma.task.findMany()
    console.log(`   ✅ ${exportData.data.tasks.length} tasks exported`)

    // Export Assistant Sessions
    console.log('📤 Exporting assistant sessions...')
    exportData.data.assistantSessions = await prisma.assistantSession.findMany()
    console.log(`   ✅ ${exportData.data.assistantSessions.length} sessions exported`)

    // Export Assistant Users
    console.log('📤 Exporting assistant users...')
    exportData.data.assistantUsers = await prisma.assistantUser.findMany()
    console.log(`   ✅ ${exportData.data.assistantUsers.length} assistant users exported`)

    // Export Messages
    console.log('📤 Exporting messages...')
    exportData.data.messages = await prisma.message.findMany()
    console.log(`   ✅ ${exportData.data.messages.length} messages exported`)

    // Export Actes Honoraires
    console.log('📤 Exporting actes honoraires...')
    exportData.data.actesHonoraires = await prisma.actesHonoraires.findMany()
    console.log(`   ✅ ${exportData.data.actesHonoraires.length} actes exported`)

    // Export Honoraires
    console.log('📤 Exporting honoraires...')
    exportData.data.honoraires = await prisma.honoraire.findMany()
    console.log(`   ✅ ${exportData.data.honoraires.length} honoraires exported`)

    // Export Patient Queue
    console.log('📤 Exporting patient queue...')
    exportData.data.patientQueue = await prisma.patientQueue.findMany()
    console.log(`   ✅ ${exportData.data.patientQueue.length} queue entries exported`)

    // Export Comptes Rendus
    console.log('📤 Exporting comptes rendus...')
    exportData.data.compteRendus = await prisma.compteRendu.findMany()
    console.log(`   ✅ ${exportData.data.compteRendus.length} report templates exported`)

    // Save to file
    const outputPath = path.join(process.cwd(), 'database-export.json')
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2))

    const fileSizeMB = (fs.statSync(outputPath).size / (1024 * 1024)).toFixed(2)

    console.log('\n' + '='.repeat(50))
    console.log('✅ EXPORT COMPLETE!')
    console.log(`📁 File: ${outputPath}`)
    console.log(`📊 Size: ${fileSizeMB} MB`)
    console.log('\n💡 NEXT STEPS:')
    console.log('1. Copy database-export.json to your Windows computer')
    console.log('2. Place it in the Thaziri app folder')
    console.log('3. Run: npm run db:import')
    console.log('='.repeat(50))

  } catch (error) {
    console.error('❌ Export failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

exportDatabase()
