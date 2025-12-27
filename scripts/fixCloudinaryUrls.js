// scripts/fixCloudinaryUrls.js
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const cloudinary = require("cloudinary").v2;
import db from "../models/index.js";

const { Lesson, sequelize } = db;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

console.log("🔄 Fixing Cloudinary URLs in database...");

const fixCloudinaryUrls = async () => {
  try {
    // Get all lessons with Cloudinary URLs
    const lessons = await Lesson.findAll({
      where: {
        file_url: {
          [db.Sequelize.Op.like]: '%cloudinary.com%'
        }
      }
    });

    console.log(`📊 Found ${lessons.length} lessons with Cloudinary URLs`);

    let fixedCount = 0;
    
    for (const lesson of lessons) {
      const oldUrl = lesson.file_url;
      
      // Fix the URL if needed
      let newUrl = oldUrl;
      
      if (oldUrl.includes('/image/upload/') && 
          (oldUrl.includes('.pdf') || oldUrl.includes('/pdfs/'))) {
        newUrl = oldUrl.replace('/image/upload/', '/raw/upload/');
      }
      
      if (newUrl !== oldUrl) {
        await lesson.update({ file_url: newUrl });
        fixedCount++;
        console.log(`✅ Fixed lesson ${lesson.id}: ${oldUrl.substring(0, 80)}... -> ${newUrl.substring(0, 80)}...`);
      }
    }

    console.log(`\n📈 SUMMARY:`);
    console.log(`✅ Fixed ${fixedCount} out of ${lessons.length} Cloudinary URLs`);
    
  } catch (error) {
    console.error("❌ Error fixing Cloudinary URLs:", error);
  } finally {
    await sequelize.close();
    console.log("Database connection closed");
    process.exit(0);
  }
};

// Run the fix
fixCloudinaryUrls();