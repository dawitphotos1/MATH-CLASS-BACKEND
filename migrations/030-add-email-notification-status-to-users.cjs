
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("users");

    if (!table.email_notification_status) {
      await queryInterface.addColumn("users", "email_notification_status", {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("users");

    if (table.email_notification_status) {
      await queryInterface.removeColumn("users", "email_notification_status");
    }
  },
};
