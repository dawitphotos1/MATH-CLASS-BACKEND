
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("lessons", null, {});

    await queryInterface.bulkInsert("lessons", [
      {
        id: 1,
        title: "Lesson 1: Variables",
        content: "Intro to variables in Algebra.",
        course_id: 1,
        order_index: 1, // 👈 Add this
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        title: "Lesson 2: Equations",
        content: "Solving basic equations.",
        course_id: 1,
        order_index: 2, // 👈 And this
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("lessons", null, {});
  },
};
