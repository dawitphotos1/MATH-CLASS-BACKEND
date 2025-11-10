
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("lessons", "is_preview", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    console.log("✅ Added is_preview column to lessons table");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("lessons", "is_preview");
    console.log("✅ Removed is_preview column from lessons table");
  },
};