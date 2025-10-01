// export async function up(queryInterface, Sequelize) {
//   await queryInterface.createTable("lesson_views", {
//     id: {
//       type: Sequelize.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     user_id: {
//       type: Sequelize.INTEGER,
//       allowNull: false,
//       references: { model: "users", key: "id" },
//       onDelete: "CASCADE",
//     },
//     lesson_id: {
//       type: Sequelize.INTEGER,
//       allowNull: false,
//       references: { model: "lessons", key: "id" },
//       onDelete: "CASCADE",
//     },
//     viewed_at: {
//       type: Sequelize.DATE,
//       allowNull: false,
//       defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
//     },
//   });

//   await queryInterface.addConstraint("lesson_views", {
//     type: "unique",
//     fields: ["user_id", "lesson_id"],
//     name: "lesson_views_user_id_lesson_id_unique",
//   });
// }

// export async function down(queryInterface) {
//   await queryInterface.dropTable("lesson_views");
// }



"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("lesson_views", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: "user_id", // force snake_case
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      lesson_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: "lesson_id", // force snake_case
        references: { model: "lessons", key: "id" },
        onDelete: "CASCADE",
      },
      viewed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        field: "viewed_at", // force snake_case
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addConstraint("lesson_views", {
      type: "unique",
      fields: ["user_id", "lesson_id"], // match field names
      name: "lesson_views_user_id_lesson_id_unique",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("lesson_views");
  },
};
