// // scripts/addPreviewLessons.js
// import db from "../models/index.js";

// const { Lesson } = db;

// const addPreviewLessons = async () => {
//   try {
//     console.log("🔄 Adding preview lessons to courses...");

//     // Get all courses
//     const courses = await db.Course.findAll();

//     for (const course of courses) {
//       console.log(`\n📚 Processing course: ${course.title} (ID: ${course.id})`);

//       // Get the first lesson for this course
//       const firstLesson = await Lesson.findOne({
//         where: { course_id: course.id },
//         order: [["order_index", "ASC"]],
//       });

//       if (firstLesson) {
//         // Mark the first lesson as preview
//         firstLesson.is_preview = true;
//         await firstLesson.save();
//         console.log(`✅ Marked as preview: "${firstLesson.title}"`);
//       } else {
//         console.log(`❌ No lessons found for course: ${course.title}`);
//       }
//     }

//     console.log("\n🎉 Preview lessons added successfully!");
//     process.exit(0);
//   } catch (error) {
//     console.error("❌ Error adding preview lessons:", error);
//     process.exit(1);
//   }
// };

// addPreviewLessons();





// scripts/addPreviewLessons.js
import db from "../models/index.js";

const { Lesson } = db;

const addPreviewLessons = async () => {
  try {
    console.log("🔄 Adding preview lessons to courses...");

    // Get all courses
    const courses = await db.Course.findAll();
    
    for (const course of courses) {
      console.log(`\n📚 Processing course: ${course.title} (ID: ${course.id})`);
      
      // Get the first lesson for this course
      const firstLesson = await Lesson.findOne({
        where: { course_id: course.id },
        order: [["order_index", "ASC"]]
      });

      if (firstLesson) {
        // Mark the first lesson as preview
        firstLesson.is_preview = true;
        await firstLesson.save();
        console.log(`✅ Marked as preview: "${firstLesson.title}"`);
      } else {
        console.log(`❌ No lessons found for course: ${course.title}`);
      }
    }

    console.log("\n🎉 Preview lessons added successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding preview lessons:", error);
    process.exit(1);
  }
};

addPreviewLessons();