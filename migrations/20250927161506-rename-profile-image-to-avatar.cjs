

"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("users");

    // Rename only if profile_image exists and avatar does not
    if (table.profile_image && !table.avatar) {
      await queryInterface.renameColumn("users", "profile_image", "avatar");
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("users");

    // Rollback only if avatar exists
    if (table.avatar && !table.profile_image) {
      await queryInterface.renameColumn("users", "avatar", "profile_image");
    }
  },
};
