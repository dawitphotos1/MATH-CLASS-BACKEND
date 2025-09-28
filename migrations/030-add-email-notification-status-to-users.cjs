
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("Users");

    if (!table.email_notification_status) {
      await queryInterface.addColumn("Users", "email_notification_status", {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("Users");

    if (table.email_notification_status) {
      await queryInterface.removeColumn("Users", "email_notification_status");
    }
  },
};
