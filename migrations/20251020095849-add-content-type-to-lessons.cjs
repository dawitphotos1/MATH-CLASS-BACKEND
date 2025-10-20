
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("lessons", "content_type", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "text",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("lessons", "content_type");
  },
};
