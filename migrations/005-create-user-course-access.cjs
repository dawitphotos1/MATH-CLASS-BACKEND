// "use strict";
// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     await queryInterface.createTable("user_course_access", {
//       id: {
//         allowNull: false,
//         autoIncrement: true,
//         primaryKey: true,
//         type: Sequelize.INTEGER,
//       },
//       user_id: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//         references: { model: "users", key: "id" },
//         onDelete: "CASCADE",
//       },
//       course_id: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//         references: { model: "courses", key: "id" },
//         onDelete: "CASCADE",
//       },
//       access_granted_at: {
//         type: Sequelize.DATE,
//         defaultValue: Sequelize.fn("NOW"),
//       },
//       approved: {
//         type: Sequelize.BOOLEAN,
//         defaultValue: false,
//       },
//       approval_status: {
//         type: Sequelize.ENUM("pending", "approved", "rejected"),
//         defaultValue: "pending",
//       },
//       payment_status: {
//         type: Sequelize.ENUM("pending", "paid", "failed"),
//         defaultValue: "pending",
//       },
//       created_at: {
//         allowNull: false,
//         type: Sequelize.DATE,
//         defaultValue: Sequelize.fn("NOW"),
//       },
//       updated_at: {
//         allowNull: false,
//         type: Sequelize.DATE,
//         defaultValue: Sequelize.fn("NOW"),
//       },
//     });
//   },

//   down: async (queryInterface, Sequelize) => {
//     await queryInterface.dropTable("user_course_access");
//   },
// };



"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("user_course_accesses", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      courseId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "courses", key: "id" },
        onDelete: "CASCADE",
      },
      accessGrantedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      approved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      approvalStatus: {
        type: Sequelize.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      paymentStatus: {
        type: Sequelize.ENUM("pending", "paid", "failed"),
        defaultValue: "pending",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("user_course_accesses");
  },
};
