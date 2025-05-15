
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable("Lessons");

    if (!table.unitTitle) {
      await queryInterface.addColumn("Lessons", "unitTitle", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!table.isUnitHeader) {
      await queryInterface.addColumn("Lessons", "isUnitHeader", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      });
    }

    if (!table.unitId) {
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
    // Only attempt to remove columns if they exist
    const table = await queryInterface.describeTable("Lessons");

    if (table.unitTitle) {
      await queryInterface.removeColumn("Lessons", "unitTitle");
    }

    if (table.isUnitHeader) {
      await queryInterface.removeColumn("Lessons", "isUnitHeader");
    }

    if (table.unitId) {
      await queryInterface.removeColumn("Lessons", "unitId");
    }
  },
};
