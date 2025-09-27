

"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn("users", "profile_image", "avatar");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn("users", "avatar", "profile_image");
  },
};
