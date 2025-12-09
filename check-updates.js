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