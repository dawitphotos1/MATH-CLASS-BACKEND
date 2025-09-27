

"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable("courses");

    if (!table.slug) {
      await queryInterface.addColumn("courses", "slug", {
        type: Sequelize.STRING,
        allowNull: true, // or false, depending on your requirement
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove column only if it exists
    const table = await queryInterface.describeTable("courses");

    if (table.slug) {
      await queryInterface.removeColumn("courses", "slug");
    }
  },
};
