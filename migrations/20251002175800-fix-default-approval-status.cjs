// 'use strict';

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up (queryInterface, Sequelize) {
//     /**
//      * Add altering commands here.
//      *
//      * Example:
//      * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
//      */
//   },

//   async down (queryInterface, Sequelize) {
//     /**
//      * Add reverting commands here.
//      *
//      * Example:
//      * await queryInterface.dropTable('users');
//      */
//   }
// };




"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Change default to 'pending'
    await queryInterface.changeColumn("users", "approval_status", {
      type: Sequelize.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    });

    // Make sure existing students are pending
    await queryInterface.sequelize.query(`
      UPDATE "users"
      SET approval_status = 'pending'
      WHERE role = 'student' AND approval_status = 'approved';
    `);
  },

  async down(queryInterface, Sequelize) {
    // Revert default back to 'approved'
    await queryInterface.changeColumn("users", "approval_status", {
      type: Sequelize.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "approved",
    });
  },
};
