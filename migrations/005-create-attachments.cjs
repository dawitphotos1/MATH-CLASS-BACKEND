
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("attachments", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      lesson_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "lessons", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      file_path: { type: Sequelize.STRING, allowNull: false },
      file_type: { type: Sequelize.STRING },
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
    await queryInterface.dropTable("attachments");
  },
};
