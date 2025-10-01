
// migrations/006-create-lesson-completions.cjs
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("lesson_completions", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",  // ✅ delete user → completions gone
        onUpdate: "CASCADE",
      },
      lesson_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "lessons", key: "id" },
        onDelete: "CASCADE",  // ✅ delete lesson (or course) → completions gone
        onUpdate: "CASCADE",
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
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
    await queryInterface.dropTable("lesson_completions");
  },
};
