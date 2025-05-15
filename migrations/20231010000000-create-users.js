"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log("Checking Lessons table for userId column...");
    try {
      // Check if userId column exists
      const columns = await queryInterface.describeTable("Lessons");
      if (columns.userId) {
        console.log("userId column already exists, modifying if needed...");
        // Modify column to ensure correct configuration
        await queryInterface.changeColumn("Lessons", "userId", {
          type: Sequelize.INTEGER,
          allowNull: true, // Adjust based on your needs (true/false)
          references: {
            model: "Users",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL", // Or "CASCADE" if you want to delete lessons when user is deleted
        });
        console.log("userId column modified successfully");
      } else {
        console.log("Adding userId column...");
        await queryInterface.addColumn("Lessons", "userId", {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "Users",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        });
        console.log("userId column added successfully");
      }
    } catch (err) {
      console.error("Error in add-userId-to-lessons migration:", err);
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log("Removing userId column from Lessons...");
    await queryInterface.removeColumn("Lessons", "userId");
  },
};
