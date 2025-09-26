
// "use strict";

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     const tableInfo = await queryInterface.describeTable("Courses");

//     if (!tableInfo.teacherId) {
//       console.log("Adding teacherId column to Courses table...");
//       await queryInterface.addColumn("Courses", "teacherId", {
//         type: Sequelize.INTEGER,
//         allowNull: true, // Allows NULL if a course can exist without a teacher
//         references: {
//           model: "users",
//           key: "id",
//         },
//         onUpdate: "CASCADE",
//         onDelete: "SET NULL", // Adjust based on your requirements
//       });
//       console.log("teacherId column added successfully");
//     } else {
//       console.log(
//         "teacherId column already exists in Courses table, skipping migration"
//       );
//     }
//   },

//   async down(queryInterface) {
//     console.log("Removing teacherId column from Courses table...");
//     await queryInterface.removeColumn("Courses", "teacherId");
//     console.log("teacherId column removed successfully");
//   },
// };




"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("courses"); // lowercase here

    if (!tableInfo.teacherId) {
      console.log("Adding teacherId column to courses table...");
      await queryInterface.addColumn("courses", "teacherId", {
        // lowercase here
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users", // check if your Users table is lowercase as well, usually 'users'
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
      console.log("teacherId column added successfully");
    } else {
      console.log(
        "teacherId column already exists in courses table, skipping migration"
      );
    }
  },

  async down(queryInterface) {
    console.log("Removing teacherId column from courses table...");
    await queryInterface.removeColumn("courses", "teacherId"); // lowercase here
    console.log("teacherId column removed successfully");
  },
};
