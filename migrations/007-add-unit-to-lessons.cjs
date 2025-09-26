
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable("lessons");

    if (!table.unitTitle) {
      await queryInterface.addColumn("lessons", "unitTitle", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!table.isUnitHeader) {
      await queryInterface.addColumn("lessons", "isUnitHeader", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      });
    }

    if (!table.unitId) {
      await queryInterface.addColumn("lessons", "unitId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "lessons",
          key: "id",
        },
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Only attempt to remove columns if they exist
    const table = await queryInterface.describeTable("lessons");

    if (table.unitTitle) {
      await queryInterface.removeColumn("lessons", "unitTitle");
    }

    if (table.isUnitHeader) {
      await queryInterface.removeColumn("lessons", "isUnitHeader");
    }

    if (table.unitId) {
      await queryInterface.removeColumn("lessons", "unitId");
    }
  },
};
