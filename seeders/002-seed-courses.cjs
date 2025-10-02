"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("courses", null, {});

    await queryInterface.bulkInsert("courses", [
      {
        id: 1,
        title: "Algebra 1",
        slug: "algebra-1",
        description: "Introduction to Algebra",
        teacher_id: 2,
        price: 1250.0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        title: "Geometry & Trigonometry", // <-- FIXED title
        slug: "geometry-trigonometry", // <-- FIXED slug
        description: "Shapes and Angles",
        teacher_id: 2,
        price: 1250.0, // <-- FIXED price to match other seeder
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("courses", null, {});
  },
};
