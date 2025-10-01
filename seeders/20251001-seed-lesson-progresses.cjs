// "use strict";

// module.exports = {
//   async up(queryInterface) {
//     // Dummy lesson progresses for testing
//     await queryInterface.bulkInsert("lesson_progresses", [
//       {
//         user_id: 1,
//         lesson_id: 1,
//         progress: 50.0,
//         last_viewed_at: new Date(),
//       },
//       {
//         user_id: 1,
//         lesson_id: 2,
//         progress: 100.0,
//         last_viewed_at: new Date(),
//       },
//       {
//         user_id: 2,
//         lesson_id: 1,
//         progress: 30.0,
//         last_viewed_at: new Date(),
//       },
//     ]);
//   },

//   async down(queryInterface) {
//     await queryInterface.bulkDelete("lesson_progresses", null, {});
//   },
// };





"use strict";

module.exports = {
  async up(queryInterface) {
    // Dummy lesson progresses for testing
    await queryInterface.bulkInsert("lesson_progresses", [
      {
        user_id: 1,
        lesson_id: 1,
        progress: 50.0,
        last_viewed_at: new Date(),
      },
      {
        user_id: 1,
        lesson_id: 2,
        progress: 100.0,
        last_viewed_at: new Date(),
      },
      {
        user_id: 2,
        lesson_id: 1,
        progress: 30.0,
        last_viewed_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("lesson_progresses", null, {});
  },
};
