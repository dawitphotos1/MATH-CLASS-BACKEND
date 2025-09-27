
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("courses"); // lowercase here

    if (!tableInfo.teacherId) {
      console.log("Adding teacherId column to courses table...");
      await queryInterface.addColumn("courses", "teacherId", {
        // lowercase here
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users", // check if your Users table is lowercase as well, usually 'users'
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
      console.log("teacherId column added successfully");
    } else {
      console.log(
        "teacherId column already exists in courses table, skipping migration"
      );
    }
  },

  async down(queryInterface) {
    console.log("Removing teacherId column from courses table...");
    await queryInterface.removeColumn("courses", "teacherId"); // lowercase here
    console.log("teacherId column removed successfully");
  },
};
