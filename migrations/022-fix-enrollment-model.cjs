
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Fix approvalStatus enum
    await queryInterface.changeColumn(
      "user_course_accesses",
      "approvalStatus",
      {
        type: Sequelize.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      }
    );

    // Fix paymentStatus enum
    await queryInterface.changeColumn("user_course_accesses", "paymentStatus", {
      type: Sequelize.ENUM("pending", "paid", "failed"),
      allowNull: false,
      defaultValue: "pending",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      "user_course_accesses",
      "approvalStatus",
      {
        type: Sequelize.ENUM("pending", "approved", "rejected"),
        allowNull: true,
        defaultValue: "pending",
      }
    );

    await queryInterface.changeColumn("user_course_accesses", "paymentStatus", {
      type: Sequelize.ENUM("pending", "paid", "failed"),
      allowNull: true,
      defaultValue: "pending",
    });
  },
};
