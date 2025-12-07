// // scripts/fixCloudinaryUrls.js
// import db from "../models/index.js";

// const { Lesson } = db;

// const fixCloudinaryUrls = async () => {
//   console.log("🔧 Fixing Cloudinary URLs for PDFs...\n");

//   // Find all PDF files with wrong Cloudinary URLs
//   const lessons = await Lesson.findAll({
//     where: {
//       file_url: {
//         [db.Sequelize.Op.like]: "%cloudinary%",
//         [db.Sequelize.Op.like]: "%/image/%", // Wrong: image instead of raw
//       },
//     },
//   });

//   console.log(`Found ${lessons.length} lessons with potentially wrong URLs\n`);

//   for (const lesson of lessons) {
//     const oldUrl = lesson.file_url;

//     // Convert /image/upload/ to /raw/upload/ for PDFs
//     if (
//       oldUrl.includes("/image/upload/") &&
//       oldUrl.toLowerCase().includes(".pdf")
//     ) {
//       const newUrl = oldUrl.replace("/image/upload/", "/raw/upload/");

//       console.log(`📝 Lesson ${lesson.id}: ${lesson.title}`);
//       console.log(`   OLD: ${oldUrl.substring(0, 80)}...`);
//       console.log(`   NEW: ${newUrl.substring(0, 80)}...`);

//       // Uncomment to actually update
//       // await lesson.update({ file_url: newUrl });
//       // console.log(`   ✅ Updated!`);
//     }
//   }

//   console.log("\n✅ URL check completed");
//   console.log("💡 To apply fixes, uncomment the update line in the script");

//   await db.sequelize.close();
//   process.exit(0);
// };

// fixCloudinaryUrls();





// scripts/fixCloudinaryUrls.js
import db from '../models/index.js';

const { Lesson } = db;

const fixCloudinaryUrls = async () => {
  console.log('🔧 Fixing Cloudinary URLs for PDFs...\n');
  
  // Find all PDF files with wrong Cloudinary URLs
  const lessons = await Lesson.findAll({
    where: { 
      file_url: { 
        [db.Sequelize.Op.like]: '%cloudinary%',
        [db.Sequelize.Op.like]: '%/image/%'  // Wrong: image instead of raw
      } 
    }
  });
  
  console.log(`Found ${lessons.length} lessons with potentially wrong URLs\n`);
  
  for (const lesson of lessons) {
    const oldUrl = lesson.file_url;
    
    // Convert /image/upload/ to /raw/upload/ for PDFs
    if (oldUrl.includes('/image/upload/') && oldUrl.toLowerCase().includes('.pdf')) {
      const newUrl = oldUrl.replace('/image/upload/', '/raw/upload/');
      
      console.log(`📝 Lesson ${lesson.id}: ${lesson.title}`);
      console.log(`   OLD: ${oldUrl.substring(0, 80)}...`);
      console.log(`   NEW: ${newUrl.substring(0, 80)}...`);
      
      // Uncomment to actually update
      // await lesson.update({ file_url: newUrl });
      // console.log(`   ✅ Updated!`);
    }
  }
  
  console.log('\n✅ URL check completed');
  console.log('💡 To apply fixes, uncomment the update line in the script');
  
  await db.sequelize.close();
  process.exit(0);
};

fixCloudinaryUrls();