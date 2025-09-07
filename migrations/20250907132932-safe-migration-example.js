
"use strict";

const {
  addColumnIfNotExists,
  removeColumnIfExists,
  createTableIfNotExists,
  dropTableIfExists,
  addIndexIfNotExists,
} = require("../utils/migrationHelpers");

module.exports = {
  async up(queryInterface, Sequelize) {
    // Safely add a column
    await addColumnIfNotExists(queryInterface, "users", "is_active", {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });

    // Safely create a table
    await createTableIfNotExists(queryInterface, "courses", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: Sequelize.STRING, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    // Safely add an index
    await addIndexIfNotExists(queryInterface, "users", ["email"], {
      unique: true,
      name: "users_email_unique",
    });
  },

  async down(queryInterface, Sequelize) {
    // Safely remove column
    await removeColumnIfExists(queryInterface, "users", "is_active");

    // Safely drop table
    await dropTableIfExists(queryInterface, "courses");
  },
};
