// // scripts/resetAndRebuildCourses.js
// import db from "../models/index.js";
// import path from "path";
// import { fileURLToPath } from "url";
// import fs from "fs";

// const { Course, Unit, Lesson, User, Enrollment, UserCourseAccess, sequelize } =
//   db;

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Import the course data from buildAllCourses.js
// const allCoursesData = [
//   {
//     title: "Algebra 1",
//     slug: "algebra-1",
//     description:
//       "Foundational algebra course covering equations, functions, graphs, and algebraic reasoning",
//     price: 1200.0,
//     curriculum: [
//       {
//         unit: "Unit 0 - Review of Prerequisite Skills",
//         lessons: [
//           "0.1 Solving Simple Equations",
//           "0.2 Evaluating Equations",
//           "0.3 Graph Linear Equations",
//         ],
//       },
//       {
//         unit: "Unit 1 - Analyze Graphs and Expressions",
//         lessons: [
//           "1.1 Create and Analyze Graphs",
//           "1.2 Modeling with Graphs",
//           "1.3 Algebraic Properties",
//           "1.4 Add and Subtract Polynomials",
//           "1.5 Multiply Polynomials",
//           "Unit 1 Review",
//         ],
//       },
//       // ... include all your course data from buildAllCourses.js
//       // (I'll include a shortened version here for clarity)
//     ],
//   },
//   {
//     title: "Algebra 2",
//     slug: "algebra-2",
//     description:
//       "Explore equations, functions, systems, matrices, radicals, polynomials, logarithms, conics, sequences, and trigonometry",
//     price: 1200.0,
//     curriculum: [
//       {
//         unit: "Chapter 1: Equations and Inequalities",
//         lessons: [
//           "1.1 Real Numbers and Number Operations",
//           "1.2 Algebraic Expressions and Models",
//           "1.3 Solving Linear Equations",
//           "1.4 Rewriting Equations and Formulas",
//           "1.5 Problem Solving Using Algebraic Models",
//           "1.6 Solving Linear Inequalities",
//           "1.7 Solving Absolute Value Equations and Inequalities",
//         ],
//       },
//       // ... include other units
//     ],
//   },
//   // ... include other courses
// ];

// const resetAndRebuildCourses = async () => {
//   try {
//     console.log("🔄 COMPLETE DATA RESET AND REBUILD");
//     console.log("==========================================");

//     // Step 1: Find or create teacher
//     console.log("👨‍🏫 Setting up teacher account...");
//     let teacher = await User.findOne({ where: { role: "teacher" } });

//     if (!teacher) {
//       const bcrypt = await import("bcryptjs");
//       const hashedPassword = await bcrypt.hash("teacher123", 10);

//       teacher = await User.create({
//         name: "Math Teacher",
//         email: "teacher@mathclass.com",
//         password: hashedPassword,
//         role: "teacher",
//         approval_status: "approved",
//         subject: "Mathematics",
//       });
//       console.log(`✅ Teacher created: ${teacher.name} (ID: ${teacher.id})`);
//     } else {
//       console.log(
//         `✅ Using existing teacher: ${teacher.name} (ID: ${teacher.id})`
//       );
//     }

//     const teacherId = teacher.id;

//     // Step 2: COMPLETE DATA RESET (with proper transaction)
//     console.log("🧹 COMPLETELY RESETTING ALL DATA...");

//     // Use transaction to ensure data integrity
//     const transaction = await sequelize.transaction();

//     try {
//       // Delete in correct order to respect foreign key constraints
//       await UserCourseAccess.destroy({ where: {}, transaction });
//       await Enrollment.destroy({ where: {}, transaction });
//       await Lesson.destroy({ where: {}, transaction });
//       await Unit.destroy({ where: {}, transaction });
//       await Course.destroy({ where: {}, transaction });

//       await transaction.commit();
//       console.log("✅ All existing data deleted successfully");
//     } catch (error) {
//       await transaction.rollback();
//       console.error("❌ Error during data reset:", error);
//       throw error;
//     }

//     // Step 3: REBUILD ALL COURSES WITH PROPER ASSOCIATIONS
//     console.log("\n🏗️ REBUILDING ALL COURSES...");

//     let totalCourses = 0;
//     let totalUnits = 0;
//     let totalLessons = 0;

//     for (const courseData of allCoursesData) {
//       console.log(`\n📘 Creating course: ${courseData.title}`);

//       // Create Course
//       const course = await Course.create({
//         title: courseData.title,
//         slug: courseData.slug,
//         description: courseData.description,
//         price: courseData.price,
//         teacher_id: teacherId,
//         thumbnail: "/Uploads/default-course.jpg",
//       });

//       totalCourses++;
//       console.log(`✅ Course created: ${course.title} (ID: ${course.id})`);

//       // Create Units and Lessons
//       for (
//         let unitIndex = 0;
//         unitIndex < courseData.curriculum.length;
//         unitIndex++
//       ) {
//         const { unit: unitTitle, lessons: lessonItems } =
//           courseData.curriculum[unitIndex];

//         // Create Unit
//         const unit = await Unit.create({
//           course_id: course.id,
//           title: unitTitle,
//           order_index: unitIndex + 1,
//         });

//         totalUnits++;
//         console.log(`   📂 Unit: ${unit.title}`);

//         // Create ALL lessons for this unit with PROPER unit_id
//         for (
//           let lessonIndex = 0;
//           lessonIndex < lessonItems.length;
//           lessonIndex++
//         ) {
//           const lessonTitle = lessonItems[lessonIndex];

//           await Lesson.create({
//             course_id: course.id,
//             unit_id: unit.id, // ✅ CRITICAL: This links lesson to unit
//             title: lessonTitle,
//             order_index: lessonIndex + 1,
//             content_type: "text",
//             content: `# ${lessonTitle}\n\nLesson content for ${lessonTitle}`,
//             is_preview: lessonIndex < 2, // First 2 lessons are preview
//           });
//           totalLessons++;
//         }

//         console.log(`      📚 Created ${lessonItems.length} lessons in unit`);
//       }
//     }

//     console.log("\n🎉 REBUILD COMPLETE!");
//     console.log("==========================================");
//     console.log(`📊 FINAL SUMMARY:`);
//     console.log(`   Courses: ${totalCourses}`);
//     console.log(`   Units: ${totalUnits}`);
//     console.log(`   Lessons: ${totalLessons}`);
//     console.log(`   Teacher: ${teacher.name} (ID: ${teacher.id})`);
//     console.log("==========================================");

//     // Step 4: VERIFY DATA INTEGRITY
//     console.log("\n🔍 VERIFYING DATA INTEGRITY...");

//     const verifyCourses = await Course.findAll({
//       where: { teacher_id: teacherId },
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

//     let verifiedLessonCount = 0;
//     let coursesWithIssues = [];

//     verifyCourses.forEach((course) => {
//       const unitCount = course.units.length;
//       let courseLessonCount = 0;
//       let unitIssues = [];

//       course.units.forEach((unit) => {
//         const unitLessonCount = unit.lessons.length;
//         courseLessonCount += unitLessonCount;

//         // Check if lessons have proper unit_id
//         unit.lessons.forEach((lesson) => {
//           if (lesson.unit_id !== unit.id) {
//             unitIssues.push(
//               `Lesson ${lesson.id} has wrong unit_id: ${lesson.unit_id} (should be ${unit.id})`
//             );
//           }
//         });

//         console.log(
//           `   ✅ ${course.title} -> ${unit.title}: ${unitLessonCount} lessons`
//         );
//       });

//       verifiedLessonCount += courseLessonCount;

//       if (unitIssues.length > 0) {
//         coursesWithIssues.push({
//           course: course.title,
//           issues: unitIssues,
//         });
//       }

//       console.log(
//         `   📊 ${course.title}: ${unitCount} units, ${courseLessonCount} lessons`
//       );
//     });

//     console.log(`\n✅ VERIFICATION RESULTS:`);
//     console.log(`   Total courses: ${verifyCourses.length}`);
//     console.log(`   Total lessons: ${verifiedLessonCount}`);

//     if (coursesWithIssues.length > 0) {
//       console.log(
//         `   ⚠️  Issues found: ${coursesWithIssues.length} courses have problems`
//       );
//       coursesWithIssues.forEach((issue) => {
//         console.log(`      - ${issue.course}:`);
//         issue.issues.forEach((detail) => console.log(`        ${detail}`));
//       });
//     } else {
//       console.log(`   ✅ All data integrity checks passed!`);
//     }

//     // Step 5: TEST THE TEACHER COURSES ENDPOINT
//     console.log("\n🧪 TESTING TEACHER COURSES ENDPOINT...");

//     // Simulate what the getTeacherCourses function does
//     const testCourses = await Course.findAll({
//       where: { teacher_id: teacherId },
//       attributes: [
//         "id",
//         "title",
//         "description",
//         "slug",
//         "price",
//         "thumbnail",
//         "created_at",
//       ],
//       include: [
//         {
//           model: Unit,
//           as: "units",
//           attributes: ["id"],
//         },
//       ],
//     });

//     // Get lesson counts for each course
//     const coursesWithCounts = await Promise.all(
//       testCourses.map(async (course) => {
//         const lessonCount = await Lesson.count({
//           where: { course_id: course.id },
//         });

//         return {
//           id: course.id,
//           title: course.title,
//           unit_count: course.units.length,
//           lesson_count: lessonCount,
//         };
//       })
//     );

//     console.log(`\n📋 TEACHER DASHBOARD DATA:`);
//     coursesWithCounts.forEach((course) => {
//       console.log(
//         `   📘 ${course.title}: ${course.unit_count} units, ${course.lesson_count} lessons`
//       );
//     });
//   } catch (error) {
//     console.error("❌ FATAL ERROR during rebuild:", error);
//     console.error("Error details:", error.message);

//     if (error.errors) {
//       error.errors.forEach((err) => {
//         console.error(`  - ${err.path}: ${err.message}`);
//       });
//     }
//   } finally {
//     await sequelize.close();
//     console.log("\n🏁 Script execution completed");
//     process.exit();
//   }
// };

// // Run the complete rebuild
// resetAndRebuildCourses();






// scripts/resetAndRebuildCourses.js
import db from "../models/index.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const { Course, Unit, Lesson, User, Enrollment, UserCourseAccess, sequelize } = db;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the course data from buildAllCourses.js
const allCoursesData = [
  {
    title: "Algebra 1",
    slug: "algebra-1",
    description: "Foundational algebra course covering equations, functions, graphs, and algebraic reasoning",
    price: 1200.00,
    curriculum: [
      {
        unit: "Unit 0 - Review of Prerequisite Skills",
        lessons: ["0.1 Solving Simple Equations", "0.2 Evaluating Equations", "0.3 Graph Linear Equations"],
      },
      {
        unit: "Unit 1 - Analyze Graphs and Expressions", 
        lessons: ["1.1 Create and Analyze Graphs", "1.2 Modeling with Graphs", "1.3 Algebraic Properties", "1.4 Add and Subtract Polynomials", "1.5 Multiply Polynomials", "Unit 1 Review"],
      },
      // ... include all your course data from buildAllCourses.js
      // (I'll include a shortened version here for clarity)
    ]
  },
  {
    title: "Algebra 2",
    slug: "algebra-2", 
    description: "Explore equations, functions, systems, matrices, radicals, polynomials, logarithms, conics, sequences, and trigonometry",
    price: 1200.00,
    curriculum: [
      {
        unit: "Chapter 1: Equations and Inequalities",
        lessons: ["1.1 Real Numbers and Number Operations", "1.2 Algebraic Expressions and Models", "1.3 Solving Linear Equations", "1.4 Rewriting Equations and Formulas", "1.5 Problem Solving Using Algebraic Models", "1.6 Solving Linear Inequalities", "1.7 Solving Absolute Value Equations and Inequalities"],
      },
      // ... include other units
    ]
  },
  // ... include other courses
];

const resetAndRebuildCourses = async () => {
  try {
    console.log("🔄 COMPLETE DATA RESET AND REBUILD");
    console.log("==========================================");

    // Step 1: Find or create teacher
    console.log("👨‍🏫 Setting up teacher account...");
    let teacher = await User.findOne({ where: { role: 'teacher' } });
    
    if (!teacher) {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash('teacher123', 10);
      
      teacher = await User.create({
        name: "Math Teacher",
        email: "teacher@mathclass.com", 
        password: hashedPassword,
        role: "teacher",
        approval_status: "approved",
        subject: "Mathematics"
      });
      console.log(`✅ Teacher created: ${teacher.name} (ID: ${teacher.id})`);
    } else {
      console.log(`✅ Using existing teacher: ${teacher.name} (ID: ${teacher.id})`);
    }

    const teacherId = teacher.id;

    // Step 2: COMPLETE DATA RESET (with proper transaction)
    console.log("🧹 COMPLETELY RESETTING ALL DATA...");
    
    // Use transaction to ensure data integrity
    const transaction = await sequelize.transaction();
    
    try {
      // Delete in correct order to respect foreign key constraints
      await UserCourseAccess.destroy({ where: {}, transaction });
      await Enrollment.destroy({ where: {}, transaction });
      await Lesson.destroy({ where: {}, transaction });
      await Unit.destroy({ where: {}, transaction });
      await Course.destroy({ where: {}, transaction });
      
      await transaction.commit();
      console.log("✅ All existing data deleted successfully");
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Error during data reset:", error);
      throw error;
    }

    // Step 3: REBUILD ALL COURSES WITH PROPER ASSOCIATIONS
    console.log("\n🏗️ REBUILDING ALL COURSES...");
    
    let totalCourses = 0;
    let totalUnits = 0;
    let totalLessons = 0;

    for (const courseData of allCoursesData) {
      console.log(`\n📘 Creating course: ${courseData.title}`);

      // Create Course
      const course = await Course.create({
        title: courseData.title,
        slug: courseData.slug,
        description: courseData.description,
        price: courseData.price,
        teacher_id: teacherId,
        thumbnail: '/Uploads/default-course.jpg',
      });

      totalCourses++;
      console.log(`✅ Course created: ${course.title} (ID: ${course.id})`);

      // Create Units and Lessons
      for (let unitIndex = 0; unitIndex < courseData.curriculum.length; unitIndex++) {
        const { unit: unitTitle, lessons: lessonItems } = courseData.curriculum[unitIndex];

        // Create Unit
        const unit = await Unit.create({
          course_id: course.id,
          title: unitTitle,
          order_index: unitIndex + 1,
        });

        totalUnits++;
        console.log(`   📂 Unit: ${unit.title}`);

        // Create ALL lessons for this unit with PROPER unit_id
        for (let lessonIndex = 0; lessonIndex < lessonItems.length; lessonIndex++) {
          const lessonTitle = lessonItems[lessonIndex];
          
          await Lesson.create({
            course_id: course.id,
            unit_id: unit.id, // ✅ CRITICAL: This links lesson to unit
            title: lessonTitle,
            order_index: lessonIndex + 1,
            content_type: "text",
            content: `# ${lessonTitle}\n\nLesson content for ${lessonTitle}`,
            is_preview: lessonIndex < 2, // First 2 lessons are preview
          });
          totalLessons++;
        }
        
        console.log(`      📚 Created ${lessonItems.length} lessons in unit`);
      }
    }

    console.log("\n🎉 REBUILD COMPLETE!");
    console.log("==========================================");
    console.log(`📊 FINAL SUMMARY:`);
    console.log(`   Courses: ${totalCourses}`);
    console.log(`   Units: ${totalUnits}`); 
    console.log(`   Lessons: ${totalLessons}`);
    console.log(`   Teacher: ${teacher.name} (ID: ${teacher.id})`);
    console.log("==========================================");

    // Step 4: VERIFY DATA INTEGRITY
    console.log("\n🔍 VERIFYING DATA INTEGRITY...");
    
    const verifyCourses = await Course.findAll({
      where: { teacher_id: teacherId },
      include: [
        {
          model: Unit,
          as: 'units',
          include: [
            {
              model: Lesson, 
              as: 'lessons'
            }
          ]
        }
      ]
    });

    let verifiedLessonCount = 0;
    let coursesWithIssues = [];

    verifyCourses.forEach(course => {
      const unitCount = course.units.length;
      let courseLessonCount = 0;
      let unitIssues = [];

      course.units.forEach(unit => {
        const unitLessonCount = unit.lessons.length;
        courseLessonCount += unitLessonCount;
        
        // Check if lessons have proper unit_id
        unit.lessons.forEach(lesson => {
          if (lesson.unit_id !== unit.id) {
            unitIssues.push(`Lesson ${lesson.id} has wrong unit_id: ${lesson.unit_id} (should be ${unit.id})`);
          }
        });

        console.log(`   ✅ ${course.title} -> ${unit.title}: ${unitLessonCount} lessons`);
      });

      verifiedLessonCount += courseLessonCount;
      
      if (unitIssues.length > 0) {
        coursesWithIssues.push({
          course: course.title,
          issues: unitIssues
        });
      }

      console.log(`   📊 ${course.title}: ${unitCount} units, ${courseLessonCount} lessons`);
    });

    console.log(`\n✅ VERIFICATION RESULTS:`);
    console.log(`   Total courses: ${verifyCourses.length}`);
    console.log(`   Total lessons: ${verifiedLessonCount}`);
    
    if (coursesWithIssues.length > 0) {
      console.log(`   ⚠️  Issues found: ${coursesWithIssues.length} courses have problems`);
      coursesWithIssues.forEach(issue => {
        console.log(`      - ${issue.course}:`);
        issue.issues.forEach(detail => console.log(`        ${detail}`));
      });
    } else {
      console.log(`   ✅ All data integrity checks passed!`);
    }

    // Step 5: TEST THE TEACHER COURSES ENDPOINT
    console.log("\n🧪 TESTING TEACHER COURSES ENDPOINT...");
    
    // Simulate what the getTeacherCourses function does
    const testCourses = await Course.findAll({
      where: { teacher_id: teacherId },
      attributes: ["id", "title", "description", "slug", "price", "thumbnail", "created_at"],
      include: [
        {
          model: Unit,
          as: "units",
          attributes: ["id"],
        }
      ],
    });

    // Get lesson counts for each course
    const coursesWithCounts = await Promise.all(
      testCourses.map(async (course) => {
        const lessonCount = await Lesson.count({
          where: { course_id: course.id }
        });

        return {
          id: course.id,
          title: course.title,
          unit_count: course.units.length,
          lesson_count: lessonCount,
        };
      })
    );

    console.log(`\n📋 TEACHER DASHBOARD DATA:`);
    coursesWithCounts.forEach(course => {
      console.log(`   📘 ${course.title}: ${course.unit_count} units, ${course.lesson_count} lessons`);
    });

  } catch (error) {
    console.error("❌ FATAL ERROR during rebuild:", error);
    console.error("Error details:", error.message);
    
    if (error.errors) {
      error.errors.forEach(err => {
        console.error(`  - ${err.path}: ${err.message}`);
      });
    }
  } finally {
    await sequelize.close();
    console.log("\n🏁 Script execution completed");
    process.exit();
  }
};

// Run the complete rebuild
resetAndRebuildCourses();