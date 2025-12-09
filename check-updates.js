// const fs = require('fs');
// const path = require('path');

// console.log('🔍 Checking upload middleware updates...\n');

// const filesToCheck = [
//   {
//     path: 'middleware/cloudinaryUpload.js',
//     description: 'Cloudinary upload middleware'
//   },
//   {
//     path: 'routes/courseRoutes.js',
//     description: 'Course routes'
//   },
//   {
//     path: 'routes/courses.js',
//     description: 'Courses routes (ESM)'
//   },
//   {
//     path: 'routes/lessonRoutes.js',
//     description: 'Lesson routes'
//   },
//   {
//     path: 'routes/upload.js',
//     description: 'Upload route'
//   }
// ];

// console.log('📁 Checking file existence:');
// console.log('='.repeat(50));

// let allExist = true;

// filesToCheck.forEach(file =
//   const filePath = path.join(process.cwd(), file.path);
//   const exists = fs.existsSync(filePath);

//   console.log(\`\${exists ? '✅' : '❌'} \${file.description}:\`);
//   console.log(\`  Path: \${file.path}\`);
//   console.log(\`  Exists: \${exists ? 'Yes' : 'No'}\`);

//   if (exists) {
//     const content = fs.readFileSync(filePath, 'utf8');

//     console.log(\`  Uses Cloudinary: \${usesCloudinary ? '✅' : '❌'}\`);
//     console.log(\`  Uses Local Storage: \${usesLocal ? '⚠️' : '✅'}\`);

//     if (usesLocal) {
//       console.log('  ⚠️  Warning: Contains local storage code');
//     }
//   } else {
//     allExist = false;
//   }

//   console.log('');
// });

// console.log('📦 Checking package.json dependencies...');
// console.log('='.repeat(50));

// const packagePath = path.join(process.cwd(), 'package.json');
// if (fs.existsSync(packagePath)) {
//   const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

//   const requiredPackages = [
//     'nodemailer',
//     'cloudinary',
//     'streamifier',
//     'multer'
//   ];

//   requiredPackages.forEach(pkg =
//     const hasPackage = dependencies[pkg];
//     console.log(\`\${hasPackage ? '✅' : '❌'} \${pkg}: \${hasPackage ? \`v\${dependencies[pkg].replace(/[\d.]/g, '')}\` : 'Missing'}\`);
//   });
// } else {
//   console.log('❌ package.json not found');
//   allExist = false;
// }

// console.log('\n📋 Summary:');
// console.log('='.repeat(50));

// if (allExist) {
//   console.log('✅ All files exist!');
//   console.log('🚀 You can now run: nodemon server.js');
// } else {
//   console.log('❌ Some files are missing or need updates.');
//   console.log('\n💡 Next steps:');
//   echo '1. Create any missing files listed above';
//   echo '2. Install missing packages: npm install nodemailer cloudinary streamifier multer';
//   echo '3. Update your .env file with Cloudinary credentials';
//   echo '4. Run: node check-updates.js again to verify';
// }

// console.log('\n⚙️  Environment check:');
// console.log('='.repeat(50));

// :: Check for .env file
// const envPath = path.join(process.cwd(), '.env');
// if (fs.existsSync(envPath)) {
//   const envContent = fs.readFileSync(envPath, 'utf8');
//   const hasCloudinary = envContent.includes('CLOUDINARY_');
//   const hasEmail = envContent.includes('MAIL_');

//   console.log(\`✅ .env file exists\`);
//   console.log(\`   Cloudinary config: \${hasCloudinary ? '✅' : '❌'}\`);
//   console.log(\`   Email config: \${hasEmail ? '✅' : '❌'}\`);
// } else {
//   console.log('❌ .env file not found');
//   console.log('   Create a .env file with your Cloudinary and email credentials');
// }

// console.log('\n✅ Check complete!');





// check-updates.js
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking upload middleware updates...\n');

const filesToCheck = [
  'middleware/cloudinaryUpload.js',
  'routes/courseRoutes.js', 
  'routes/courses.js',
  'routes/lessonRoutes.js',
  'routes/upload.js'
];

console.log('📁 Checking file existence:');
console.log('='.repeat(50));

filesToCheck.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

console.log('\n📦 Checking packages...');
console.log('='.repeat(50));

const packagePath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const deps = packageJson.dependencies || {};
  
  ['nodemailer', 'cloudinary', 'streamifier', 'multer'].forEach(pkg => {
    console.log(`${deps[pkg] ? '✅' : '❌'} ${pkg}`);
  });
}

console.log('\n✅ Check complete!');