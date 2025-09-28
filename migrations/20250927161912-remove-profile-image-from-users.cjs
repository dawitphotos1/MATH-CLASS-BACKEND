
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("users");

    // Drop only if profile_image exists
    if (table.profile_image) {
      await queryInterface.removeColumn("users", "profile_image");
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("users");

    // Recreate if missing
    if (!table.profile_image) {
      await queryInterface.addColumn("users", "profile_image", {
        type: Sequelize.STRING,
      });
    }
  },
};
