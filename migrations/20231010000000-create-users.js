// "use strict";

// module.exports = {
//   async up(queryInterface, Sequelize) {

//     console.log("Checking Lessons table for userId column...");
//     try {
//       // Check if userId column exists
//       const columns = await queryInterface.describeTable("Lessons");
//       if (columns.userId) {
//         console.log("userId column already exists, modifying if needed...");
//         // Modify column to ensure correct configuration
//         await queryInterface.changeColumn("Lessons", "userId", {
//           type: Sequelize.INTEGER,
//           allowNull: true, // Adjust based on your needs (true/false)
//           references: {
//             model: "Users",
//             key: "id",
//           },
//           onUpdate: "CASCADE",
//           onDelete: "SET NULL", // Or "CASCADE" if you want to delete lessons when user is deleted
//         });
//         console.log("userId column modified successfully");
//       } else {
//         console.log("Adding userId column...");
//         await queryInterface.addColumn("Lessons", "userId", {
//           type: Sequelize.INTEGER,
//           allowNull: true,
//           references: {
//             model: "Users",
//             key: "id",
//           },
//           onUpdate: "CASCADE",
//           onDelete: "SET NULL",
//         });
//         console.log("userId column added successfully");
//       }
//     } catch (err) {
//       console.error("Error in add-userId-to-lessons migration:", err);
//       throw err;
//     }
//   },

//   async down(queryInterface, Sequelize) {
//     console.log("Removing userId column from Lessons...");
//     await queryInterface.removeColumn("Lessons", "userId");

//     await queryInterface.createTable("Users", {
//       id: {
//         allowNull: false,
//         autoIncrement: true,
//         primaryKey: true,
//         type: Sequelize.INTEGER,
//       },
//       name: {
//         type: Sequelize.STRING,
//         allowNull: false,
//       },
//       email: {
//         type: Sequelize.STRING(100),
//         allowNull: false,
//         unique: true,
//       },
//       password: {
//         type: Sequelize.STRING,
//         allowNull: false,
//       },
//       role: {
//         type: Sequelize.STRING(20),
//         allowNull: false,
//         validate: {
//           isIn: [["student", "teacher", "admin"]],
//         },
//       },
//       subject: {
//         type: Sequelize.STRING,
//         allowNull: true,
//       },
//       approvalStatus: {
//         type: Sequelize.STRING(20),
//         defaultValue: "approved",
//         validate: {
//           isIn: [["pending", "approved", "rejected"]],
//         },
//       },
//       lastLogin: {
//         type: Sequelize.DATE,
//         allowNull: true,
//       },
//       createdAt: {
//         allowNull: false,
//         type: Sequelize.DATE,
//       },
//       updatedAt: {
//         allowNull: false,
//         type: Sequelize.DATE,
//       },
//     });
//   },

//   async down(queryInterface, Sequelize) {
//     await queryInterface.dropTable("Users");

//   },
// };


"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM("student", "teacher", "admin"),
        allowNull: false,
      },
      subject: {
        type: Sequelize.STRING,
      },
      approval_status: {
        type: Sequelize.ENUM("pending", "approved", "rejected"),
        defaultValue: "approved",
      },
      last_login: {
        type: Sequelize.DATE,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("users");
  },
};
