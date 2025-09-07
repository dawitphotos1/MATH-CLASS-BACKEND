
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Example: adjust column types or constraints
    await queryInterface.changeColumn("usercourseaccess", "approval_status", {
      type: Sequelize.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    });
  },
  async down(queryInterface, Sequelize) {
    // Optional rollback
    await queryInterface.changeColumn("usercourseaccess", "approval_status", {
      type: Sequelize.STRING,
    });
  },
};

