
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("lesson_progresses", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: "user_id",
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      lesson_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: "lesson_id",
        references: { model: "lessons", key: "id" },
        onDelete: "CASCADE",
      },
      progress: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      last_viewed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        field: "last_viewed_at",
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("lesson_progresses");
  },
};
