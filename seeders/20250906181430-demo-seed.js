
"use strict";
const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash passwords
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Insert Users
    await queryInterface.bulkInsert("users", [
      {
        id: 1,
        name: "Alice Student",
        email: "student@example.com",
        password: hashedPassword,
        role: "student",
        approval_status: "approved",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        name: "Bob Teacher",
        email: "teacher@example.com",
        password: hashedPassword,
        role: "teacher",
        approval_status: "approved",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        name: "Charlie Admin",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
        approval_status: "approved",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Insert Courses (owned by teacher)
    await queryInterface.bulkInsert("courses", [
      {
        id: 1,
        title: "Algebra Basics",
        description: "Learn the foundations of algebra.",
        price: 49.99,
        teacher_id: 2, // Bob Teacher
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Insert Lessons (for course)
    await queryInterface.bulkInsert("lessons", [
      {
        id: 1,
        title: "Introduction to Variables",
        content_type: "text",
        content_url: null,
        course_id: 1,
        user_id: 2, // Teacher
        order_index: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        title: "Basic Equations",
        content_type: "text",
        content_url: null,
        course_id: 1,
        user_id: 2,
        order_index: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Insert UserCourseAccess (student enrolled in course)
    await queryInterface.bulkInsert("usercourseaccess", [
      {
        user_id: 1, // Alice Student
        course_id: 1,
        access_granted_at: new Date(),
        approved: true,
        approval_status: "approved",
        payment_status: "paid",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("usercourseaccess", null, {});
    await queryInterface.bulkDelete("lessons", null, {});
    await queryInterface.bulkDelete("courses", null, {});
    await queryInterface.bulkDelete("users", null, {});
  },
};
