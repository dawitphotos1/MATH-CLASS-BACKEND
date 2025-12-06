// // scripts/createUploadsDir.js
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const uploadsDir = path.join(__dirname, "../Uploads");

// try {
//   if (!fs.existsSync(uploadsDir)) {
//     fs.mkdirSync(uploadsDir, { recursive: true });
//     console.log("✅ Uploads directory created successfully");
//   } else {
//     console.log("✅ Uploads directory already exists");
//   }
// } catch (error) {
//   console.error("❌ Error creating uploads directory:", error);
// }





import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define all possible upload directory locations
const possibleUploadDirs = [
  path.join(process.cwd(), "Uploads"),
  path.join(__dirname, "..", "Uploads"),
  path.join("/opt/render/project/src", "Uploads"),
  path.join("/tmp", "Uploads"),
  path.join("/var/tmp", "Uploads"),
  path.join("/home/ubuntu", "Uploads"), // For Ubuntu servers
];

// Sample files to create for testing
const sampleFiles = [
  {
    name: "Examples-1764983251988.pdf",
    content: "Sample PDF content for Examples lesson",
  },
  { name: "sample-lesson.pdf", content: "Sample lesson PDF content" },
  { name: "default-course.jpg", content: "Default course thumbnail image" },
  { name: "sample-video.mp4", content: "Sample video placeholder" },
  {
    name: "README.txt",
    content:
      "This is the Uploads directory for Math Class Platform\n\nStore all course files here: PDFs, videos, images, etc.\n\nDirectory created on: " +
      new Date().toISOString(),
  },
];

console.log("🚀 Creating/Verifying Uploads Directories...");
console.log("==============================================");

let createdDirs = 0;
let createdFiles = 0;

// Create all possible upload directories
possibleUploadDirs.forEach((dir) => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
      createdDirs++;

      // Create sample files in this directory
      sampleFiles.forEach((file) => {
        const filePath = path.join(dir, file.name);
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, file.content);
          console.log(`   📄 Created sample file: ${file.name}`);
          createdFiles++;
        }
      });
    } else {
      console.log(`📁 Directory already exists: ${dir}`);

      // Check and create missing sample files
      sampleFiles.forEach((file) => {
        const filePath = path.join(dir, file.name);
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, file.content);
          console.log(`   📄 Added missing sample file: ${file.name}`);
          createdFiles++;
        }
      });
    }
  } catch (error) {
    console.error(`❌ Error with directory ${dir}:`, error.message);
  }
});

console.log("==============================================");
console.log(`📊 Summary:`);
console.log(`   Directories checked: ${possibleUploadDirs.length}`);
console.log(`   Directories created: ${createdDirs}`);
console.log(`   Sample files created: ${createdFiles}`);
console.log("==============================================");

// Set permissions on the current working directory Uploads folder
const mainUploadsDir = possibleUploadDirs[0];
try {
  if (fs.existsSync(mainUploadsDir)) {
    // Try to set permissions (this might not work on all systems)
    if (process.platform !== "win32") {
      try {
        fs.chmodSync(mainUploadsDir, 0o755); // Read/Write/Execute for owner, Read/Execute for others
        console.log(`🔒 Set permissions on: ${mainUploadsDir}`);
      } catch (permError) {
        // Ignore permission errors
      }
    }

    // List contents of the main uploads directory
    const files = fs.readdirSync(mainUploadsDir);
    console.log(`📂 Contents of ${mainUploadsDir}:`);
    files.forEach((file) => {
      const filePath = path.join(mainUploadsDir, file);
      const stats = fs.statSync(filePath);
      console.log(`   - ${file} (${stats.size} bytes)`);
    });
  }
} catch (error) {
  console.error(`❌ Error checking directory contents:`, error.message);
}

console.log("✅ Uploads directory setup complete!");