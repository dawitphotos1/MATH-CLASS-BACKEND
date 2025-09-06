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
  up: async (queryInterface, Sequelize) => {
    const [results] = await queryInterface.sequelize.query(
      `SELECT column_name
       FROM information_schema.columns 
       WHERE table_name = 'users' 
         AND column_name = 'email_notification_status';`
    );

    if (results.length === 0) {
      await queryInterface.addColumn("users", "email_notification_status", {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null, // Optional: you can remove or modify as needed
      });
      console.log(
        "✅ Added 'email_notification_status' column to 'users' table."
      );
    } else {
      console.log(
        "ℹ️ 'email_notification_status' column already exists in 'users' table. Skipping..."
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    const [results] = await queryInterface.sequelize.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = 'users' 
         AND column_name = 'email_notification_status';`
    );

    if (results.length > 0) {
      await queryInterface.removeColumn("users", "email_notification_status");
      console.log(
        "✅ Removed 'email_notification_status' column from 'users' table."
      );
    } else {
      console.log(
        "ℹ️ 'email_notification_status' column does not exist. Skipping..."
      );
    }
  },
};
