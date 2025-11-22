#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function importDatabase(filePath: string) {
  console.log('📦 Starting database import from Mac export...');

  try {
    // Read the export file
    if (!fs.existsSync(filePath)) {
      throw new Error(`Export file not found: ${filePath}`);
    }

    const exportData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    console.log(`📄 Import file: ${filePath}`);
    console.log(`📅 Export date: ${exportData.exportDate}`);
    console.log(`💻 Source platform: ${exportData.platform}`);
    console.log(`🎯 Target platform: ${exportData.targetPlatform}`);
    
    // Clear existing data (optional - comment out if you want to merge)
    console.log('\n🗑️  Clearing existing data...');
    await prisma.paymentLog.deleteMany();
    await prisma.paymentValidation.deleteMany();
    await prisma.ordonnance.deleteMany();
    await prisma.visitExamination.deleteMany();
    await prisma.patientQueue.deleteMany();
    await prisma.honoraire.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.salle.deleteMany();
    await prisma.assistantSession.deleteMany();
    await prisma.user.deleteMany();
    await prisma.medicine.deleteMany();
    await prisma.quantity.deleteMany();
    await prisma.actesHonoraires.deleteMany();
    
    // Import data in correct order (respecting foreign keys)
    console.log('\n📥 Importing data...');
    
    // Users
    if (exportData.data.users?.length > 0) {
      console.log(`  - Importing ${exportData.data.users.length} users...`);
      await prisma.user.createMany({ data: exportData.data.users });
    }
    
    // Patients
    if (exportData.data.patients?.length > 0) {
      console.log(`  - Importing ${exportData.data.patients.length} patients...`);
      await prisma.patient.createMany({ data: exportData.data.patients });
    }
    
    // Salles
    if (exportData.data.salles?.length > 0) {
      console.log(`  - Importing ${exportData.data.salles.length} salles...`);
      await prisma.salle.createMany({ data: exportData.data.salles });
    }
    
    // Visit Examinations
    if (exportData.data.visitExaminations?.length > 0) {
      console.log(`  - Importing ${exportData.data.visitExaminations.length} visit examinations...`);
      await prisma.visitExamination.createMany({ data: exportData.data.visitExaminations });
    }
    
    // Payment Validations
    if (exportData.data.paymentValidations?.length > 0) {
      console.log(`  - Importing ${exportData.data.paymentValidations.length} payment validations...`);
      await prisma.paymentValidation.createMany({ data: exportData.data.paymentValidations });
    }
    
    // Payment Logs
    if (exportData.data.paymentLogs?.length > 0) {
      console.log(`  - Importing ${exportData.data.paymentLogs.length} payment logs...`);
      await prisma.paymentLog.createMany({ data: exportData.data.paymentLogs });
    }
    
    // Medicines
    if (exportData.data.medicines?.length > 0) {
      console.log(`  - Importing ${exportData.data.medicines.length} medicines...`);
      await prisma.medicine.createMany({ data: exportData.data.medicines });
    }
    
    // Quantities
    if (exportData.data.quantities?.length > 0) {
      console.log(`  - Importing ${exportData.data.quantities.length} quantities...`);
      await prisma.quantity.createMany({ data: exportData.data.quantities });
    }
    
    // Ordonnances
    if (exportData.data.ordonnances?.length > 0) {
      console.log(`  - Importing ${exportData.data.ordonnances.length} ordonnances...`);
      await prisma.ordonnance.createMany({ data: exportData.data.ordonnances });
    }
    
    // Patient Queues
    if (exportData.data.patientQueues?.length > 0) {
      console.log(`  - Importing ${exportData.data.patientQueues.length} patient queues...`);
      await prisma.patientQueue.createMany({ data: exportData.data.patientQueues });
    }
    
    // Honoraires
    if (exportData.data.honoraires?.length > 0) {
      console.log(`  - Importing ${exportData.data.honoraires.length} honoraires...`);
      await prisma.honoraire.createMany({ data: exportData.data.honoraires });
    }
    
    // Actes Honoraires
    if (exportData.data.actesHonoraires?.length > 0) {
      console.log(`  - Importing ${exportData.data.actesHonoraires.length} actes honoraires...`);
      await prisma.actesHonoraires.createMany({ data: exportData.data.actesHonoraires });
    }
    
    console.log('\n✅ Database imported successfully!');
    console.log('\n📊 Import Summary:');
    Object.entries(exportData.counts).forEach(([table, count]) => {
      console.log(`  - ${table}: ${count} records`);
    });
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get file path from command line argument
const filePath = process.argv[2];
if (!filePath) {
  console.error('❌ Please provide the path to the export file');
  console.error('Usage: npm run db:import-from-mac <path-to-export-file>');
  process.exit(1);
}

importDatabase(filePath);
