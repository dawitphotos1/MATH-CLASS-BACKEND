"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn("courses", "teacher_id");
  },

  async down(queryInterface) {
    await queryInterface.addColumn("courses", "teacher_id", {
      type: "INTEGER",
      allowNull: true,
      references: {
        model: "users", // or 'teachers' depending on your schema
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },
};
