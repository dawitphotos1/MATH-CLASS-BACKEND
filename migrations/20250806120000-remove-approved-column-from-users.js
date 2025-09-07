
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable("users");

    if (tableInfo.approved) {
      console.log("🧹 Removing 'approved' column from users table...");
      await queryInterface.removeColumn("users", "approved");
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log("🔁 Re-adding 'approved' column to users table...");
    await queryInterface.addColumn("users", "approved", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
  },
};

