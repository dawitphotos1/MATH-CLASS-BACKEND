"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("user_course_access", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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

    // Unique constraint on user + course
    await queryInterface.addConstraint("user_course_access", {
      fields: ["user_id", "course_id"],
      type: "unique",
      name: "unique_user_course_access",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("user_course_access");
  },
};
