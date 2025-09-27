// module.exports = {
//   async up(queryInterface, Sequelize) {
//     // Check if column exists before dropping it
//     await queryInterface.sequelize.query(`
//       DO $$
//       BEGIN
//         IF EXISTS (
//           SELECT 1 
//           FROM information_schema.columns 
//           WHERE table_name='user_course_access' AND column_name='approval_status'
//         ) THEN
//           ALTER TABLE user_course_access DROP COLUMN approval_status;
//         END IF;
//       END$$;
//     `);
//   },

//   async down(queryInterface, Sequelize) {
//     // Optionally add back the column on rollback
//     await queryInterface.addColumn("user_course_access", "approval_status", {
//       type: Sequelize.ENUM("pending", "approved", "rejected"),
//       defaultValue: "pending",
//       allowNull: true,
//     });
//   },
// };




"use strict";

module.exports = {
  up: async () => {
    // ⚠️ No-op: 'approvalStatus' is still required in user_course_accesses table
  },
  down: async () => {
    // ⚠️ No-op
  },
};
