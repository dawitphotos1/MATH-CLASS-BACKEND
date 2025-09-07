
"use strict";

module.exports = {
  async up(queryInterface) {
    const table = await queryInterface.describeTable("courses");
    if (table.price) {
      await queryInterface.removeColumn("courses", "price");
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("courses");
    if (!table.price) {
      await queryInterface.addColumn("courses", "price", {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      });
    }
  },
};

