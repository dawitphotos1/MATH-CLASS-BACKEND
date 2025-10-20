
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("courses", "category", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "General",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("courses", "category");
  },
};
