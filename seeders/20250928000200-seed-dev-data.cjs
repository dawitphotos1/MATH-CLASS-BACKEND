
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Teacher
    const [teacher] = await queryInterface.bulkInsert(
      "users",
      [
        {
          name: "Test Teacher",
          email: "teacher@example.com",
          password:
            "$2a$10$6Xz8y9zV5ZxW1Q2R3S4T5U6V7W8X9Y0Z1A2B3C4D5E6F7G8H9I0J",
          role: "teacher",
          subject: "Mathematics",
          approval_status: "approved",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      { returning: ["id"] }
    );

    const teacherId = teacher?.id || 1;

    // Courses
    await queryInterface.bulkInsert("courses", [
      {
        title: "Algebra 1",
        slug: "algebra-1",
        description: "Introduction to Algebra",
        price: 200.0,
        teacher_id: teacherId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: "Algebra 2",
        slug: "algebra-2",
        description: "Advanced Algebra Concepts",
        price: 200.0,
        teacher_id: teacherId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: "Pre-Calculus",
        slug: "pre-calculus",
        description: "Preparation for Calculus",
        price: 200.0,
        teacher_id: teacherId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: "Calculus",
        slug: "calculus",
        description: "Differential and Integral Calculus",
        price: 250.0,
        teacher_id: teacherId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: "Geometry & Trigonometry",
        slug: "geometry-trigonometry",
        description: "Shapes and Angles",
        price: 250.0,
        teacher_id: teacherId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: "Statistics & Probability",
        slug: "statistics-probability",
        description: "Data Analysis and Probability",
        price: 250.0,
        teacher_id: teacherId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Student
    await queryInterface.bulkInsert("users", [
      {
        name: "Moha Student",
        email: "moha@email.com",
        password:
          "$2a$10$6Xz8y9zV5ZxW1Q2R3S4T5U6V7W8X9Y0Z1A2B3C4D5E6F7G8H9I0J",
        role: "student",
        subject: "Algebra",
        approval_status: "pending",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("courses", null, {});
    await queryInterface.bulkDelete("users", {
      email: ["teacher@example.com", "moha@email.com"],
    });
  },
};
