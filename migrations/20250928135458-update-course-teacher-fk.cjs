"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const [results] = await queryInterface.sequelize.query(`
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = 'courses'::regclass
        AND contype = 'f'
        AND conname = 'courses_teacher_id_fkey';
    `);

    // Only add constraint if it doesn't already exist
    if (results.length === 0) {
      await queryInterface.addConstraint("courses", {
        fields: ["teacher_id"],
        type: "foreign key",
        name: "courses_teacher_id_fkey",
        references: {
          table: "teachers",
          field: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
    } else {
      console.log(
        "Constraint 'courses_teacher_id_fkey' already exists. Skipping."
      );
    }
  },

  async down(queryInterface) {
    // Remove constraint if it exists
    try {
      await queryInterface.removeConstraint(
        "courses",
        "courses_teacher_id_fkey"
      );
    } catch (err) {
      console.log(
        "Constraint 'courses_teacher_id_fkey' does not exist. Skipping."
      );
    }

    // Re-add original FK pointing to users table
    await queryInterface.addConstraint("courses", {
      fields: ["teacher_id"],
      type: "foreign key",
      name: "courses_teacherId_fkey",
      references: {
        table: "users",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },
};
