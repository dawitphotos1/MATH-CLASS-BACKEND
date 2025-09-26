
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the foreign key constraint already exists using raw SQL
    const [results] = await queryInterface.sequelize.query(`
      SELECT conname
      FROM pg_constraint
      WHERE conname = 'lessons_course_id_fkey'
    `);

    if (results.length === 0) {
      // If the constraint doesn't exist, add it
      await queryInterface.addConstraint("Lessons", {
        fields: ["course_id"],
        type: "foreign key",
        name: "lessons_course_id_fkey",
        references: {
          table: "courses",
          field: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      });
    } else {
      console.log(
        "Foreign key constraint 'lessons_course_id_fkey' already exists, skipping."
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint("Lessons", "lessons_course_id_fkey");
  },
};

