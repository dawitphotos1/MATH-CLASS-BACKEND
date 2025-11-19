// import db from "../models/index.js";

// const { Course, Unit, Lesson } = db;

// const fixLessonUnitIds = async () => {
//   try {
//     console.log("🔧 Fixing lesson unit_ids...");

//     // Get all courses with units and lessons
//     const courses = await Course.findAll({
//       include: [
//         {
//           model: Unit,
//           as: "units",
//           include: [
//             {
//               model: Lesson,
//               as: "lessons",
//             },
//           ],
//         },
//       ],
//     });

//     let fixedCount = 0;

//     for (const course of courses) {
//       console.log(`\n📘 Processing: ${course.title}`);

//       for (const unit of course.units) {
//         console.log(
//           `   📁 Unit: ${unit.title} (${unit.lessons?.length || 0} lessons)`
//         );

//         // Update each lesson in this unit to have the correct unit_id
//         for (const lesson of unit.lessons) {
//           if (lesson.unit_id !== unit.id) {
//             console.log(
//               `      🔄 Fixing lesson: ${lesson.title} (was: ${lesson.unit_id}, now: ${unit.id})`
//             );
//             await Lesson.update(
//               { unit_id: unit.id },
//               { where: { id: lesson.id } }
//             );
//             fixedCount++;
//           }
//         }
//       }
//     }

//     console.log(`\n✅ Fixed ${fixedCount} lessons with unit_id`);
//     process.exit(0);
//   } catch (error) {
//     console.error("❌ Fix error:", error);
//     process.exit(1);
//   }
// };

// fixLessonUnitIds();





import db from "../models/index.js";

const { Course, Unit, Lesson } = db;

const fixLessonUnitIds = async () => {
  try {
    console.log("🔧 Fixing lesson unit_ids...");

    // Get all courses with units and lessons
    const courses = await Course.findAll({
      include: [
        {
          model: Unit,
          as: "units",
          include: [
            {
              model: Lesson,
              as: "lessons",
            },
          ],
        },
      ],
    });

    let fixedCount = 0;

    for (const course of courses) {
      console.log(`\n📘 Processing: ${course.title}`);

      for (const unit of course.units) {
        console.log(
          `   📁 Unit: ${unit.title} (${unit.lessons?.length || 0} lessons)`
        );

        // Update each lesson in this unit to have the correct unit_id
        for (const lesson of unit.lessons) {
          if (lesson.unit_id !== unit.id) {
            console.log(
              `      🔄 Fixing lesson: ${lesson.title} (was: ${lesson.unit_id}, now: ${unit.id})`
            );
            await Lesson.update(
              { unit_id: unit.id },
              { where: { id: lesson.id } }
            );
            fixedCount++;
          }
        }
      }
    }

    console.log(`\n✅ Fixed ${fixedCount} lessons with unit_id`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Fix error:", error);
    process.exit(1);
  }
};

fixLessonUnitIds();