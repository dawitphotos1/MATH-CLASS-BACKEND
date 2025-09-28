
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("users");

    if (!table.created_at) {
      await queryInterface.addColumn("users", "created_at", {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      });
    }

    if (!table.updated_at) {
      await queryInterface.addColumn("users", "updated_at", {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("users", "created_at");
    await queryInterface.removeColumn("users", "updated_at");
  },
};
