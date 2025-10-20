// "use strict";

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     await queryInterface.bulkInsert(
//       "enrollments",
//       [
//         {
//           user_id: 1,
//           course_id: 1,
//           created_at: new Date(),
//           updated_at: new Date(),
//         },
//         {
//           user_id: 2,
//           course_id: 1,
//           created_at: new Date(),
//           updated_at: new Date(),
//         },
//         // Add more seed data here...
//       ],
//       {}
//     );
//   },

//   down: async (queryInterface, Sequelize) => {
//     // Make sure this deletes only the seeded rows, or all rows if that's okay
//     await queryInterface.bulkDelete("enrollments", null, {});
//   },
// };




"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "enrollments",
      [
        {
          user_id: 1,
          course_id: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          user_id: 2,
          course_id: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        // Add more seed data here...
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    // Make sure this deletes only the seeded rows, or all rows if that's okay
    await queryInterface.bulkDelete("enrollments", null, {});
  },
};
