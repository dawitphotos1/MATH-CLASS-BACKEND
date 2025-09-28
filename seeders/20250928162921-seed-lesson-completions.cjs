
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "lesson_completions",
      [
        {
          user_id: 1,
          lesson_id: 1,
          completed_at: new Date("2025-09-25T10:00:00Z"),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          user_id: 2,
          lesson_id: 1,
          completed_at: new Date("2025-09-26T11:30:00Z"),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          user_id: 1,
          lesson_id: 2,
          completed_at: new Date("2025-09-27T09:15:00Z"),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("lesson_completions", null, {});
  },
};
