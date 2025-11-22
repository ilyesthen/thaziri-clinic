# Windows Build Fix for Prisma Client Error

## Problem Solved
The application was failing on Windows with the error:
```
Error: Cannot find module '@prisma/client/default'
```

This occurred because Prisma generates platform-specific native binaries, and building on macOS for Windows doesn't include the correct Windows binaries by default.

## Solution Implemented

### 1. **Cross-Platform Build Script** (`scripts/prepare-windows-build.js`)
- Automatically configures Prisma for Windows targets
- Generates Windows-specific binaries
- Creates the missing `default.js` and `default.d.ts` files
- Verifies the setup before building

### 2. **Dynamic Prisma Client Loader** (`src/main/utils/prisma-client-loader.ts`)
- Dynamically locates and loads Prisma Client based on platform
- Handles both development and production environments
- Provides fallback mechanisms for different installation paths
- Manages database file locations across platforms

### 3. **Updated Build Configuration** (`package.json`)
- Modified build scripts to run preparation before Windows builds
- Enhanced electron-builder configuration to properly package Prisma files
- Added `asarUnpack` directives for native modules
- Configured `extraFiles` to include all necessary Prisma components

### 4. **Improved Database Initialization** (`src/main/database.ts`)
- Dynamic PrismaClient loading with fallback support
- Platform-specific database path resolution
- Better error handling and logging

## How to Build for Windows from macOS

### Prerequisites
1. Ensure Node.js 18+ is installed
2. Install all dependencies: `npm install`
3. Generate Prisma client: `npx prisma generate`

### Building

#### For Windows 64-bit:
```bash
npm run build:win64
```

#### For Windows 32-bit:
```bash
npm run build:win32
```

#### For All Windows Architectures:
```bash
npm run build:win:all
```

### What Happens During Build

1. **Preparation Phase** (`npm run prepare:windows`):
   - Cleans previous build artifacts
   - Updates Prisma schema with Windows binary targets
   - Generates Prisma Client with Windows binaries
   - Creates required default export files
   - Sets up files for Electron Builder
   - Verifies the setup

2. **Build Phase**:
   - Compiles TypeScript and bundles with Vite
   - Electron Builder packages the app
   - Includes all Prisma files in `app.asar.unpacked`
   - Copies database file to resources
   - Creates NSIS installer

3. **Runtime**:
   - App dynamically finds Prisma Client
   - Initializes database in user's AppData folder
   - Copies initial database if needed

## File Structure in Windows Build

```
Thaziri/
├── resources/
│   ├── app.asar                    # Main application bundle
│   ├── app.asar.unpacked/          # Native modules
│   │   └── node_modules/
│   │       ├── .prisma/
│   │       │   └── client/
│   │       │       ├── index.js
│   │       │       ├── schema.prisma
│   │       │       └── query_engine-windows.dll.node
│   │       └── @prisma/
│   │           └── client/
│   │               ├── index.js
│   │               ├── default.js  # Created by our script
│   │               └── default.d.ts
│   └── prisma/
│       └── dev.db                  # Initial database
└── Thaziri.exe                     # Main executable
```

## Database Location on Windows

The database is stored in:
```
C:\Users\[Username]\AppData\Roaming\Thaziri\database\thaziri.db
```

## Troubleshooting

### If build fails:

1. **Clean and rebuild**:
```bash
rm -rf node_modules dist dist-electron release
npm install
npm run prepare:windows
npm run build:win64
```

2. **Check Prisma generation**:
```bash
npx prisma generate
ls node_modules/.prisma/client/
```

3. **Verify Windows binaries exist**:
```bash
ls node_modules/.prisma/client/*.node
# Should show query_engine-windows.dll.node
```

### If runtime error persists:

1. Check the installer log in:
   - `C:\Users\[Username]\AppData\Local\Temp\` (look for Thaziri logs)

2. Verify installation directory:
   - 32-bit: `C:\Program Files (x86)\Thaziri\`
   - 64-bit: `C:\Program Files\Thaziri\`

3. Check if files exist:
   - `resources\app.asar.unpacked\node_modules\.prisma\client\`
   - `resources\app.asar.unpacked\node_modules\@prisma\client\default.js`

## Testing on Windows

1. Install the generated `.exe` file from `release/1.0.0/`
2. Run as Administrator (required for first installation)
3. Check application logs for any Prisma-related errors
4. Verify database operations work correctly

## Important Notes

- **Always run `npm run prepare:windows` before building for Windows**
- The prepare script is idempotent and can be run multiple times safely
- Windows builds from macOS require the preparation step to include Windows binaries
- The application requires Administrator privileges on first run to set up the database

## Alternative Approach (If Issues Persist)

If building from macOS continues to have issues, consider:

1. **Using GitHub Actions for CI/CD**:
   - Build on actual Windows runners
   - Automatically generates correct binaries
   - See `.github/workflows/build.yml` for setup

2. **Using a Windows VM**:
   - Install Windows in VirtualBox/VMware
   - Clone repository and build natively
   - Guarantees 100% compatibility

3. **Docker with Wine**:
   - Use electron-builder Docker image
   - Build Windows apps in containerized environment

## Success Verification

After installation on Windows, the app should:
- ✅ Launch without Prisma errors
- ✅ Connect to SQLite database
- ✅ Perform all database operations
- ✅ Store data persistently in AppData folder
- ✅ Handle multiple user sessions

---

## Commands Summary

```bash
# Prepare for Windows build (REQUIRED)
npm run prepare:windows

# Build options
npm run build:win64    # 64-bit only
npm run build:win32    # 32-bit only
npm run build:win:all  # Both architectures

# Clean build (if issues)
rm -rf node_modules dist dist-electron release
npm install
npm run prepare:windows
npm run build:win64
```

This solution ensures that your Electron app with Prisma works correctly when built on macOS for Windows deployment.
