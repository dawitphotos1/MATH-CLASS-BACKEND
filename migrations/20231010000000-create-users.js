// "use strict";

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.createTable("users", {
//       id: {
//         type: Sequelize.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
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
//         type: Sequelize.ENUM("student", "teacher", "admin"),
//         allowNull: false,
//       },
//       subject: {
//         type: Sequelize.STRING,
//       },
//       approval_status: {
//         type: Sequelize.ENUM("pending", "approved", "rejected"),
//         defaultValue: "approved",
//       },
//       last_login: {
//         type: Sequelize.DATE,
//       },
//       created_at: {
//         type: Sequelize.DATE,
//         allowNull: false,
//         defaultValue: Sequelize.fn("NOW"),
//       },
//       updated_at: {
//         type: Sequelize.DATE,
//         allowNull: false,
//         defaultValue: Sequelize.fn("NOW"),
//       },
//     });
//   },

//   async down(queryInterface) {
//     await queryInterface.dropTable("users");
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
        type: Sequelize.ENUM("student", "teacher", "admin"), // ✅ lowercase only
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

    // ✅ Extra safeguard: enforce lowercase role at DB level
    await queryInterface.sequelize.query(`
      ALTER TABLE "users"
      ADD CONSTRAINT role_lowercase_check
      CHECK (role IN ('student','teacher','admin'))
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("users");
  },
};
