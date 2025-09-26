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
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable(
      "user_course_access"
    );
    if (tableDescription.approval_status) {
      await queryInterface.removeColumn(
        "user_course_access",
        "approval_status"
      );
    } else {
      console.log("Column 'approval_status' does not exist; skipping drop.");
    }
  },

  async down(queryInterface, Sequelize) {
    // Optionally, add the column back on down migration
    const tableDescription = await queryInterface.describeTable(
      "user_course_access"
    );
    if (!tableDescription.approval_status) {
      await queryInterface.addColumn("user_course_access", "approval_status", {
        type: Sequelize.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      });
    }
  },
};
