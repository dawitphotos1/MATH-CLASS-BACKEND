// "use strict";

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     const columnExists = await queryInterface.sequelize.query(
//       `SELECT column_name
//        FROM information_schema.columns 
//        WHERE table_name = 'users' AND column_name = 'email_notification_status'`
//     );

//     // If the column does not exist, we add it
//     if (columnExists[0].length === 0) {
//       await queryInterface.addColumn("users", "email_notification_status", {
//         type: Sequelize.STRING,
//         allowNull: true,
//       });
//       console.log("Added 'email_notification_status' column to 'users' table.");
//     } else {
//       console.log(
//         "'email_notification_status' column already exists in 'users' table. Skipping..."
//       );
//     }
//   },

//   down: async (queryInterface, Sequelize) => {
//     await queryInterface.removeColumn("users", "email_notification_status");
//   },
// };

"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check current columns in "users"
    const table = await queryInterface.describeTable("users");

    if (!table.email_notification_status) {
      await queryInterface.addColumn("users", "email_notification_status", {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      });
      console.log("✅ Added column email_notification_status to users");
    } else {
      console.log(
        "⚠️ Column email_notification_status already exists, skipping"
      );
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("users");

    if (table.email_notification_status) {
      await queryInterface.removeColumn("users", "email_notification_status");
      console.log("🗑️ Removed column email_notification_status from users");
    } else {
      console.log(
        "⚠️ Column email_notification_status does not exist, skipping"
      );
    }
  },
};
