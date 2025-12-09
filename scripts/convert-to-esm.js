// convert-to-esm.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const directories = [
  'middleware',
  'utils',
  'controllers',
  'models'
];

const convertFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already has ES module imports
  if (content.includes('import ') || content.includes('export default')) {
    return false;
  }
  
  let changed = false;
  
  // Convert require() to import
  const requireRegex = /const\s+([\w{}, ]+)\s*=\s*require\(['"]([^'"]+)['"]\)/g;
  content = content.replace(requireRegex, (match, imports, modulePath) => {
    changed = true;
    if (imports.includes('{')) {
      return `import ${imports} from "${modulePath}";`;
    } else {
      return `import ${imports} from "${modulePath}";`;
    }
  });
  
  // Convert module.exports to export
  content = content.replace(/module\.exports\s*=\s*([^;]+);/g, (match, exportValue) => {
    changed = true;
    return `export default ${exportValue};`;
  });
  
  // Convert exports.xxx = 
  content = content.replace(/exports\.(\w+)\s*=\s*/g, (match, exportName) => {
    changed = true;
    return `export const ${exportName} = `;
  });
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Converted: ${path.relative(process.cwd(), filePath)}`);
    return true;
  }
  
  return false;
};

console.log('🔄 Converting CommonJS to ES modules...\n');

let convertedCount = 0;

directories.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      if (file.endsWith('.js')) {
        const filePath = path.join(dirPath, file);
        if (convertFile(filePath)) {
          convertedCount++;
        }
      }
    });
  }
});

console.log(`\n✅ Converted ${convertedCount} files to ES modules!`);