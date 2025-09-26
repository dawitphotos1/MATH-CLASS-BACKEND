
"use strict";

module.exports = {
  async up(queryInterface) {
    // Force students without explicit approval to pending
    await queryInterface.sequelize.query(`
      UPDATE "users"
      SET approval_status = 'pending'
      WHERE role = 'student' AND approval_status IS DISTINCT FROM 'pending';
    `);

    // Force admins & teachers to approved
    await queryInterface.sequelize.query(`
      UPDATE "users"
      SET approval_status = 'approved'
      WHERE role IN ('admin','teacher');
    `);
  },

  async down() {
    // No rollback needed — data normalization
  },
};
