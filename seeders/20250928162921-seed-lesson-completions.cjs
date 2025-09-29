
// "use strict";

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     return queryInterface.bulkInsert(
//       "lesson_completions",
//       [
//         {
//           user_id: 1,
//           lesson_id: 1,
//           completed_at: new Date("2025-09-25T10:00:00Z"),
//           created_at: new Date(),
//           updated_at: new Date(),
//         },
//         {
//           user_id: 2,
//           lesson_id: 1,
//           completed_at: new Date("2025-09-26T11:30:00Z"),
//           created_at: new Date(),
//           updated_at: new Date(),
//         },
//         {
//           user_id: 1,
//           lesson_id: 2,
//           completed_at: new Date("2025-09-27T09:15:00Z"),
//           created_at: new Date(),
//           updated_at: new Date(),
//         },
//       ],
//       {}
//     );
//   },

//   down: async (queryInterface, Sequelize) => {
//     return queryInterface.bulkDelete("lesson_completions", null, {});
//   },
// };


"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // Lookup student user
    const [students] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'student@example.com'`
    );
    if (!students.length) return;
    const studentId = students[0].id;

    // Lookup lesson
    const [lessons] = await queryInterface.sequelize.query(
      `SELECT id FROM lessons WHERE title = 'Intro Lesson'`
    );
    if (!lessons.length) return;
    const lessonId = lessons[0].id;

    // Check if completion already exists
    const [existing] = await queryInterface.sequelize.query(
      `SELECT id FROM lesson_completions WHERE user_id = ${studentId} AND lesson_id = ${lessonId}`
    );
    if (!existing.length) {
      await queryInterface.bulkInsert("lesson_completions", [
        {
          user_id: studentId,
          lesson_id: lessonId,
          created_at: now,
          updated_at: now,
        },
      ]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    const [students] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'student@example.com'`
    );
    const [lessons] = await queryInterface.sequelize.query(
      `SELECT id FROM lessons WHERE title = 'Intro Lesson'`
    );

    if (students.length && lessons.length) {
      await queryInterface.bulkDelete("lesson_completions", {
        user_id: students[0].id,
        lesson_id: lessons[0].id,
      });
    }
  },
};
