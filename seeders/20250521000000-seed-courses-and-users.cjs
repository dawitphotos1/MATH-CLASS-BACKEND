
// "use strict";

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     // First check if the teacher already exists
//     const existing = await queryInterface.rawSelect(
//       "teachers",
//       {
//         where: { email: "teacher@example.com" },
//       },
//       ["id"]
//     );

//     if (!existing) {
//       return queryInterface.bulkInsert(
//         "teachers",
//         [
//           {
//             id: 1,
//             name: "Default Teacher",
//             email: "teacher@example.com",
//             created_at: new Date(),
//             updated_at: new Date(),
//           },
//         ],
//         {}
//       );
//     }

//     return Promise.resolve(); // Do nothing if already exists
//   },

//   down: async (queryInterface, Sequelize) => {
//     return queryInterface.bulkDelete(
//       "teachers",
//       { email: "teacher@example.com" },
//       {}
//     );
//   },
// };



"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // 1️⃣ Create teacher user
    const [existingUsers] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'teacher@example.com'`
    );

    let teacherUserId;
    if (existingUsers.length > 0) {
      teacherUserId = existingUsers[0].id;
    } else {
      const [newUser] = await queryInterface.bulkInsert(
        "users",
        [
          {
            name: "Teacher User",
            email: "teacher@example.com",
            password: "hashed_password_here", // ⚠️ replace with real hash
            role: "teacher",
            subject: "Mathematics",
            approval_status: "approved",
            created_at: now,
            updated_at: now,
          },
        ],
        { returning: ["id"] }
      );
      teacherUserId = newUser.id;
    }

    // 2️⃣ Link that user in teachers table
    const [existingTeachers] = await queryInterface.sequelize.query(
      `SELECT id FROM teachers WHERE user_id = ${teacherUserId}`
    );

    let teacherId;
    if (existingTeachers.length > 0) {
      teacherId = existingTeachers[0].id;
    } else {
      const [newTeacher] = await queryInterface.bulkInsert(
        "teachers",
        [
          {
            user_id: teacherUserId,
            created_at: now,
            updated_at: now,
          },
        ],
        { returning: ["id"] }
      );
      teacherId = newTeacher.id;
    }

    // 3️⃣ Create demo course owned by that user
    const [existingCourses] = await queryInterface.sequelize.query(
      `SELECT id FROM courses WHERE slug = 'demo-course'`
    );

    if (existingCourses.length === 0) {
      await queryInterface.bulkInsert("courses", [
        {
          title: "Demo Course",
          slug: "demo-course",
          description: "A seeded course for testing lessons",
          price: 0,
          category: "Mathematics",
          created_by: teacherUserId, // ✅ uses users.id, consistent with model
          created_at: now,
          updated_at: now,
        },
      ]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("courses", { slug: "demo-course" });
    await queryInterface.bulkDelete("teachers", {
      user_id: queryInterface.sequelize.literal(
        `(SELECT id FROM users WHERE email = 'teacher@example.com')`
      ),
    });
    await queryInterface.bulkDelete("users", { email: "teacher@example.com" });
  },
};
