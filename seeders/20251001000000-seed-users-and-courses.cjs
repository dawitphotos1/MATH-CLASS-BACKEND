// "use strict";

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     // Insert the missing courses including Geometry & Trigonometry
//     await queryInterface.bulkInsert("courses", [
//       {
//         title: "Algebra 2",
//         slug: "algebra-2",
//         description: "Advanced Algebra Concepts",
//         price: 1200,
//         teacher_id: 2, // assuming Test Teacher is id=2
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//       {
//         title: "Pre-Calculus",
//         slug: "pre-calculus",
//         description: "Preparation for Calculus",
//         price: 1200,
//         teacher_id: 2,
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//       {
//         title: "Calculus",
//         slug: "calculus",
//         description: "Differential and Integral Calculus",
//         price: 1250,
//         teacher_id: 2,
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//       {
//         title: "Statistics & Probability",
//         slug: "statistics-probability",
//         description: "Data Analysis and Probability",
//         price: 1250,
//         teacher_id: 2,
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
     
//     ]);
//   },

//   async down(queryInterface, Sequelize) {
//     await queryInterface.bulkDelete("courses", {
//       slug: [
//         "algebra-2",
//         "pre-calculus",
//         "calculus",
//         "statistics-probability",
//         "geometry-trigonometry",
//       ],
//     });
//   },
// };





"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Clear existing data
    await queryInterface.bulkDelete("courses", null, {});
    await queryInterface.bulkDelete("users", null, {});

    // Insert Users first
    await queryInterface.bulkInsert("users", [
      {
        id: 1,
        name: "Admin User",
        email: "admin@example.com",
        password: "$2a$10$hashhere", // replace with a real bcrypt hash
        role: "admin",
        subject: null,
        approval_status: "approved", // ✅ admins approved
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
        approval_status: "approved", // ✅ teachers approved
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        name: "Student One",
        email: "student1@example.com",
        password: "$2a$10$hashhere",
        role: "student",
        subject: "Algebra",
        approval_status: "pending", // 🔄 students start pending
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 4,
        name: "Student Two",
        email: "student2@example.com",
        password: "$2a$10$hashhere",
        role: "student",
        subject: "Geometry",
        approval_status: "pending", // 🔄 pending
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Insert Courses linked to Teacher (id = 2)
    await queryInterface.bulkInsert("courses", [
      {
        id: 1,
        title: "Algebra 1",
        slug: "algebra-1",
        description: "Introduction to Algebra",
        teacher_id: 2,
        price: 200.0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        title: "Geometry & Trigonometry",
        slug: "geometry-trigonometry",
        description: "Shapes and Angles",
        teacher_id: 2,
        price: 250.0,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("courses", null, {});
    await queryInterface.bulkDelete("users", null, {});
  },
};
