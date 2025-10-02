
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Clear existing users
    await queryInterface.bulkDelete("users", null, {});

    // Insert fresh users with explicit IDs
    await queryInterface.bulkInsert("users", [
      {
        id: 1,
        name: "Admin User",
        email: "admin@example.com",
        password: "$2a$10$hashhere",
        role: "admin",
        approval_status: "approved",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        name: "Test Teacher",
        email: "teacher@example.com",
        password: "$2a$10$hashhere",
        role: "teacher",
        subject: "Mathematics",
        approval_status: "approved",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        name: "Student One",
        email: "student@example.com",
        password: "$2a$10$hashhere",
        role: "student",
        subject: "Algebra",
        approval_status: "pending",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {});
  },
};
