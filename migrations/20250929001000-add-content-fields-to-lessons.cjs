// migrations/20250929001000-add-content-fields-to-lessons.cjs
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("lessons", "content_type", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("lessons", "content_url", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("lessons", "content_type");
    await queryInterface.removeColumn("lessons", "content_url");
  },
};
