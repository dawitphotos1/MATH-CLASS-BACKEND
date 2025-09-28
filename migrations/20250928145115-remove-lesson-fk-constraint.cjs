
"use strict";

module.exports = {
  async up(queryInterface) {
    const [results] = await queryInterface.sequelize.query(`
      SELECT to_regclass('public.lesson_completions') AS table_exists;
    `);

    if (results[0].table_exists !== null) {
      const [constraints] = await queryInterface.sequelize.query(`
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'lesson_completions'::regclass
          AND conname = 'lesson_completions_lesson_id_fkey';
      `);

      if (constraints.length > 0) {
        await queryInterface.removeConstraint(
          "lesson_completions",
          "lesson_completions_lesson_id_fkey"
        );
        console.log("Removed constraint 'lesson_completions_lesson_id_fkey'");
      } else {
        console.log("Constraint does not exist, skipping.");
      }
    } else {
      console.log("Table 'lesson_completions' does not exist. Skipping.");
    }
  },

  async down(queryInterface, Sequelize) {
    // You can add logic to re-add the constraint here if needed
    console.log("Down migration skipped (table doesn't exist).");
  },
};
