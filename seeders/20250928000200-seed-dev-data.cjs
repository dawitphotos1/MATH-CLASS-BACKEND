
// "use strict";

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     // Teacher
//     const [teacher] = await queryInterface.bulkInsert(
//       "users",
//       [
//         {
//           name: "Test Teacher",
//           email: "teacher@example.com",
//           password:
//             "$2a$10$6Xz8y9zV5ZxW1Q2R3S4T5U6V7W8X9Y0Z1A2B3C4D5E6F7G8H9I0J",
//           role: "teacher",
//           subject: "Mathematics",
//           approval_status: "approved",
//           created_at: new Date(),
//           updated_at: new Date(),
//         },
//       ],
//       { returning: ["id"] }
//     );

//     const teacherId = teacher?.id || 1;

//     // Courses
//     await queryInterface.bulkInsert("courses", [
//       {
//         title: "Algebra 1",
//         slug: "algebra-1",
//         description: "Introduction to Algebra",
//         price: 200.0,
//         teacher_id: teacherId,
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//       {
//         title: "Algebra 2",
//         slug: "algebra-2",
//         description: "Advanced Algebra Concepts",
//         price: 200.0,
//         teacher_id: teacherId,
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//       {
//         title: "Pre-Calculus",
//         slug: "pre-calculus",
//         description: "Preparation for Calculus",
//         price: 200.0,
//         teacher_id: teacherId,
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//       {
//         title: "Calculus",
//         slug: "calculus",
//         description: "Differential and Integral Calculus",
//         price: 250.0,
//         teacher_id: teacherId,
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//       {
//         title: "Geometry & Trigonometry",
//         slug: "geometry-trigonometry",
//         description: "Shapes and Angles",
//         price: 250.0,
//         teacher_id: teacherId,
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//       {
//         title: "Statistics & Probability",
//         slug: "statistics-probability",
//         description: "Data Analysis and Probability",
//         price: 250.0,
//         teacher_id: teacherId,
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//     ]);

//     // Student
//     await queryInterface.bulkInsert("users", [
//       {
//         name: "Moha Student",
//         email: "moha@email.com",
//         password:
//           "$2a$10$6Xz8y9zV5ZxW1Q2R3S4T5U6V7W8X9Y0Z1A2B3C4D5E6F7G8H9I0J",
//         role: "student",
//         subject: "Algebra",
//         approval_status: "pending",
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//     ]);
//   },

//   async down(queryInterface, Sequelize) {
//     await queryInterface.bulkDelete("courses", null, {});
//     await queryInterface.bulkDelete("users", {
//       email: ["teacher@example.com", "moha@email.com"],
//     });
//   },
// };



"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // 1️⃣ Create a dev student
    const [students] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'dev-student@example.com'`
    );
    if (!students.length) {
      await queryInterface.bulkInsert("users", [
        {
          name: "Dev Student",
          email: "dev-student@example.com",
          password: "hashed_password_here", // ⚠️ replace with hash
          role: "student",
          subject: "Mathematics",
          approval_status: "approved",
          created_at: now,
          updated_at: now,
        },
      ]);
    }

    // 2️⃣ Lookup teacher user
    const [teachers] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'teacher@example.com'`
    );
    if (!teachers.length) return;
    const teacherUserId = teachers[0].id;

    // 3️⃣ Create dev course
    const [courses] = await queryInterface.sequelize.query(
      `SELECT id FROM courses WHERE slug = 'dev-course'`
    );
    if (!courses.length) {
      await queryInterface.bulkInsert("courses", [
        {
          title: "Dev Course",
          slug: "dev-course",
          description: "Temporary development course",
          price: 0,
          category: "Mathematics",
          created_by: teacherUserId, // ✅ consistent
          created_at: now,
          updated_at: now,
        },
      ]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("courses", { slug: "dev-course" });
    await queryInterface.bulkDelete("users", {
      email: "dev-student@example.com",
    });
  },
};
