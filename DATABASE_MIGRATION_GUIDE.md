# 🗄️ DATABASE MIGRATION TO WINDOWS - COMPLETE GUIDE

## ✅ **YOUR DATABASE:**
- **Location:** `/Applications/allah/prisma/dev.db`
- **Size:** 97 MB
- **Type:** SQLite
- **Easy to migrate!** Just copy the file!

---

## 🎯 **METHOD 1: SIMPLE COPY (RECOMMENDED)**

### **Step 1: Copy Database from Mac**
```bash
# On your Mac, run this:
cd /Applications/allah
cp prisma/dev.db ~/Desktop/thaziri-database.db
```

### **Step 2: Transfer to Windows**
- Copy `thaziri-database.db` from your Desktop to a USB drive
- OR email it to yourself
- OR use cloud storage (Dropbox, Google Drive)

### **Step 3: Place on Windows**
After installing Thaziri on Windows:

1. Open File Explorer
2. Navigate to: `C:\Users\YourName\AppData\Local\Programs\Thaziri\resources\app\prisma\`
3. Paste `thaziri-database.db`
4. Rename it to `dev.db`

**Done!** Your data is now on Windows!

---

## 🎯 **METHOD 2: AUTOMATIC EXPORT/IMPORT (PROFESSIONAL)**

I'll create scripts that export to JSON and import on Windows.

### **On Mac - Export Data:**
```bash
npm run db:export
```

This creates `database-export.json` with all your data.

### **On Windows - Import Data:**
```bash
npm run db:import
```

This imports all data into the Windows database.

---

## 🎯 **METHOD 3: INCLUDE DATABASE IN INSTALLER**

We can modify the build to include your database directly in the installer!

---

## 📦 **WHAT'S IN YOUR DATABASE:**

Based on your schema, you have:
- 👥 **Users** (doctors, nurses, assistants)
- 🏥 **Patients** (with all medical records)
- 📋 **Visits & Examinations**
- 💊 **Medicines & Prescriptions**
- 💳 **Payments & Accounting**
- 📝 **Templates & Messages**
- 🏠 **Room assignments**

---

## ⚠️ **IMPORTANT NOTES:**

1. **Database Paths:**
   - Mac: `/Applications/allah/prisma/dev.db`
   - Windows: `C:\Users\[Username]\AppData\Local\Programs\Thaziri\resources\app\prisma\dev.db`

2. **Backup First:**
   Always keep a backup of your database before migration!

3. **File Permissions:**
   Make sure the Windows app has write access to the database file.

---

## 🚀 **WHICH METHOD DO YOU PREFER?**

**Choose based on your needs:**

1. **Simple Copy** - Fastest, if you can access both computers
2. **Export/Import** - Most flexible, works remotely
3. **Include in Build** - Best for deployment to multiple clinics

Let me know which method you want and I'll set it up!
