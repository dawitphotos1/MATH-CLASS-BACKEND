
// migrations/20250929000000-add-unit-id-to-lessons.cjs
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("lessons", "unit_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "units", key: "id" },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("lessons", "unit_id");
  },
};
