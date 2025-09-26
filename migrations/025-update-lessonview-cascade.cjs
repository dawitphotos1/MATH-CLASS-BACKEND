
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the constraint 'lessons_course_id_fkey' exists before modifying
    const [results] = await queryInterface.sequelize.query(`
      SELECT conname
      FROM pg_constraint
      WHERE conname = 'lessons_course_id_fkey'
    `);

    if (results.length > 0) {
      console.log(
        "Constraint 'lessons_course_id_fkey' exists, proceeding with operations."
      );
      // Proceed with whatever operation you want to perform, e.g., modifying or dropping the constraint
    } else {
      console.log("Constraint 'lessons_course_id_fkey' not found, skipping.");
    }

    // You can also add other operations here if needed
  },

  down: async (queryInterface, Sequelize) => {
    // Ensure that any operations here are safe, e.g., checking before dropping constraints
    const [results] = await queryInterface.sequelize.query(`
      SELECT conname
      FROM pg_constraint
      WHERE conname = 'lessons_course_id_fkey'
    `);

    if (results.length > 0) {
      await queryInterface.removeConstraint(
        "Lessons",
        "lessons_course_id_fkey"
      );
      console.log("Constraint 'lessons_course_id_fkey' removed.");
    } else {
      console.log(
        "Constraint 'lessons_course_id_fkey' not found, skipping removal."
      );
    }
  },
};

