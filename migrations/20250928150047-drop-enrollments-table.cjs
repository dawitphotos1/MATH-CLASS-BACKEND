
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop enrollments first
    await queryInterface.dropTable("enrollments");
  },

  async down(queryInterface, Sequelize) {
    // Optionally recreate enrollments if you want rollback support
    await queryInterface.createTable("enrollments", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        allowNull: false,
      },
      course_id: {
        type: Sequelize.INTEGER,
        references: { model: "courses", key: "id" },
        onUpdate: "CASCADE",
        allowNull: false,
      },
      payment_status: {
        type: Sequelize.ENUM("pending", "paid", "failed"),
        defaultValue: "pending",
      },
      approval_status: {
        type: Sequelize.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
        allowNull: false,
      },
    });
  },
};
