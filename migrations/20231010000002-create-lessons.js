"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("lessons", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      content_type: {
        type: Sequelize.STRING,
        defaultValue: "text",
      },
      content_url: {
        type: Sequelize.STRING,
      },
      video_url: {
        type: Sequelize.STRING,
      },
      is_preview: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_unit_header: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      order_index: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "courses", key: "id" },
        onDelete: "CASCADE",
      },
      unit_id: {
        type: Sequelize.INTEGER,
        references: { model: "lessons", key: "id" },
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: "users", key: "id" },
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
    await queryInterface.dropTable("lessons");
  },
};
