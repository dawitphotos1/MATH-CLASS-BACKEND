"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("Lessons");

    if (!tableInfo.isUnitHeader) {
      await queryInterface.addColumn("Lessons", "isUnitHeader", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      });
    }

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

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Lessons", "isUnitHeader");
    await queryInterface.removeColumn("Lessons", "unitId");
  },
};
