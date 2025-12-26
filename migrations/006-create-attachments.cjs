// migrations/006-create-attachments.cjs - UPDATED
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
      sublesson_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "sublessons", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      file_path: { type: Sequelize.STRING, allowNull: false },
      file_type: { type: Sequelize.STRING },
      file_name: { type: Sequelize.STRING, allowNull: true }, // ✅ ADDED
      file_size: { type: Sequelize.INTEGER, allowNull: true }, // ✅ ADDED
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

    // Add index for better performance
    await queryInterface.addIndex("attachments", ["lesson_id"]);
    await queryInterface.addIndex("attachments", ["sublesson_id"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("attachments");
  },
};