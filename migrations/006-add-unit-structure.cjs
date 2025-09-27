
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("lessons");

    if (!tableInfo.isUnitHeader) {
      await queryInterface.addColumn("lessons", "isUnitHeader", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      });
    }

    if (!tableInfo.unitId) {
      await queryInterface.addColumn("lessons", "unitId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "lessons", // also lowercase here
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("lessons", "isUnitHeader");
    await queryInterface.removeColumn("lessons", "unitId");
  },
};
