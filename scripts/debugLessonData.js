// import db from "../models/index.js";

// const { Course, Unit, Lesson } = db;

// const debugLessonData = async () => {
//   try {
//     console.log("🔍 DEBUG: Checking lesson data structure...");

//     const courses = await Course.findAll({
//       where: { teacher_id: 81 },
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
//         {
//           model: Lesson,
//           as: "lessons",
//         },
//       ],
//     });

//     console.log(`\n📊 FOUND ${courses.length} COURSES:`);
//     console.log("==========================================");

//     let totalLessonsViaUnits = 0;
//     let totalLessonsDirect = 0;

//     courses.forEach((course) => {
//       const lessonsViaUnits =
//         course.units?.reduce(
//           (total, unit) => total + (unit.lessons?.length || 0),
//           0
//         ) || 0;
//       const lessonsDirect = course.lessons?.length || 0;

//       totalLessonsViaUnits += lessonsViaUnits;
//       totalLessonsDirect += lessonsDirect;

//       console.log(`\n📘 ${course.title} (ID: ${course.id})`);
//       console.log(`   📁 Units: ${course.units?.length || 0}`);
//       console.log(`   📚 Lessons via units: ${lessonsViaUnits}`);
//       console.log(`   📚 Lessons direct: ${lessonsDirect}`);

//       // Show unit details
//       course.units?.forEach((unit) => {
//         console.log(
//           `      └─ Unit ${unit.id}: "${unit.title}" - ${
//             unit.lessons?.length || 0
//           } lessons`
//         );

//         // Show lesson details
//         unit.lessons?.forEach((lesson) => {
//           console.log(`         └─ Lesson ${lesson.id}: "${lesson.title}"`);
//         });
//       });
//     });

//     console.log("\n==========================================");
//     console.log(`📈 TOTAL LESSONS VIA UNITS: ${totalLessonsViaUnits}`);
//     console.log(`📈 TOTAL LESSONS DIRECT: ${totalLessonsDirect}`);
//     console.log("==========================================");

//     // Check if lessons have unit_id set
//     console.log("\n🔍 Checking if lessons have unit_id...");
//     const lessonsWithoutUnit = await Lesson.findAll({
//       where: { unit_id: null },
//       attributes: ["id", "title", "course_id", "unit_id"],
//     });

//     console.log(`📋 Lessons without unit_id: ${lessonsWithoutUnit.length}`);
//     if (lessonsWithoutUnit.length > 0) {
//       console.log("Sample lessons without unit_id:");
//       lessonsWithoutUnit.slice(0, 5).forEach((lesson) => {
//         console.log(
//           `   - ${lesson.title} (ID: ${lesson.id}, Course: ${lesson.course_id})`
//         );
//       });
//     }

//     process.exit(0);
//   } catch (error) {
//     console.error("❌ Debug error:", error);
//     process.exit(1);
//   }
// };

// debugLessonData();





import db from "../models/index.js";

const { Course, Unit, Lesson } = db;

const debugLessonData = async () => {
  try {
    console.log("🔍 DEBUG: Checking lesson data structure...");

    const courses = await Course.findAll({
      where: { teacher_id: 81 },
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
        {
          model: Lesson,
          as: "lessons",
        },
      ],
    });

    console.log(`\n📊 FOUND ${courses.length} COURSES:`);
    console.log("==========================================");

    let totalLessonsViaUnits = 0;
    let totalLessonsDirect = 0;

    courses.forEach((course) => {
      const lessonsViaUnits =
        course.units?.reduce(
          (total, unit) => total + (unit.lessons?.length || 0),
          0
        ) || 0;
      const lessonsDirect = course.lessons?.length || 0;

      totalLessonsViaUnits += lessonsViaUnits;
      totalLessonsDirect += lessonsDirect;

      console.log(`\n📘 ${course.title} (ID: ${course.id})`);
      console.log(`   📁 Units: ${course.units?.length || 0}`);
      console.log(`   📚 Lessons via units: ${lessonsViaUnits}`);
      console.log(`   📚 Lessons direct: ${lessonsDirect}`);

      // Show unit details
      course.units?.forEach((unit) => {
        console.log(
          `      └─ Unit ${unit.id}: "${unit.title}" - ${
            unit.lessons?.length || 0
          } lessons`
        );

        // Show lesson details
        unit.lessons?.forEach((lesson) => {
          console.log(`         └─ Lesson ${lesson.id}: "${lesson.title}"`);
        });
      });
    });

    console.log("\n==========================================");
    console.log(`📈 TOTAL LESSONS VIA UNITS: ${totalLessonsViaUnits}`);
    console.log(`📈 TOTAL LESSONS DIRECT: ${totalLessonsDirect}`);
    console.log("==========================================");

    // Check if lessons have unit_id set
    console.log("\n🔍 Checking if lessons have unit_id...");
    const lessonsWithoutUnit = await Lesson.findAll({
      where: { unit_id: null },
      attributes: ["id", "title", "course_id", "unit_id"],
    });

    console.log(`📋 Lessons without unit_id: ${lessonsWithoutUnit.length}`);
    if (lessonsWithoutUnit.length > 0) {
      console.log("Sample lessons without unit_id:");
      lessonsWithoutUnit.slice(0, 5).forEach((lesson) => {
        console.log(
          `   - ${lesson.title} (ID: ${lesson.id}, Course: ${lesson.course_id})`
        );
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Debug error:", error);
    process.exit(1);
  }
};

debugLessonData();