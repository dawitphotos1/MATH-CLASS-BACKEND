
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("courses", null, {});

    await queryInterface.bulkInsert("courses", [
      {
        id: 1, // 👈 Explicit course ID
        title: "Algebra 1",
        slug: "algebra-1",
        description: "Introduction to Algebra",
        teacher_id: 2, // matches teacher seeded with id: 2
        price: 200.0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2, // 👈 Explicit course ID
        title: "Geometry",
        slug: "geometry",
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
  },
};
