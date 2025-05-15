
// File: Backend/migrations/20231010120000-add-unit-structure.js
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable("Lessons");

    // Add isUnitHeader only if it doesn't exist
    if (!tableInfo.isUnitHeader) {
      await queryInterface.addColumn("Lessons", "isUnitHeader", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      });
    }

    // Add unitId only if it doesn't exist
    if (!tableInfo.unitId) {
      await queryInterface.addColumn("Lessons", "unitId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Lessons",
          key: "id",
        },
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Lessons", "isUnitHeader");
    await queryInterface.removeColumn("Lessons", "unitId");
  },
};
