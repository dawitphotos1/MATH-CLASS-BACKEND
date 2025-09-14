
"use strict";

module.exports = {
  async up(queryInterface) {
    // Normalize role (enum or text) → lowercase
    await queryInterface.sequelize.query(`
      UPDATE "users"
      SET role = LOWER(role::text)::enum_users_role
      WHERE role IS NOT NULL;
    `);

    // Normalize approval_status (enum) → lowercase
    await queryInterface.sequelize.query(`
      UPDATE "users"
      SET approval_status = LOWER(approval_status::text)::enum_users_approval_status
      WHERE approval_status IS NOT NULL;
    `);
  },

  async down() {
    // no rollback needed
  },
};
