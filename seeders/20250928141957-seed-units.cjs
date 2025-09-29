
// "use strict";

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     await queryInterface.bulkInsert("units", [
//       {
//         id: 1,
//         name: "Unit 0 - Review",
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//     ]);
//   },

//   down: async (queryInterface, Sequelize) => {
//     await queryInterface.bulkDelete("units", null, {});
//   },
// };




"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    const [existing] = await queryInterface.sequelize.query(
      `SELECT id FROM units WHERE name = 'Unit 0 - Review'`
    );

    if (!existing.length) {
      await queryInterface.bulkInsert("units", [
        {
          name: "Unit 0 - Review",
          created_at: now,
          updated_at: now,
        },
      ]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("units", { name: "Unit 0 - Review" });
  },
};
