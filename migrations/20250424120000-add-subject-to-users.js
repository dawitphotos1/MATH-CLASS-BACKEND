// "use strict";

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     const tableInfo = await queryInterface.describeTable("Users");

//     if (!tableInfo.subject) {
//       console.log("Adding subject column to Users table...");
//       await queryInterface.addColumn("Users", "subject", {
//         type: Sequelize.STRING,
// <<<<<<< HEAD
//         allowNull: true, // Allows NULL since admins may not have a subject
// =======
//         allowNull: true,
// >>>>>>> 899418cd511bd0d2a4d0b66c9f013b4e49f6b202
//       });
//       console.log("subject column added successfully");
//     } else {
//       console.log(
//         "subject column already exists in Users table, skipping migration"
//       );
//     }
//   },

//   async down(queryInterface, Sequelize) {
//     console.log("Removing subject column from Users table...");
//     await queryInterface.removeColumn("Users", "subject");
//     console.log("subject column removed successfully");
//   },
// <<<<<<< HEAD
// };
// =======
// };
// >>>>>>> 899418cd511bd0d2a4d0b66c9f013b4e49f6b202




"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("Users");

    if (!tableInfo.subject) {
      console.log("Adding subject column to Users table...");
      await queryInterface.addColumn("Users", "subject", {
        type: Sequelize.STRING,
        allowNull: true, // Allows NULL since admins may not have a subject
      });
      console.log("subject column added successfully");
    } else {
      console.log(
        "subject column already exists in Users table, skipping migration"
      );
    }
  },

  async down(queryInterface) {
    console.log("Removing subject column from Users table...");
    await queryInterface.removeColumn("Users", "subject");
    console.log("subject column removed successfully");
  },
};
