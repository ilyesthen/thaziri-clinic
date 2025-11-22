#!/bin/bash

# Windows Build Script for Thaziri
# This script builds a Windows installer with the database pre-populated
# Run from macOS to create a Windows installer

set -e  # Exit on error

echo "🪟 Starting Windows Build Process..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if database exists
DB_PATH="./prisma/dev.db"
if [ ! -f "$DB_PATH" ]; then
    echo -e "${RED}❌ Error: Database not found at $DB_PATH${NC}"
    echo "Please ensure the database exists before building."
    exit 1
fi

# Check database size
DB_SIZE=$(du -h "$DB_PATH" | cut -f1)
echo -e "${GREEN}✅ Database found: $DB_SIZE${NC}"

# Count records in database (optional)
echo ""
echo "📊 Database Statistics:"
echo "----------------------"
DB_STATS=$(sqlite3 "$DB_PATH" "
SELECT 
  (SELECT COUNT(*) FROM Patient) as patients,
  (SELECT COUNT(*) FROM visit_examinations) as visits,
  (SELECT COUNT(*) FROM ordonnances) as prescriptions,
  (SELECT COUNT(*) FROM medicines) as medicines,
  (SELECT COUNT(*) FROM User) as users;
" 2>/dev/null || echo "0|0|0|0|0")

IFS='|' read -r PATIENTS VISITS PRESCRIPTIONS MEDICINES USERS <<< "$DB_STATS"
echo "  👥 Patients: $PATIENTS"
echo "  📋 Visits: $VISITS"
echo "  💊 Prescriptions: $PRESCRIPTIONS"
echo "  🧪 Medicines: $MEDICINES"
echo "  🔐 Users: $USERS"

echo ""
echo -e "${YELLOW}⚠️  This database will be bundled with the installer${NC}"
echo ""

# Confirm build
read -p "Continue with Windows build? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Build cancelled."
    exit 0
fi

# Check Node.js version
NODE_VERSION=$(node -v)
echo ""
echo "🔧 Build Environment:"
echo "  Node.js: $NODE_VERSION"
echo "  Platform: $(uname -s)"
echo ""

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist dist-electron release/1.0.0/*.exe 2>/dev/null || true

# Ensure build directory exists
mkdir -p build

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Build TypeScript and Vite
echo "🏗️  Building application..."
npm run build

# Build Windows installer with electron-builder
echo "📦 Creating Windows installer..."
echo "   This may take a few minutes..."

# The build command from package.json will:
# 1. Include the prisma directory with dev.db
# 2. Use the NSIS installer script
# 3. Bundle everything into a single .exe installer

if npm run build:win; then
    echo ""
    echo -e "${GREEN}=================================="
    echo "✅ BUILD SUCCESSFUL!"
    echo "==================================${NC}"
    echo ""
    echo "📦 Windows Installer Location:"
    ls -lh release/1.0.0/*.exe 2>/dev/null | awk '{print "   " $9 " (" $5 ")"}'
    echo ""
    echo "📋 What's Included:"
    echo "   ✓ Complete Thaziri application"
    echo "   ✓ Pre-populated database with $PATIENTS patients"
    echo "   ✓ $VISITS visit records"
    echo "   ✓ $PRESCRIPTIONS prescriptions"
    echo "   ✓ $MEDICINES medicines"
    echo "   ✓ All required dependencies"
    echo ""
    echo "🚀 Next Steps:"
    echo "   1. Transfer the .exe file to a Windows PC"
    echo "   2. Run the installer"
    echo "   3. The app will start with all data pre-loaded!"
    echo ""
    echo "ℹ️  Notes:"
    echo "   - Desktop shortcut will be created"
    echo "   - Start menu entry will be added"
    echo "   - Database is in app resources folder"
    echo "   - New data will be added to the existing database"
    echo ""
else
    echo -e "${RED}❌ Build failed. Check the errors above.${NC}"
    exit 1
fi
