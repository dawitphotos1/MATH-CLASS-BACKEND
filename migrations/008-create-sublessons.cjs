
// migrations/008-create-sublessons.cjs
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("sublessons", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      lesson_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "lessons",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      order_index: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      content_type: {
        type: Sequelize.ENUM("text", "video", "pdf", "mixed"),
        defaultValue: "text",
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

    // Add index for better performance
    await queryInterface.addIndex("sublessons", ["lesson_id", "order_index"]);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("sublessons", ["lesson_id", "order_index"]);
    await queryInterface.dropTable("sublessons");
  },
};