
// "use strict";

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.bulkDelete("lessons", null, {});

//     await queryInterface.bulkInsert("lessons", [
//       {
//         id: 1,
//         title: "Lesson 1: Variables",
//         content: "Intro to variables in Algebra.",
//         course_id: 1,
//         order_index: 1, // 👈 Add this
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//       {
//         id: 2,
//         title: "Lesson 2: Equations",
//         content: "Solving basic equations.",
//         course_id: 1,
//         order_index: 2, // 👈 And this
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//     ]);
//   },

//   async down(queryInterface, Sequelize) {
//     await queryInterface.bulkDelete("lessons", null, {});
//   },
// };




"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("lessons", null, {});

    await queryInterface.bulkInsert("lessons", [
      // Algebra 1
      {
        id: 1,
        title: "Lesson 1: Variables",
        content: "Introduction to variables in Algebra.",
        course_id: 1, // Algebra 1
        order_index: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        title: "Lesson 2: Equations",
        content: "Solving basic equations.",
        course_id: 1,
        order_index: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Algebra 2
      {
        id: 3,
        title: "Lesson 1: Quadratic Equations",
        content: "Exploring quadratic functions and equations.",
        course_id: 2, // Algebra 2
        order_index: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Pre-Calculus
      {
        id: 4,
        title: "Lesson 1: Functions and Graphs",
        content: "Overview of functions, domains, and ranges.",
        course_id: 3, // Pre-Calculus
        order_index: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Calculus
      {
        id: 5,
        title: "Lesson 1: Limits and Continuity",
        content: "Introduction to limits and continuity in calculus.",
        course_id: 4, // Calculus
        order_index: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Geometry & Trigonometry
      {
        id: 6,
        title: "Lesson 1: Angles and Triangles",
        content: "Introduction to basic geometry and trigonometric ratios.",
        course_id: 5, // Geometry
        order_index: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Statistics & Probability
      {
        id: 7,
        title: "Lesson 1: Descriptive Statistics",
        content: "Understanding mean, median, mode, and data distributions.",
        course_id: 6, // Statistics
        order_index: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("lessons", null, {});
  },
};
