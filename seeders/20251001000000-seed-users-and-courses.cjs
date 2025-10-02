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
