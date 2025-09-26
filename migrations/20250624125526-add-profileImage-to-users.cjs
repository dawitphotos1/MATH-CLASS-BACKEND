"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "profile_image", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("users", "profile_image");
  },
};

