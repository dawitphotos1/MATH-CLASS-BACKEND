// "use strict";

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     // Remove approval_status column
//     await queryInterface.removeColumn("user_course_access", "approval_status");

//     // Change approved column to NOT NULL with default false
//     await queryInterface.changeColumn("user_course_access", "approved", {
//       type: Sequelize.BOOLEAN,
//       allowNull: false,
//       defaultValue: false,
//     });
//   },

//   async down(queryInterface, Sequelize) {
//     // Re-add approval_status enum column with default 'pending'
//     await queryInterface.addColumn("user_course_access", "approval_status", {
//       type: Sequelize.ENUM("pending", "approved", "rejected"),
//       allowNull: false,
//       defaultValue: "pending",
//     });

//     // Revert approved column to allow NULL and no default (adjust if needed)
//     await queryInterface.changeColumn("user_course_access", "approved", {
//       type: Sequelize.BOOLEAN,
//       allowNull: true,
//       defaultValue: null,
//     });
//   },
// };
"use strict";

module.exports = {
  up: async () => {
    // ⚠️ No-op: Cleanup already handled in 005-create-user-course-access.cjs
  },
  down: async () => {
    // ⚠️ No-op
  },
};
