
// "use strict";

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     // Insert a demo teacher (if not already exists)
//     const [teacher] = await queryInterface.sequelize.query(
//       `SELECT id FROM teachers WHERE email = 'teacher@example.com';`
//     );

//     let teacherId;
//     if (teacher.length > 0) {
//       teacherId = teacher[0].id;
//     } else {
//       const [newTeacher] = await queryInterface.bulkInsert(
//         "teachers",
//         [
//           {
//             name: "Demo Teacher",
//             email: "teacher@example.com",
//             created_at: new Date(),
//             updated_at: new Date(),
//           },
//         ],
//         { returning: ["id"] }
//       );
//       teacherId = newTeacher[0].id;
//     }

//     // Insert demo course
//     await queryInterface.bulkInsert("courses", [
//       {
//         title: "Demo Course",
//         slug: "demo-course",
//         description: "A seeded course for testing lessons",
//         price: 0, // 👈 add this
//         teacher_id: teacher.id, // make sure you’re fetching the teacher correctly
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//     ]);
//   },

//   down: async (queryInterface, Sequelize) => {
//     await queryInterface.bulkDelete("courses", { title: "Demo Course" });
//   },
// };

"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // Lookup teacher user
    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'teacher@example.com'`
    );
    if (!users.length) return; // no teacher user found

    const teacherUserId = users[0].id;

    // Insert course if not exists
    const [existing] = await queryInterface.sequelize.query(
      `SELECT id FROM courses WHERE slug = 'demo-course-2'`
    );

    if (!existing.length) {
      await queryInterface.bulkInsert("courses", [
        {
          title: "Demo Course 2",
          slug: "demo-course-2",
          description: "Another demo seeded course",
          price: 50,
          category: "Mathematics",
          created_by: teacherUserId, // ✅ matches model
          created_at: now,
          updated_at: now,
        },
      ]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("courses", { slug: "demo-course-2" });
  },
};
