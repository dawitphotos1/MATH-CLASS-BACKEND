
// verify-updates.js
import fs from 'fs';
import path from 'path';

console.log('🔍 Verifying upload middleware updates...\n');

const filesToCheck = [
  'routes/courses.js',
  'routes/lessonRoutes.js',
  'routes/courseRoutes.js',
  'routes/upload.js'
];

filesToCheck.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const usesOldMiddleware = content.includes('uploadMiddleware');
    const usesNewMiddleware = content.includes('cloudinaryUpload');
    
    console.log(`${file}:`);
    console.log(`  Uses old middleware: ${usesOldMiddleware ? '❌' : '✅'}`);
    console.log(`  Uses new middleware: ${usesNewMiddleware ? '✅' : '❌'}`);
    console.log('');
  } else {
    console.log(`${file}: ❌ File not found\n`);
  }
});

console.log('📝 Check complete!');