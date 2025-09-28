
"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.renameColumn("courses", "teacher_id", "teacherId");
  },

  async down(queryInterface) {
    await queryInterface.renameColumn("courses", "teacherId", "teacher_id");
  },
};
