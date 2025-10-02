// "use strict";

// import bcrypt from "bcryptjs";

// export async function up(queryInterface, Sequelize) {
//   // Hash a dummy password (all users will use this)
//   const hashedPassword = await bcrypt.hash("Password123!", 10);

//   // Insert Admin
//   const [admin] = await queryInterface.bulkInsert(
//     "users",
//     [
//       {
//         name: "Admin User",
//         email: "admin@example.com",
//         password: hashedPassword,
//         role: "admin",
//         approval_status: "approved",
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//     ],
//     { returning: true }
//   );

//   // Insert Teacher
//   const [teacher] = await queryInterface.bulkInsert(
//     "users",
//     [
//       {
//         name: "Test Teacher",
//         email: "teacher@example.com",
//         password: hashedPassword,
//         role: "teacher",
//         subject: "Mathematics",
//         approval_status: "approved",
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//     ],
//     { returning: true }
//   );

//   // Insert Student
//   await queryInterface.bulkInsert("users", [
//     {
//       name: "Moha Student",
//       email: "student@example.com",
//       password: hashedPassword,
//       role: "student",
//       subject: "Algebra",
//       approval_status: "pending",
//       created_at: new Date(),
//       updated_at: new Date(),
//     },
//   ]);

//   // Insert Courses
//   await queryInterface.bulkInsert("courses", [
//     {
//       title: "Algebra 1",
//       slug: "algebra-1",
//       description: "Introduction to Algebra",
//       teacher_id: teacher.id || teacher, // support different dialects
//       price: 200.0,
//       created_at: new Date(),
//       updated_at: new Date(),
//     },
//     {
//       title: "Algebra 2",
//       slug: "algebra-2",
//       description: "Advanced Algebra Concepts",
//       teacher_id: teacher.id || teacher,
//       price: 200.0,
//       created_at: new Date(),
//       updated_at: new Date(),
//     },
//     {
//       title: "Pre-Calculus",
//       slug: "pre-calculus",
//       description: "Preparation for Calculus",
//       teacher_id: teacher.id || teacher,
//       price: 200.0,
//       created_at: new Date(),
//       updated_at: new Date(),
//     },
//     {
//       title: "Calculus",
//       slug: "calculus",
//       description: "Differential and Integral Calculus",
//       teacher_id: teacher.id || teacher,
//       price: 250.0,
//       created_at: new Date(),
//       updated_at: new Date(),
//     },
//     {
//       title: "Geometry & Trigonometry",
//       slug: "geometry-trigonometry",
//       description: "Shapes and Angles",
//       teacher_id: teacher.id || teacher,
//       price: 250.0,
//       created_at: new Date(),
//       updated_at: new Date(),
//     },
//     {
//       title: "Statistics & Probability",
//       slug: "statistics-probability",
//       description: "Data Analysis and Probability",
//       teacher_id: teacher.id || teacher,
//       price: 250.0,
//       created_at: new Date(),
//       updated_at: new Date(),
//     },
//   ]);
// }

// export async function down(queryInterface, Sequelize) {
//   await queryInterface.bulkDelete("courses", null, {});
//   await queryInterface.bulkDelete("users", null, {});
// }


"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Insert the missing courses including Geometry & Trigonometry
    await queryInterface.bulkInsert("courses", [
      {
        title: "Algebra 2",
        slug: "algebra-2",
        description: "Advanced Algebra Concepts",
        price: 1200,
        teacher_id: 2, // assuming Test Teacher is id=2
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: "Pre-Calculus",
        slug: "pre-calculus",
        description: "Preparation for Calculus",
        price: 1200,
        teacher_id: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: "Calculus",
        slug: "calculus",
        description: "Differential and Integral Calculus",
        price: 1250,
        teacher_id: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: "Statistics & Probability",
        slug: "statistics-probability",
        description: "Data Analysis and Probability",
        price: 1250,
        teacher_id: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
     
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("courses", {
      slug: [
        "algebra-2",
        "pre-calculus",
        "calculus",
        "statistics-probability",
        "geometry-trigonometry",
      ],
    });
  },
};
