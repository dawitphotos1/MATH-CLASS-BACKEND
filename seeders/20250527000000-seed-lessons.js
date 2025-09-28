module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert(
      "lessons",
      [
        {
          courseId: 7,
          title: "Solving Simple Equations",
          orderIndex: 1,
          isUnitHeader: false,
          unitId: 1,
          contentType: "video",
          contentUrl: "https://example.com/video1",
          isPreview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          courseId: 7,
          title: "Unit 0 - Review",
          orderIndex: 0,
          isUnitHeader: true,
          unitId: 1,
          contentType: null,
          contentUrl: null,
          isPreview: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete("lessons", null, {});
  },
};
