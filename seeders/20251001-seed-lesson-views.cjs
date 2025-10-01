"use strict";

module.exports = {
  async up(queryInterface) {
    // Dummy lesson views for testing
    await queryInterface.bulkInsert("lesson_views", [
      {
        user_id: 1,
        lesson_id: 1,
        viewed_at: new Date(),
      },
      {
        user_id: 1,
        lesson_id: 2,
        viewed_at: new Date(),
      },
      {
        user_id: 2,
        lesson_id: 1,
        viewed_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("lesson_views", null, {});
  },
};
