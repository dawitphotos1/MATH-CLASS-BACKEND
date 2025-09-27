

"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // check if the column exists before adding it
    const tableDescription = await queryInterface.describeTable("users");
    if (!tableDescription.subject) {
      await queryInterface.addColumn("users", "subject", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // remove the column on rollback
    await queryInterface.removeColumn("users", "subject");
  },
};
