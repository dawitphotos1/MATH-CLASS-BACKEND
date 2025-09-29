
// "use strict";

// module.exports = {
//   async up(queryInterface) {
//     await queryInterface.bulkInsert("courses", [
//       {
//         title: "Algebra 2",
//         slug: "algebra-2",
//         description:
//           "An intermediate algebra course covering quadratic equations, functions, and polynomials.",
//         teacher_id: null, // or set to a valid teacher user_id if you already have one
//         price: 49.99,
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//       {
//         title: "Geometry Basics",
//         slug: "geometry-basics",
//         description:
//           "Covers fundamental geometry concepts including angles, shapes, and proofs.",
//         teacher_id: null,
//         price: 39.99,
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//     ]);
//   },

//   async down(queryInterface) {
//     await queryInterface.bulkDelete("courses", null, {});
//   },
// };



"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // Lookup teacher user
    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'teacher@example.com'`
    );
    if (!users.length) return;
    const teacherUserId = users[0].id;

    // Algebra Basics
    const [algebra] = await queryInterface.sequelize.query(
      `SELECT id FROM courses WHERE slug = 'algebra-basics'`
    );
    if (!algebra.length) {
      await queryInterface.bulkInsert("courses", [
        {
          title: "Algebra Basics",
          slug: "algebra-basics",
          description: "Introduction to algebraic principles",
          price: 100,
          category: "Mathematics",
          created_by: teacherUserId,
          created_at: now,
          updated_at: now,
        },
      ]);
    }

    // Geometry Essentials
    const [geometry] = await queryInterface.sequelize.query(
      `SELECT id FROM courses WHERE slug = 'geometry-essentials'`
    );
    if (!geometry.length) {
      await queryInterface.bulkInsert("courses", [
        {
          title: "Geometry Essentials",
          slug: "geometry-essentials",
          description: "Shapes and figures",
          price: 75,
          category: "Mathematics",
          created_by: teacherUserId,
          created_at: now,
          updated_at: now,
        },
      ]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("courses", {
      slug: ["algebra-basics", "geometry-essentials"],
    });
  },
};
