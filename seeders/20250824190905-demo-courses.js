"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("courses", [
      {
        title: "Algebra 2",
        slug: "algebra-2",
        description:
          "An intermediate algebra course covering quadratic equations, functions, and polynomials.",
        teacher_id: null, // or set to a valid teacher user_id if you already have one
        price: 49.99,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: "Geometry Basics",
        slug: "geometry-basics",
        description:
          "Covers fundamental geometry concepts including angles, shapes, and proofs.",
        teacher_id: null,
        price: 39.99,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("courses", null, {});
  },
};
