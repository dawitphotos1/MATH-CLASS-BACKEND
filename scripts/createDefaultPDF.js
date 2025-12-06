// // scripts/createDefaultPDF.js
// import fs from "fs";
// import path from "path";

// const uploadsDir = path.join(process.cwd(), "Uploads");
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }

// // Create a simple PDF or text file for testing
// const defaultFiles = [
//   {
//     name: "Examples-1764983251988.pdf",
//     content: "This is a sample PDF file for preview.",
//   },
//   { name: "sample-lesson.pdf", content: "Sample lesson content for preview." },
//   { name: "default-course.jpg", content: "Default course thumbnail" },
// ];

// defaultFiles.forEach((file) => {
//   const filePath = path.join(uploadsDir, file.name);
//   if (!fs.existsSync(filePath)) {
//     fs.writeFileSync(filePath, file.content);
//     console.log(`Created: ${file.name}`);
//   }
// });





// scripts/createDefaultPDF.js
import fs from 'fs';
import path from 'path';

const uploadsDir = path.join(process.cwd(), "Uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create a simple PDF or text file for testing
const defaultFiles = [
    { name: "Examples-1764983251988.pdf", content: "This is a sample PDF file for preview." },
    { name: "sample-lesson.pdf", content: "Sample lesson content for preview." },
    { name: "default-course.jpg", content: "Default course thumbnail" }
];

defaultFiles.forEach(file => {
    const filePath = path.join(uploadsDir, file.name);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, file.content);
        console.log(`Created: ${file.name}`);
    }
});