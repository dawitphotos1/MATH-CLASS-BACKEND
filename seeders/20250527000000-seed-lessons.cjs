
// "use strict";

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     const [courses] = await queryInterface.sequelize.query(
//       `SELECT id FROM courses WHERE title = 'Demo Course';`
//     );

//     if (courses.length === 0) {
//       throw new Error("No Demo Course found. Run seed-courses first.");
//     }

//     const courseId = courses[0].id;

//     await queryInterface.bulkInsert("lessons", [
//       {
//         course_id: courseId,
//         title: "Unit 0 - Review",
//         order_index: 0,
//         is_unit_header: true,
//         unit_id: null,
//         content_type: null,
//         content_url: null,
//         is_preview: false,
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//     ]);
//   },

//   down: async (queryInterface, Sequelize) => {
//     await queryInterface.bulkDelete("lessons", { title: "Unit 0 - Review" });
//   },
// };

"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // Lookup course
    const [courses] = await queryInterface.sequelize.query(
      `SELECT id FROM courses WHERE slug = 'demo-course'`
    );
    if (!courses.length) return;
    const courseId = courses[0].id;

    // Intro Lesson
    const [intro] = await queryInterface.sequelize.query(
      `SELECT id FROM lessons WHERE title = 'Intro Lesson' AND course_id = ${courseId}`
    );
    if (!intro.length) {
      await queryInterface.bulkInsert("lessons", [
        {
          course_id: courseId,
          title: "Intro Lesson",
          content: "Welcome!",
          order_index: 1,
          created_at: now,
          updated_at: now,
        },
      ]);
    }

    // Lesson 2
    const [lesson2] = await queryInterface.sequelize.query(
      `SELECT id FROM lessons WHERE title = 'Lesson 2' AND course_id = ${courseId}`
    );
    if (!lesson2.length) {
      await queryInterface.bulkInsert("lessons", [
        {
          course_id: courseId,
          title: "Lesson 2",
          content: "Basic Algebra",
          order_index: 2,
          created_at: now,
          updated_at: now,
        },
      ]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("lessons", {
      title: ["Intro Lesson", "Lesson 2"],
    });
  },
};
