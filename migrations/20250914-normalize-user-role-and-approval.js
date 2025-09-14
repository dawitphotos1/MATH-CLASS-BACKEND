// // migrations/20250914-normalize-user-role-and-approval.js
// "use strict";

// module.exports = {
//   async up(queryInterface) {
//     // Normalize existing values to lowercase
//     await queryInterface.sequelize.query(`
//       UPDATE "users"
//       SET role = LOWER(role::text)
//       WHERE role IS NOT NULL;
//     `);

//     await queryInterface.sequelize.query(`
//       UPDATE "users"
//       SET approval_status = LOWER(approval_status::text)
//       WHERE approval_status IS NOT NULL;
//     `);
//   },

//   async down(queryInterface) {
//     // ❌ Can't safely restore original casing, so do nothing
//     console.log("Down migration skipped: cannot restore original casing.");
//   },
// };




// migrations/20250914-normalize-user-role-and-approval.js
"use strict";

module.exports = {
  async up(queryInterface) {
    // Normalize role
    await queryInterface.sequelize.query(`
      UPDATE "users"
      SET role = LOWER(role::text)::enum_users_role
      WHERE role IS NOT NULL;
    `);

    // Normalize approval_status
    await queryInterface.sequelize.query(`
      UPDATE "users"
      SET approval_status = LOWER(approval_status::text)::enum_users_approval_status
      WHERE approval_status IS NOT NULL;
    `);
  },

  async down() {
    console.log("Down migration skipped: cannot restore original casing.");
  },
};
