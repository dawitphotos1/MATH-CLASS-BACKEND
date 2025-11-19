// // scripts/emergencyFixLessons.js
// import db from "../models/index.js";

// const { Course, Unit, Lesson, sequelize } = db;

// const emergencyFixLessons = async () => {
//   try {
//     console.log("🚨 EMERGENCY LESSON FIX SCRIPT");
//     console.log("==========================================");

//     // Get all courses with their units
//     const courses = await Course.findAll({
//       include: [
//         {
//           model: Unit,
//           as: "units",
//         },
//       ],
//     });

//     let fixedCount = 0;
//     let errorCount = 0;

//     for (const course of courses) {
//       console.log(`\n📘 Processing: ${course.title} (ID: ${course.id})`);

//       for (const unit of course.units) {
//         console.log(`   📂 Unit: ${unit.title} (ID: ${unit.id})`);

//         // Find all lessons that should belong to this unit but don't have unit_id set
//         const lessonsToFix = await Lesson.findAll({
//           where: {
//             course_id: course.id,
//             unit_id: null, // Lessons without unit_id
//             title: { [db.Sequelize.Op.like]: `${unit.title.split(" - ")[0]}%` }, // Match by unit prefix
//           },
//         });

//         if (lessonsToFix.length > 0) {
//           console.log(`      🔧 Found ${lessonsToFix.length} lessons to fix`);

//           for (const lesson of lessonsToFix) {
//             try {
//               await Lesson.update(
//                 { unit_id: unit.id },
//                 { where: { id: lesson.id } }
//               );
//               console.log(
//                 `      ✅ Fixed: ${lesson.title} -> unit_id: ${unit.id}`
//               );
//               fixedCount++;
//             } catch (error) {
//               console.log(
//                 `      ❌ Failed to fix: ${lesson.title} - ${error.message}`
//               );
//               errorCount++;
//             }
//           }
//         } else {
//           console.log(`      ℹ️  No lessons need fixing in this unit`);
//         }
//       }
//     }

//     console.log("\n🎯 FIX SUMMARY:");
//     console.log(`   ✅ Lessons fixed: ${fixedCount}`);
//     console.log(`   ❌ Errors: ${errorCount}`);

//     if (fixedCount > 0) {
//       console.log(
//         "\n🔄 Please restart your server and check the Teacher Dashboard!"
//       );
//     }
//   } catch (error) {
//     console.error("❌ Emergency fix failed:", error);
//   } finally {
//     await sequelize.close();
//     process.exit();
//   }
// };

// emergencyFixLessons();






// scripts/emergencyFixLessons.js
import db from "../models/index.js";

const { Course, Unit, Lesson, sequelize } = db;

const emergencyFixLessons = async () => {
  try {
    console.log("🚨 EMERGENCY LESSON FIX SCRIPT");
    console.log("==========================================");

    // Get all courses with their units
    const courses = await Course.findAll({
      include: [
        {
          model: Unit,
          as: 'units'
        }
      ]
    });

    let fixedCount = 0;
    let errorCount = 0;

    for (const course of courses) {
      console.log(`\n📘 Processing: ${course.title} (ID: ${course.id})`);
      
      for (const unit of course.units) {
        console.log(`   📂 Unit: ${unit.title} (ID: ${unit.id})`);
        
        // Find all lessons that should belong to this unit but don't have unit_id set
        const lessonsToFix = await Lesson.findAll({
          where: {
            course_id: course.id,
            unit_id: null, // Lessons without unit_id
            title: { [db.Sequelize.Op.like]: `${unit.title.split(' - ')[0]}%` } // Match by unit prefix
          }
        });

        if (lessonsToFix.length > 0) {
          console.log(`      🔧 Found ${lessonsToFix.length} lessons to fix`);
          
          for (const lesson of lessonsToFix) {
            try {
              await Lesson.update(
                { unit_id: unit.id },
                { where: { id: lesson.id } }
              );
              console.log(`      ✅ Fixed: ${lesson.title} -> unit_id: ${unit.id}`);
              fixedCount++;
            } catch (error) {
              console.log(`      ❌ Failed to fix: ${lesson.title} - ${error.message}`);
              errorCount++;
            }
          }
        } else {
          console.log(`      ℹ️  No lessons need fixing in this unit`);
        }
      }
    }

    console.log("\n🎯 FIX SUMMARY:");
    console.log(`   ✅ Lessons fixed: ${fixedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    
    if (fixedCount > 0) {
      console.log("\n🔄 Please restart your server and check the Teacher Dashboard!");
    }

  } catch (error) {
    console.error("❌ Emergency fix failed:", error);
  } finally {
    await sequelize.close();
    process.exit();
  }
};

emergencyFixLessons();