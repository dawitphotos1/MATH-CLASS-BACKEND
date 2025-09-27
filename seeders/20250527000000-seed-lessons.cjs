// module.exports = {
//   up: async (queryInterface) => {
//     await queryInterface.bulkInsert(
//       "lessons",
//       [
//         {
//           courseId: 7,
//           title: "Solving Simple Equations",
//           orderIndex: 1,
//           isUnitHeader: false,
//           unitId: 1,
//           contentType: "video",
//           contentUrl: "https://example.com/video1",
//           isPreview: true,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         },
//         {
//           courseId: 7,
//           title: "Unit 0 - Review",
//           orderIndex: 0,
//           isUnitHeader: true,
//           unitId: 1,
//           contentType: null,
//           contentUrl: null,
//           isPreview: false,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         },
//       ],
//       {}
//     );
//   },
//   down: async (queryInterface) => {
//     await queryInterface.bulkDelete("lessons", null, {});
//   },
// };




module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert(
      "lessons",
      [
        {
          course_id: 1, // ✅ Fix: Changed from 7 to 1
          title: "Solving Simple Equations",
          order_index: 1,
          is_unit_header: false,
          unit_id: 1,
          content_type: "video",
          content_url: "https://example.com/video1",
          is_preview: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          course_id: 1, // ✅ Fix: Changed from 7 to 1
          title: "Unit 0 - Review",
          order_index: 0,
          is_unit_header: true,
          unit_id: 1,
          content_type: null,
          content_url: null,
          is_preview: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete("lessons", null, {});
  },
};
