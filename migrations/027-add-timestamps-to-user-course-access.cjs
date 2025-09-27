
// "use strict";

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     await queryInterface.addColumn("user_course_access", "createdAt", {
//       type: Sequelize.DATE,
//       allowNull: false,
//       defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
//     });

//     await queryInterface.addColumn("user_course_access", "updatedAt", {
//       type: Sequelize.DATE,
//       allowNull: false,
//       defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
//     });
//   },

//   down: async (queryInterface, Sequelize) => {
//     await queryInterface.removeColumn("user_course_access", "createdAt");
//     await queryInterface.removeColumn("user_course_access", "updatedAt");
//   },
// };



"use strict";

module.exports = {
  up: async () => {
    // ⚠️ No-op: 'createdAt' and 'updatedAt' already exist in 005-create-user-course-access.cjs
  },
  down: async () => {
    // ⚠️ No-op
  },
};
