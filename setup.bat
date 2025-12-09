@echo off
echo ============================================
echo   Math Class Platform - Cloudinary Setup
echo ============================================
echo.

echo 📦 Step 1: Checking current setup...
echo.

:: Check if we're in the right directory
if not exist "package.json" (
    echo ❌ ERROR: Not in backend directory!
    echo    Please run this script from your backend folder.
    echo    Current directory: %cd%
    echo.
    pause
    exit /b 1
)

echo ✅ Found package.json in: %cd%
echo.

echo 📁 Step 2: Creating check-updates.js...
echo.

:: Create check-updates.js
echo const fs = require('fs');> check-updates.js
echo const path = require('path');>> check-updates.js
echo.>> check-updates.js
echo console.log('🔍 Checking upload middleware updates...\n');>> check-updates.js
echo.>> check-updates.js
echo const filesToCheck = [>> check-updates.js
echo   {>> check-updates.js
echo     path: 'middleware/cloudinaryUpload.js',>> check-updates.js
echo     description: 'Cloudinary upload middleware'>> check-updates.js
echo   },>> check-updates.js
echo   {>> check-updates.js
echo     path: 'routes/courseRoutes.js',>> check-updates.js
echo     description: 'Course routes'>> check-updates.js
echo   },>> check-updates.js
echo   {>> check-updates.js
echo     path: 'routes/courses.js',>> check-updates.js
echo     description: 'Courses routes (ESM)'>> check-updates.js
echo   },>> check-updates.js
echo   {>> check-updates.js
echo     path: 'routes/lessonRoutes.js',>> check-updates.js
echo     description: 'Lesson routes'>> check-updates.js
echo   },>> check-updates.js
echo   {>> check-updates.js
echo     path: 'routes/upload.js',>> check-updates.js
echo     description: 'Upload route'>> check-updates.js
echo   }>> check-updates.js
echo ];>> check-updates.js
echo.>> check-updates.js
echo console.log('📁 Checking file existence:');>> check-updates.js
echo console.log('='.repeat(50));>> check-updates.js
echo.>> check-updates.js
echo let allExist = true;>> check-updates.js
echo.>> check-updates.js
echo filesToCheck.forEach(file => {>> check-updates.js
echo   const filePath = path.join(process.cwd(), file.path);>> check-updates.js
echo   const exists = fs.existsSync(filePath);>> check-updates.js
echo.>> check-updates.js
echo   console.log(\`\${exists ? '✅' : '❌'} \${file.description}:\`);>> check-updates.js
echo   console.log(\`  Path: \${file.path}\`);>> check-updates.js
echo   console.log(\`  Exists: \${exists ? 'Yes' : 'No'}\`);>> check-updates.js
echo.>> check-updates.js
echo   if (exists) {>> check-updates.js
echo     const content = fs.readFileSync(filePath, 'utf8');>> check-updates.js
echo     const usesCloudinary = content.includes('cloudinaryUpload') || content.includes('uploadToCloudinary');>> check-updates.js
echo     const usesLocal = content.includes('multer.diskStorage') || content.includes('Uploads');>> check-updates.js
echo.>> check-updates.js
echo     console.log(\`  Uses Cloudinary: \${usesCloudinary ? '✅' : '❌'}\`);>> check-updates.js
echo     console.log(\`  Uses Local Storage: \${usesLocal ? '⚠️' : '✅'}\`);>> check-updates.js
echo.>> check-updates.js
echo     if (usesLocal) {>> check-updates.js
echo       console.log('  ⚠️  Warning: Contains local storage code');>> check-updates.js
echo     }>> check-updates.js
echo   } else {>> check-updates.js
echo     allExist = false;>> check-updates.js
echo   }>> check-updates.js
echo.>> check-updates.js
echo   console.log('');>> check-updates.js
echo });>> check-updates.js
echo.>> check-updates.js
echo console.log('📦 Checking package.json dependencies...');>> check-updates.js
echo console.log('='.repeat(50));>> check-updates.js
echo.>> check-updates.js
echo const packagePath = path.join(process.cwd(), 'package.json');>> check-updates.js
echo if (fs.existsSync(packagePath)) {>> check-updates.js
echo   const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));>> check-updates.js
echo   const dependencies = packageJson.dependencies || {};>> check-updates.js
echo.>> check-updates.js
echo   const requiredPackages = [>> check-updates.js
echo     'nodemailer',>> check-updates.js
echo     'cloudinary',>> check-updates.js
echo     'streamifier',>> check-updates.js
echo     'multer'>> check-updates.js
echo   ];>> check-updates.js
echo.>> check-updates.js
echo   requiredPackages.forEach(pkg => {>> check-updates.js
echo     const hasPackage = dependencies[pkg];>> check-updates.js
echo     console.log(\`\${hasPackage ? '✅' : '❌'} \${pkg}: \${hasPackage ? \`v\${dependencies[pkg].replace(/[^\d.]/g, '')}\` : 'Missing'}\`);>> check-updates.js
echo   });>> check-updates.js
echo } else {>> check-updates.js
echo   console.log('❌ package.json not found');>> check-updates.js
echo   allExist = false;>> check-updates.js
echo }>> check-updates.js
echo.>> check-updates.js
echo console.log('\n📋 Summary:');>> check-updates.js
echo console.log('='.repeat(50));>> check-updates.js
echo.>> check-updates.js
echo if (allExist) {>> check-updates.js
echo   console.log('✅ All files exist!');>> check-updates.js
echo   console.log('🚀 You can now run: nodemon server.js');>> check-updates.js
echo } else {>> check-updates.js
echo   console.log('❌ Some files are missing or need updates.');>> check-updates.js
echo   console.log('\n💡 Next steps:');>> check-updates.js
echo   echo '1. Create any missing files listed above';>> check-updates.js
echo   echo '2. Install missing packages: npm install nodemailer cloudinary streamifier multer';>> check-updates.js
echo   echo '3. Update your .env file with Cloudinary credentials';>> check-updates.js
echo   echo '4. Run: node check-updates.js again to verify';>> check-updates.js
echo }>> check-updates.js
echo.>> check-updates.js
echo console.log('\n⚙️  Environment check:');>> check-updates.js
echo console.log('='.repeat(50));>> check-updates.js
echo.>> check-updates.js
echo :: Check for .env file>> check-updates.js
echo const envPath = path.join(process.cwd(), '.env');>> check-updates.js
echo if (fs.existsSync(envPath)) {>> check-updates.js
echo   const envContent = fs.readFileSync(envPath, 'utf8');>> check-updates.js
echo   const hasCloudinary = envContent.includes('CLOUDINARY_');>> check-updates.js
echo   const hasEmail = envContent.includes('MAIL_');>> check-updates.js
echo.>> check-updates.js
echo   console.log(\`✅ .env file exists\`);>> check-updates.js
echo   console.log(\`   Cloudinary config: \${hasCloudinary ? '✅' : '❌'}\`);>> check-updates.js
echo   console.log(\`   Email config: \${hasEmail ? '✅' : '❌'}\`);>> check-updates.js
echo } else {>> check-updates.js
echo   console.log('❌ .env file not found');>> check-updates.js
echo   console.log('   Create a .env file with your Cloudinary and email credentials');>> check-updates.js
echo }>> check-updates.js
echo.>> check-updates.js
echo console.log('\n✅ Check complete!');>> check-updates.js

echo ✅ Created check-updates.js
echo.

echo 📦 Step 3: Checking current setup...
echo.

node check-updates.js

echo.
echo 📦 Step 4: Installing required packages...
echo.

echo Installing nodemailer...
call npm install nodemailer

echo Installing cloudinary...
call npm install cloudinary

echo Installing streamifier...
call npm install streamifier

echo Installing multer...
call npm install multer

echo.
echo 📦 Step 5: Final verification...
echo.

node check-updates.js

echo.
echo ============================================
echo   ✅ SETUP COMPLETE!
echo ============================================
echo.
echo Next steps:
echo 1. Make sure your .env file has Cloudinary credentials
echo 2. Update your controllers to use Cloudinary (if needed)
echo 3. Run: nodemon server.js
echo.
pause