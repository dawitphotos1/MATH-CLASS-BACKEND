// <<<<<<< HEAD

// =======
// >>>>>>> 899418cd511bd0d2a4d0b66c9f013b4e49f6b202
// "use strict";

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.createTable("UserCourseAccess", {
// <<<<<<< HEAD
//       userId: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//         primaryKey: true,
// =======
//       id: {
//         allowNull: false,
//         autoIncrement: true,
//         primaryKey: true,
//         type: Sequelize.INTEGER,
//       },
//       userId: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
// >>>>>>> 899418cd511bd0d2a4d0b66c9f013b4e49f6b202
//         references: {
//           model: "Users",
//           key: "id",
//         },
//         onUpdate: "CASCADE",
//         onDelete: "CASCADE",
//       },
//       courseId: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
// <<<<<<< HEAD
//         primaryKey: true,
// =======
// >>>>>>> 899418cd511bd0d2a4d0b66c9f013b4e49f6b202
//         references: {
//           model: "Courses",
//           key: "id",
//         },
//         onUpdate: "CASCADE",
//         onDelete: "CASCADE",
//       },
//       accessGrantedAt: {
//         type: Sequelize.DATE,
//         allowNull: false,
//         defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
//       },
// <<<<<<< HEAD
// =======
//       createdAt: {
//         allowNull: false,
//         type: Sequelize.DATE,
//       },
//       updatedAt: {
//         allowNull: false,
//         type: Sequelize.DATE,
//       },
// >>>>>>> 899418cd511bd0d2a4d0b66c9f013b4e49f6b202
//     });
//   },

//   async down(queryInterface, Sequelize) {
//     await queryInterface.dropTable("UserCourseAccess");
//   },
// <<<<<<< HEAD
// };
// =======
// };
// >>>>>>> 899418cd511bd0d2a4d0b66c9f013b4e49f6b202



"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("user_course_access", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "courses", key: "id" },
        onDelete: "CASCADE",
      },
      access_granted_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      approved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      approval_status: {
        type: Sequelize.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      payment_status: {
        type: Sequelize.ENUM("pending", "paid", "failed"),
        defaultValue: "pending",
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("user_course_access");
  },
};
