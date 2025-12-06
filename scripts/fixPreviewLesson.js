// // scripts/fixPreviewLesson.js
// import db from "../models/index.js";
// import { fileURLToPath } from "url";
// import { dirname } from "path";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const { Course, Lesson } = db;

// const fixPreviewLesson = async () => {
//   try {
//     console.log("🔧 Fixing preview lesson for course 84...");

//     // First, check course 84
//     const course = await Course.findByPk(84);
//     if (!course) {
//       console.log("❌ Course 84 not found!");
//       return;
//     }

//     console.log("✅ Found course:", course.title);

//     // Check all lessons for this course
//     const lessons = await Lesson.findAll({
//       where: { course_id: 84 },
//       order: [["order_index", "ASC"]],
//     });

//     console.log(`📚 Total lessons for course 84: ${lessons.length}`);

//     // List all lessons
//     lessons.forEach((lesson, index) => {
//       console.log(
//         `${index + 1}. ${lesson.title} (ID: ${lesson.id}, Preview: ${
//           lesson.is_preview
//         })`
//       );
//       console.log(`   File URL: ${lesson.file_url}`);
//       console.log(`   Video URL: ${lesson.video_url}`);
//     });

//     // Find the first lesson and mark it as preview
//     if (lessons.length > 0) {
//       const firstLesson = lessons[0];
//       console.log(`\n🎯 Setting first lesson as preview: ${firstLesson.title}`);

//       // Update the lesson to be a preview
//       await firstLesson.update({
//         is_preview: true,
//         file_url: firstLesson.file_url || "/Uploads/sample-lesson.pdf",
//       });

//       console.log("✅ Updated lesson to be preview!");
//       console.log("New file_url:", firstLesson.file_url);
//       console.log("is_preview:", firstLesson.is_preview);
//     }

//     // Verify the fix
//     const previewLesson = await Lesson.findOne({
//       where: {
//         course_id: 84,
//         is_preview: true,
//       },
//     });

//     if (previewLesson) {
//       console.log("\n✅ Preview lesson is now set:");
//       console.log("- ID:", previewLesson.id);
//       console.log("- Title:", previewLesson.title);
//       console.log("- File URL:", previewLesson.file_url);
//     } else {
//       console.log("\n❌ Still no preview lesson found!");
//     }

//     process.exit(0);
//   } catch (error) {
//     console.error("❌ Error fixing preview lesson:", error);
//     process.exit(1);
//   }
// };

// fixPreviewLesson();





import db from "../models/index.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Course, Lesson } = db;

const fixPreviewLesson = async () => {
  try {
    console.log("🔧 Fixing preview lesson for course 84...");

    // Test database connection first
    await db.sequelize.authenticate();
    console.log("✅ Database connected");

    // First, check course 84
    const course = await Course.findByPk(84);
    if (!course) {
      console.log("❌ Course 84 not found!");
      return;
    }

    console.log("✅ Found course:", course.title);

    // Check all lessons for this course
    const lessons = await Lesson.findAll({
      where: { course_id: 84 },
      order: [["order_index", "ASC"]],
    });

    console.log(`📚 Total lessons for course 84: ${lessons.length}`);

    // List all lessons
    console.log("\n📋 All lessons for course 84:");
    lessons.forEach((lesson, index) => {
      console.log(`${index + 1}. ${lesson.title}`);
      console.log(`   ID: ${lesson.id}`);
      console.log(`   Preview: ${lesson.is_preview}`);
      console.log(`   File URL: ${lesson.file_url}`);
      console.log(`   Video URL: ${lesson.video_url}`);
      console.log(`   Order: ${lesson.order_index}`);
      console.log(`   Content Type: ${lesson.content_type}`);
      console.log("---");
    });

    // Check if any lesson is marked as preview
    const previewLessons = lessons.filter((l) => l.is_preview);
    console.log(`\n🔍 Lessons marked as preview: ${previewLessons.length}`);

    if (previewLessons.length === 0 && lessons.length > 0) {
      const firstLesson = lessons[0];
      console.log(
        `\n🎯 No preview lesson found. Setting first lesson as preview: ${firstLesson.title}`
      );

      // Update the lesson to be a preview
      await firstLesson.update({
        is_preview: true,
      });

      console.log("✅ Updated lesson to be preview!");
      console.log("Lesson ID:", firstLesson.id);
      console.log("is_preview:", firstLesson.is_preview);

      // Check if file_url is empty and set a default
      if (!firstLesson.file_url || firstLesson.file_url.trim() === "") {
        console.log("⚠️ File URL is empty, setting default...");
        await firstLesson.update({
          file_url: "/Uploads/sample-lesson.pdf",
          content_type: "pdf",
        });
        console.log("✅ Set default file URL: /Uploads/sample-lesson.pdf");
      }
    } else if (previewLessons.length > 0) {
      console.log("\n✅ Preview lesson(s) already exist:");
      previewLessons.forEach((lesson, index) => {
        console.log(`${index + 1}. ${lesson.title} (ID: ${lesson.id})`);

        // Fix empty file URLs
        if (!lesson.file_url || lesson.file_url.trim() === "") {
          console.log(`   ⚠️ Empty file URL, fixing...`);
          lesson.update({
            file_url: "/Uploads/sample-lesson.pdf",
            content_type: "pdf",
          });
          console.log(`   ✅ Set file URL: /Uploads/sample-lesson.pdf`);
        }
      });
    }

    // Verify the fix
    const updatedPreviewLesson = await Lesson.findOne({
      where: {
        course_id: 84,
        is_preview: true,
      },
    });

    if (updatedPreviewLesson) {
      console.log("\n✅ Preview lesson is now set:");
      console.log("- ID:", updatedPreviewLesson.id);
      console.log("- Title:", updatedPreviewLesson.title);
      console.log("- File URL:", updatedPreviewLesson.file_url);
      console.log("- Is Preview:", updatedPreviewLesson.is_preview);
    } else {
      console.log("\n❌ Still no preview lesson found!");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing preview lesson:", error);
    console.error("Error details:", error.message);
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
    process.exit(1);
  }
};

// Run the script
fixPreviewLesson();