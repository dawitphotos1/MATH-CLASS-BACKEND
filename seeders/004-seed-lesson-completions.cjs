
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("lesson_completions", null, {});

    await queryInterface.bulkInsert("lesson_completions", [
      {
        user_id: 3, // student
        lesson_id: 1,
        completed_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("lesson_completions", null, {});
  },
};
