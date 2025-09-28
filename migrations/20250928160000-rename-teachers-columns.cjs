

"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.renameColumn("teachers", "createdAt", "created_at");
    await queryInterface.renameColumn("teachers", "updatedAt", "updated_at");
  },

  async down(queryInterface) {
    await queryInterface.renameColumn("teachers", "created_at", "createdAt");
    await queryInterface.renameColumn("teachers", "updated_at", "updatedAt");
  },
};

