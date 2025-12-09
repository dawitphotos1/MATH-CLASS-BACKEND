// // fix-imports.js
// import fs from "fs";
// import path from "path";

// const filesToCheck = [
//   "controllers/authController.js",
//   "controllers/adminController.js",
//   "controllers/enrollmentController.js",
//   "controllers/paymentController.js",
//   "controllers/stripeWebhookController.js",
//   "controllers/emailController.js",
//   "utils/sendEmail.js",
// ];

// console.log("🔍 Fixing ES module imports...\n");

// filesToCheck.forEach((file) => {
//   const filePath = path.join(process.cwd(), file);

//   if (fs.existsSync(filePath)) {
//     console.log(`📄 Checking: ${file}`);

//     let content = fs.readFileSync(filePath, "utf8");

//     // Check if it's ES module
//     if (content.includes("import ") || content.includes("export ")) {
//       console.log(`   ✅ Already ES module`);
//     } else if (
//       content.includes("require(") ||
//       content.includes("module.exports")
//     ) {
//       console.log(`   ⚠️  CommonJS - needs conversion`);

//       // Convert CommonJS to ES module
//       content = content.replace(
//         /const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\)/g,
//         'import $1 from "$2"'
//       );
//       content = content.replace(
//         /module\.exports\s*=\s*([^;]+);/g,
//         "export default $1"
//       );
//       content = content.replace(
//         /exports\.(\w+)\s*=\s*([^;]+);/g,
//         "export const $1 = $2"
//       );

//       fs.writeFileSync(filePath, content);
//       console.log(`   🔄 Converted to ES module`);
//     }
//   } else {
//     console.log(`❌ File not found: ${file}`);
//   }
// });

// console.log("\n✅ Import fixes complete!");





// fix-imports.js
import fs from 'fs';
import path from 'path';

const filesToCheck = [
  'controllers/authController.js',
  'controllers/adminController.js',
  'controllers/enrollmentController.js',
  'controllers/paymentController.js',
  'controllers/stripeWebhookController.js',
  'controllers/emailController.js',
  'utils/sendEmail.js'
];

console.log('🔍 Fixing ES module imports...\n');

filesToCheck.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  
  if (fs.existsSync(filePath)) {
    console.log(`📄 Checking: ${file}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if it's ES module
    if (content.includes('import ') || content.includes('export ')) {
      console.log(`   ✅ Already ES module`);
    } else if (content.includes('require(') || content.includes('module.exports')) {
      console.log(`   ⚠️  CommonJS - needs conversion`);
      
      // Convert CommonJS to ES module
      content = content.replace(/const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\)/g, 'import $1 from "$2"');
      content = content.replace(/module\.exports\s*=\s*([^;]+);/g, 'export default $1');
      content = content.replace(/exports\.(\w+)\s*=\s*([^;]+);/g, 'export const $1 = $2');
      
      fs.writeFileSync(filePath, content);
      console.log(`   🔄 Converted to ES module`);
    }
  } else {
    console.log(`❌ File not found: ${file}`);
  }
});

console.log('\n✅ Import fixes complete!');