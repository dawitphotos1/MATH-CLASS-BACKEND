
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Clear existing courses
    await queryInterface.bulkDelete("courses", null, {});

    // Insert all 6 subjects
    await queryInterface.bulkInsert("courses", [
      {
        id: 1,
        title: "Algebra 1",
        slug: "algebra-1",
        description: "Introduction to Algebra",
        teacher_id: 2,
        price: 1250,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        title: "Algebra 2",
        slug: "algebra-2",
        description: "Advanced Algebra Concepts",
        teacher_id: 2,
        price: 1200,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        title: "Pre-Calculus",
        slug: "pre-calculus",
        description: "Preparation for Calculus",
        teacher_id: 2,
        price: 1200,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 4,
        title: "Calculus",
        slug: "calculus",
        description: "Differential and Integral Calculus",
        teacher_id: 2,
        price: 1250,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 5,
        title: "Geometry & Trigonometry",
        slug: "geometry-trigonometry",
        description: "Shapes and Angles",
        teacher_id: 2,
        price: 1250,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 6,
        title: "Statistics & Probability",
        slug: "statistics-probability",
        description: "Data Analysis and Probability",
        teacher_id: 2,
        price: 1250,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("courses", null, {});
  },
};
