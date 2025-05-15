
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("Courses");

    if (!tableInfo.teacherId) {
      console.log("Adding teacherId column to Courses table...");
      await queryInterface.addColumn("Courses", "teacherId", {
        type: Sequelize.INTEGER,
        allowNull: true, // Allows NULL if a course can exist without a teacher
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL", // Adjust based on your requirements
      });
      console.log("teacherId column added successfully");
    } else {
      console.log(
        "teacherId column already exists in Courses table, skipping migration"
      );
    }
  },

  async down(queryInterface, Sequelize) {
    console.log("Removing teacherId column from Courses table...");
    await queryInterface.removeColumn("Courses", "teacherId");
    console.log("teacherId column removed successfully");
  },
};