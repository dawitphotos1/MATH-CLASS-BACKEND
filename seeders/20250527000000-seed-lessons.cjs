module.exports = {
  up: async (queryInterface, Sequelize) => {
    // STEP 1: Insert the unit header
    const [unitLesson] = await queryInterface.bulkInsert(
      "lessons",
      [
        {
          course_id: 7,
          title: "Unit 0 - Review",
          order_index: 0,
          is_unit_header: true,
          unit_id: null, // This is a unit itself
          content_type: null,
          content_url: null,
          is_preview: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      { returning: true }
    );

    // STEP 2: Insert a regular lesson referencing the unit
    await queryInterface.bulkInsert("lessons", [
      {
        course_id: 7,
        title: "Solving Simple Equations",
        order_index: 1,
        is_unit_header: false,
        unit_id: unitLesson.id, // Reference the unit lesson
        content_type: "video",
        content_url: "https://example.com/video1",
        is_preview: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("lessons", null, {});
  },
};
