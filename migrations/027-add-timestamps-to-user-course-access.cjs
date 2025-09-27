
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
  up: async (queryInterface, Sequelize) => {
    // Check and add "createdAt"
    const table = await queryInterface.describeTable("user_course_access");

    if (!table.createdAt) {
      await queryInterface.addColumn("user_course_access", "createdAt", {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      });
    }

    if (!table.updatedAt) {
      await queryInterface.addColumn("user_course_access", "updatedAt", {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // These will only run if the columns exist — safe to call directly
    await queryInterface.removeColumn("user_course_access", "createdAt");
    await queryInterface.removeColumn("user_course_access", "updatedAt");
  },
};
