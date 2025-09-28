
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("users");

    // Add email_notification_status if it doesn't already exist
    if (!table.email_notification_status) {
      await queryInterface.addColumn("users", "email_notification_status", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
    }

    // Add is_active if it doesn't already exist
    if (!table.is_active) {
      await queryInterface.addColumn("users", "is_active", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("users");

    if (table.email_notification_status) {
      await queryInterface.removeColumn("users", "email_notification_status");
    }

    if (table.is_active) {
      await queryInterface.removeColumn("users", "is_active");
    }
  },
};
