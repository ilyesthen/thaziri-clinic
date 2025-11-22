# 🚀 GITHUB QUICK SETUP - COPY & PASTE COMMANDS

## ⚠️ SECURITY FIRST!
**REVOKE YOUR TOKEN NOW**: https://github.com/settings/tokens
Never share tokens publicly again!

---

## 📋 COPY THESE COMMANDS ONE BY ONE:

### Step 1: Initialize Git
```bash
cd /Applications/allah
git init
git add .
git commit -m "Initial commit - Thaziri Clinic System"
```

### Step 2: Create Repository on GitHub
1. Open: https://github.com/new
2. Repository name: `thaziri-clinic`
3. Set to **Private**
4. **DON'T** initialize with README
5. Click **Create repository**

### Step 3: Push to GitHub
```bash
git remote add origin https://github.com/ilyesmoussaoui/thaziri-clinic.git
git branch -M main
git push -u origin main
```

### Step 4: Trigger Build
```bash
git tag v1.0.0
git push origin v1.0.0
```

### Step 5: Get Your Windows Installer
1. Go to: https://github.com/ilyesmoussaoui/thaziri-clinic/actions
2. Wait for build to complete (10-15 minutes)
3. Click on the build
4. Download artifacts at the bottom

---

## 🎯 EVEN EASIER: One Command Setup

Just run this in terminal:
```bash
./github-setup.sh
```

Then follow the prompts!

---

## 📦 What Happens:
1. GitHub receives your code
2. Windows server starts automatically
3. Builds your app on real Windows
4. Creates installer (.exe)
5. You download it

## ✅ Your Installers Will Be:
- `windows-x64-installer`: 64-bit Windows
- `windows-ia32-installer`: 32-bit Windows  
- `windows-universal-installer`: Works on all Windows

---

## 🆘 If You Need Help:
The GitHub Actions workflow is already configured in:
`.github/workflows/build-windows.yml`

Just push your code and it builds automatically!
