#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function exportDatabase() {
  console.log('📦 Starting database export for Windows migration...');

  try {
    // Export all tables
    const users = await prisma.user.findMany();
    const patients = await prisma.patient.findMany();
    const visitExaminations = await prisma.visitExamination.findMany();
    const paymentValidations = await prisma.paymentValidation.findMany();
    const paymentLogs = await prisma.paymentLog.findMany();
    const medicines = await prisma.medicine.findMany();
    const quantities = await prisma.quantity.findMany();
    const ordonnances = await prisma.ordonnance.findMany();
    const patientQueues = await prisma.patientQueue.findMany();
    const salles = await prisma.salle.findMany();
    const honoraires = await prisma.honoraire.findMany();
    const actesHonoraires = await prisma.actesHonoraires.findMany();

    const exportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      platform: 'darwin',
      targetPlatform: 'win32',
      data: {
        users,
        patients,
        visitExaminations,
        paymentValidations,
        paymentLogs,
        medicines,
        quantities,
        ordonnances,
        patientQueues,
        salles,
        honoraires,
        actesHonoraires
      },
      counts: {
        users: users.length,
        patients: patients.length,
        visitExaminations: visitExaminations.length,
        paymentValidations: paymentValidations.length,
        paymentLogs: paymentLogs.length,
        medicines: medicines.length,
        quantities: quantities.length,
        ordonnances: ordonnances.length,
        patientQueues: patientQueues.length,
        salles: salles.length,
        honoraires: honoraires.length,
        actesHonoraires: actesHonoraires.length
      }
    };

    // Create export directory
    const exportDir = path.join(process.cwd(), 'export');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }

    // Save to file
    const fileName = `thaziri-export-${new Date().toISOString().split('T')[0]}.json`;
    const filePath = path.join(exportDir, fileName);
    
    fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));
    
    console.log('✅ Database exported successfully!');
    console.log(`📄 Export file: ${filePath}`);
    console.log('\n📊 Export Summary:');
    Object.entries(exportData.counts).forEach(([table, count]) => {
      console.log(`  - ${table}: ${count} records`);
    });
    
    console.log('\n🚀 Transfer this file to your Windows machine to import the data');
    
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

exportDatabase();
