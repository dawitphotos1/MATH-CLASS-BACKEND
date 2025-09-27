// 'use strict';

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up (queryInterface, Sequelize) {
//     /**
//      * Add seed commands here.
//      *
//      * Example:
//      * await queryInterface.bulkInsert('People', [{
//      *   name: 'John Doe',
//      *   isBetaMember: false
//      * }], {});
//     */
//   },

//   async down (queryInterface, Sequelize) {
//     /**
//      * Add commands to revert seed here.
//      *
//      * Example:
//      * await queryInterface.bulkDelete('People', null, {});
//      */
//   }
// };



"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // ✅ Insert Admin
    await queryInterface.bulkInsert(
      "users",
      [
        {
          name: "Admin User",
          email: "wudie@email.com",
          password:
            "$2a$10$6Xz8y9zV5ZxW1Q2R3S4T5U6V7W8X9Y0Z1A2B3C4D5E6F7G8H9I0J", // hashed
          role: "admin",
          subject: null,
          approval_status: "approved",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // ✅ Insert Teacher
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

    // Sequelize returns different shapes depending on DB, so fallback
    const teacherId =
      (Array.isArray(teacher) && teacher[0]?.id) || teacher?.id || 1; // fallback to 1 if needed

    // ✅ Insert Courses for Teacher
    await queryInterface.bulkInsert("courses", [
      {
        title: "Algebra 1",
        description: "Introduction to Algebra",
        price: 200.0,
        teacher_id: teacherId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: "Algebra 2",
        description: "Advanced Algebra Concepts",
        price: 200.0,
        teacher_id: teacherId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: "Pre-Calculus",
        description: "Preparation for Calculus",
        price: 200.0,
        teacher_id: teacherId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: "Calculus",
        description: "Differential and Integral Calculus",
        price: 250.0,
        teacher_id: teacherId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: "Geometry & Trigonometry",
        description: "Shapes and Angles",
        price: 250.0,
        teacher_id: teacherId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: "Statistics & Probability",
        description: "Data Analysis and Probability",
        price: 250.0,
        teacher_id: teacherId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // ✅ Insert Student
    await queryInterface.bulkInsert(
      "users",
      [
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
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("courses", null, {});
    await queryInterface.bulkDelete("users", {
      email: ["wudie@email.com", "teacher@example.com", "moha@email.com"],
    });
  },
};
