// // scripts/fix-cloudinary-urls.js
// import db from "../models/index.js";

// const { Lesson, sequelize } = db;

// const fixCloudinaryUrls = async () => {
//   try {
//     console.log("🔧 Fixing Cloudinary URLs in database...");

//     // Find all lessons with Cloudinary URLs
//     const lessons = await Lesson.findAll({
//       where: {
//         file_url: {
//           [db.Sequelize.Op.like]: "%cloudinary.com%",
//         },
//       },
//     });

//     console.log(`📊 Found ${lessons.length} lessons with Cloudinary URLs`);

//     let fixedCount = 0;

//     for (const lesson of lessons) {
//       const oldUrl = lesson.file_url;
//       let newUrl = oldUrl;

//       // Fix PDF URLs
//       if (
//         oldUrl.includes("/image/upload/") &&
//         (oldUrl.includes(".pdf") || oldUrl.includes("/mathe-class/pdfs/"))
//       ) {
//         newUrl = oldUrl.replace("/image/upload/", "/raw/upload/");
//       }

//       // Fix Office document URLs
//       else if (
//         oldUrl.includes("/image/upload/") &&
//         oldUrl.match(/\.(doc|docx|ppt|pptx|xls|xlsx)(\?|$)/i)
//       ) {
//         newUrl = oldUrl.replace("/image/upload/", "/raw/upload/");
//       }

//       // Update if changed
//       if (newUrl !== oldUrl) {
//         await lesson.update({ file_url: newUrl });
//         fixedCount++;
//         console.log(
//           `✅ Fixed: ${oldUrl.substring(0, 80)}... -> ${newUrl.substring(
//             0,
//             80
//           )}...`
//         );
//       }
//     }

//     console.log(`🎉 Fixed ${fixedCount} Cloudinary URLs`);

//     // Also fix video URLs if needed
//     const videoLessons = await Lesson.findAll({
//       where: {
//         video_url: {
//           [db.Sequelize.Op.like]: "%cloudinary.com/image/upload/%",
//         },
//       },
//     });

//     for (const lesson of videoLessons) {
//       const oldUrl = lesson.video_url;
//       const newUrl = oldUrl.replace("/image/upload/", "/video/upload/");

//       if (newUrl !== oldUrl) {
//         await lesson.update({ video_url: newUrl });
//         console.log(`✅ Fixed video URL: ${oldUrl.substring(0, 80)}...`);
//       }
//     }
//   } catch (error) {
//     console.error("❌ Error fixing URLs:", error);
//   } finally {
//     await sequelize.close();
//     process.exit(0);
//   }
// };

// fixCloudinaryUrls();





// scripts/fix-cloudinary-urls.js
import db from "../models/index.js";

const { Lesson, sequelize } = db;

const fixCloudinaryUrls = async () => {
  try {
    console.log("🔧 Fixing Cloudinary URLs in database...");
    
    // Find all lessons with Cloudinary URLs
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
      let newUrl = oldUrl;
      
      // Fix PDF URLs
      if (oldUrl.includes('/image/upload/') && 
          (oldUrl.includes('.pdf') || oldUrl.includes('/mathe-class/pdfs/'))) {
        newUrl = oldUrl.replace('/image/upload/', '/raw/upload/');
      }
      
      // Fix Office document URLs
      else if (oldUrl.includes('/image/upload/') && 
               oldUrl.match(/\.(doc|docx|ppt|pptx|xls|xlsx)(\?|$)/i)) {
        newUrl = oldUrl.replace('/image/upload/', '/raw/upload/');
      }
      
      // Update if changed
      if (newUrl !== oldUrl) {
        await lesson.update({ file_url: newUrl });
        fixedCount++;
        console.log(`✅ Fixed: ${oldUrl.substring(0, 80)}... -> ${newUrl.substring(0, 80)}...`);
      }
    }
    
    console.log(`🎉 Fixed ${fixedCount} Cloudinary URLs`);
    
    // Also fix video URLs if needed
    const videoLessons = await Lesson.findAll({
      where: {
        video_url: {
          [db.Sequelize.Op.like]: '%cloudinary.com/image/upload/%'
        }
      }
    });
    
    for (const lesson of videoLessons) {
      const oldUrl = lesson.video_url;
      const newUrl = oldUrl.replace('/image/upload/', '/video/upload/');
      
      if (newUrl !== oldUrl) {
        await lesson.update({ video_url: newUrl });
        console.log(`✅ Fixed video URL: ${oldUrl.substring(0, 80)}...`);
      }
    }
    
  } catch (error) {
    console.error("❌ Error fixing URLs:", error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

fixCloudinaryUrls();