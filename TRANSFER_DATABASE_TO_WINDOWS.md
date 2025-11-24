# 🚀 QUICK START: Transfer Database to Windows

Your 97MB SQLite database needs to be on Windows. **Choose ONE method:**

---

## ⚡ **METHOD 1: DIRECT COPY (FASTEST - 2 MINUTES)**

### On Mac:
```bash
# Copy database to Desktop
cp /Applications/allah/prisma/dev.db ~/Desktop/thaziri-database.db
```

### Transfer:
- Copy `thaziri-database.db` to USB drive
- Move to Windows PC

### On Windows:
1. Install Thaziri from the `.exe` you downloaded
2. Open File Explorer and paste this in the address bar:
   ```
   %LOCALAPPDATA%\Programs\Thaziri\resources\app\prisma
   ```
3. Paste `thaziri-database.db` and rename to `dev.db`
4. **Done!** Run Thaziri

---

## 📦 **METHOD 2: EXPORT/IMPORT (MOST FLEXIBLE)**

### On Mac - Export:
```bash
cd /Applications/allah
npm run db:export
```
This creates `database-export.json` (~100MB)

### Transfer:
- Email the JSON file to yourself
- OR use Google Drive/Dropbox
- OR copy to USB

### On Windows - Import:
1. Install Thaziri
2. Place `database-export.json` in Thaziri folder:
   ```
   %LOCALAPPDATA%\Programs\Thaziri\resources\app
   ```
3. Open PowerShell in that folder and run:
   ```
   npm run db:import
   ```
4. **Done!** Your data is imported

---

## 🎯 **METHOD 3: INCLUDE IN INSTALLER (ONE-TIME SETUP)**

If you want the database INSIDE the installer for easy deployment:

### On Mac:
```bash
cd /Applications/allah

# Copy database to a location that will be included in build
mkdir -p resources/database
cp prisma/dev.db resources/database/dev.db

# Update package.json build config to include it
# Then rebuild
npm run build:win:all
```

The new installer will include your database automatically!

---

## 🔍 **WHICH METHOD TO CHOOSE?**

| Method | Use When | Pros | Cons |
|--------|----------|------|------|
| **Direct Copy** | You have physical access to both computers | Fastest (2 min) | Need USB or network access |
| **Export/Import** | Remote setup or email transfer | Most flexible | Slower (~10 min) |
| **Include in Build** | Deploying to multiple clinics | One installer = done | Need to rebuild |

---

## 📝 **VERIFICATION**

After transfer, open Thaziri on Windows and check:
- ✅ Patients appear in patient list
- ✅ Visit history shows data
- ✅ Medicines list is populated
- ✅ Payment records exist

---

## ⚠️ **IMPORTANT NOTES:**

1. **Backup First!** Always keep a copy of your database
2. **Database Location on Windows:**
   ```
   C:\Users\[YourName]\AppData\Local\Programs\Thaziri\resources\app\prisma\dev.db
   ```
3. **If you get "database locked" error:** Close all Thaziri instances and try again

---

## 🆘 **TROUBLESHOOTING:**

**Can't find prisma folder?**
- Make sure Thaziri is installed
- Look in: `%LOCALAPPDATA%\Programs\Thaziri\resources\app\`

**Import fails?**
- Make sure `database-export.json` is in the right folder
- Check you have Node.js installed on Windows
- Try running as Administrator

**Database too large to email?**
- Use Google Drive or Dropbox
- Or use Direct Copy method with USB

---

## 🎉 **READY TO GO!**

Choose your method above and your database will be on Windows in minutes!
