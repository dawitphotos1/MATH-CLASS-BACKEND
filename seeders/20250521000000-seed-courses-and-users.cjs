
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First check if the teacher already exists
    const existing = await queryInterface.rawSelect(
      "teachers",
      {
        where: { email: "teacher@example.com" },
      },
      ["id"]
    );

    if (!existing) {
      return queryInterface.bulkInsert(
        "teachers",
        [
          {
            id: 1,
            name: "Default Teacher",
            email: "teacher@example.com",
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        {}
      );
    }

    return Promise.resolve(); // Do nothing if already exists
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete(
      "teachers",
      { email: "teacher@example.com" },
      {}
    );
  },
};
