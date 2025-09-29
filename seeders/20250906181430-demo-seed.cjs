
// "use strict";

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     // STEP 0: Clear dependent tables first to avoid FK conflicts
//     await queryInterface.bulkDelete("courses", null, {});
//     await queryInterface.bulkDelete("teachers", null, {});
//     await queryInterface.bulkDelete("users", null, {});

//     // STEP 1: Insert users (no hardcoded IDs)
//     await queryInterface.bulkInsert("users", [
//       {
//         name: "Alice Student",
//         email: "student@example.com",
//         password: "...",
//         role: "student",
//         approval_status: "approved",
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//       {
//         name: "Bob Teacher",
//         email: "teacher@example.com",
//         password: "...",
//         role: "teacher",
//         approval_status: "approved",
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//       {
//         name: "Charlie Admin",
//         email: "admin@example.com",
//         password: "...",
//         role: "admin",
//         approval_status: "approved",
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//     ]);

//     // STEP 2: Look up Bob Teacher's user info to insert as a teacher
//     const [bobUser] = await queryInterface.sequelize.query(
//       `SELECT id, name, email FROM users WHERE email = 'teacher@example.com' LIMIT 1;`,
//       { type: Sequelize.QueryTypes.SELECT }
//     );

//     await queryInterface.bulkInsert("teachers", [
//       {
//         name: bobUser.name,
//         email: bobUser.email,
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//     ]);

//     // STEP 3: Look up teacher ID for Bob to use in course
//     const [bobTeacher] = await queryInterface.sequelize.query(
//       `SELECT id FROM teachers WHERE email = 'teacher@example.com' LIMIT 1;`,
//       { type: Sequelize.QueryTypes.SELECT }
//     );

//     // STEP 4: Insert a course (with slug + price)
//     await queryInterface.bulkInsert("courses", [
//       {
//         title: "Algebra Basics",
//         slug: "algebra-basics",
//         description: "Learn the foundations of algebra.",
//         price: 49.99,
//         teacher_id: bobTeacher.id,
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//     ]);
//   },

//   down: async (queryInterface, Sequelize) => {
//     // Rollback: Delete in reverse order
//     await queryInterface.bulkDelete("courses", null, {});
//     await queryInterface.bulkDelete("teachers", null, {});
//     await queryInterface.bulkDelete("users", null, {});
//   },
// };



"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // 1️⃣ Insert demo student
    const [existingUsers] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'demo-student@example.com'`
    );
    if (!existingUsers.length) {
      await queryInterface.bulkInsert("users", [
        {
          name: "Demo Student",
          email: "demo-student@example.com",
          password: "hashed_password_here",
          role: "student",
          subject: "Geometry",
          approval_status: "approved",
          created_at: now,
          updated_at: now,
        },
      ]);
    }

    // 2️⃣ Lookup teacher user
    const [teachers] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'teacher@example.com'`
    );
    if (!teachers.length) return;
    const teacherUserId = teachers[0].id;

    // 3️⃣ Insert demo course (if needed)
    const [courses] = await queryInterface.sequelize.query(
      `SELECT id FROM courses WHERE slug = 'demo-seed-course'`
    );
    if (!courses.length) {
      await queryInterface.bulkInsert("courses", [
        {
          title: "Demo Seed Course",
          slug: "demo-seed-course",
          description: "Course created by demo seed",
          price: 20,
          category: "Geometry",
          created_by: teacherUserId, // ✅ uses users.id
          created_at: now,
          updated_at: now,
        },
      ]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("courses", { slug: "demo-seed-course" });
    await queryInterface.bulkDelete("users", {
      email: "demo-student@example.com",
    });
  },
};
