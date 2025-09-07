

"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("courses", "attachment_urls", {
      type: Sequelize.JSONB,
      defaultValue: [],
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("courses", "attachment_urls");
  },
};

