
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("user_course_access", "createdAt", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });

    await queryInterface.addColumn("user_course_access", "updatedAt", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("user_course_access", "createdAt");
    await queryInterface.removeColumn("user_course_access", "updatedAt");
  },
};

