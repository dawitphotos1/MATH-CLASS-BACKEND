"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("users");

    if (!tableInfo.subject) {
      console.log("Adding subject column to users table...");
      await queryInterface.addColumn("users", "subject", {
        type: Sequelize.STRING,
        allowNull: true, // Allows NULL since admins may not have a subject
      });
      console.log("subject column added successfully");
    } else {
      console.log(
        "subject column already exists in users table, skipping migration"
      );
    }
  },

  async down(queryInterface) {
    console.log("Removing subject column from users table...");
    await queryInterface.removeColumn("users", "subject");
    console.log("subject column removed successfully");
  },
};
