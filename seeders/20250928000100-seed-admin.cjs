
// "use strict";

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.bulkInsert("users", [
//       {
//         name: "Admin User",
//         email: "wudie@email.com",
//         password: "$2a$10$6Xz8y9zV5ZxW1Q2R3S4T5U6V7W8X9Y0Z1A2B3C4D5E6F7G8H9I0J", // hashed
//         role: "admin",
//         approval_status: "approved",
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//     ]);
//   },

//   async down(queryInterface, Sequelize) {
//     await queryInterface.bulkDelete("users", {
//       email: "wudie@email.com",
//     });
//   },
// };




"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    const [existing] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'admin@example.com'`
    );

    if (!existing.length) {
      await queryInterface.bulkInsert("users", [
        {
          name: "Admin User",
          email: "admin@example.com",
          password: "hashed_password_here", // ⚠️ bcrypt hash required
          role: "admin",
          approval_status: "approved",
          created_at: now,
          updated_at: now,
        },
      ]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("users", { email: "admin@example.com" });
  },
};
