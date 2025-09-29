
// "use strict";

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     // Users table
//     await queryInterface.createTable("users", {
//       id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
//       name: { type: Sequelize.STRING, allowNull: false },
//       email: { type: Sequelize.STRING(100), unique: true, allowNull: false },
//       password: { type: Sequelize.STRING, allowNull: false },
//       role: {
//         type: Sequelize.ENUM("student", "teacher", "admin"),
//         allowNull: false,
//       },
//       subject: { type: Sequelize.STRING },
//       approval_status: {
//         type: Sequelize.ENUM("pending", "approved", "rejected"),
//         defaultValue: "approved",
//       },
//       last_login: { type: Sequelize.DATE },
//       created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
//       updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
//     });

//     // Courses table
//     await queryInterface.createTable("courses", {
//       id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
//       title: { type: Sequelize.STRING, allowNull: false },
//       slug: { type: Sequelize.STRING, unique: true, allowNull: false },
//       description: { type: Sequelize.TEXT },
//       teacher_id: {
//         type: Sequelize.INTEGER,
//         references: { model: "users", key: "id" },
//         onDelete: "SET NULL",
//       },
//       price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
//       created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
//       updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
//     });

//     // Lessons table
//     await queryInterface.createTable("lessons", {
//       id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
//       course_id: {
//         type: Sequelize.INTEGER,
//         references: { model: "courses", key: "id" },
//         onDelete: "CASCADE",
//       },
//       title: { type: Sequelize.STRING, allowNull: false },
//       content: { type: Sequelize.TEXT },
//       video_url: { type: Sequelize.STRING },
//       order_index: { type: Sequelize.INTEGER, allowNull: false },
//       created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
//       updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
//     });

//     // User course access table
//     await queryInterface.createTable("user_course_access", {
//       id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
//       user_id: {
//         type: Sequelize.INTEGER,
//         references: { model: "users", key: "id" },
//         onDelete: "CASCADE",
//       },
//       course_id: {
//         type: Sequelize.INTEGER,
//         references: { model: "courses", key: "id" },
//         onDelete: "CASCADE",
//       },
//       access_granted_at: {
//         type: Sequelize.DATE,
//         defaultValue: Sequelize.fn("NOW"),
//       },
//       created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
//       updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
//     });

//     // Add unique constraint on user_course_access
//     await queryInterface.addConstraint("user_course_access", {
//       fields: ["user_id", "course_id"],
//       type: "unique",
//       name: "user_course_unique_constraint",
//     });
//   },

//   async down(queryInterface, Sequelize) {
//     // Drop tables in reverse order of dependencies
//     await queryInterface.dropTable("user_course_access");
//     await queryInterface.dropTable("lessons");
//     await queryInterface.dropTable("courses");
//     await queryInterface.dropTable("users");

//     // Drop enums manually (important)
//     await queryInterface.sequelize.query(
//       `DROP TYPE IF EXISTS "enum_users_role";`
//     );
//     await queryInterface.sequelize.query(
//       `DROP TYPE IF EXISTS "enum_users_approval_status";`
//     );
//   },
// };


"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // Insert users
    await queryInterface.bulkInsert("users", [
      {
        name: "Admin User",
        email: "admin@example.com",
        password: "hashed_password_here",
        role: "admin",
        approval_status: "approved",
        created_at: now,
        updated_at: now,
      },
      {
        name: "Teacher User",
        email: "teacher@example.com",
        password: "hashed_password_here",
        role: "teacher",
        subject: "Mathematics",
        approval_status: "approved",
        created_at: now,
        updated_at: now,
      },
      {
        name: "Student User",
        email: "student@example.com",
        password: "hashed_password_here",
        role: "student",
        subject: "Mathematics",
        approval_status: "approved",
        created_at: now,
        updated_at: now,
      },
    ]);

    // Link teacher
    const [teacherUsers] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'teacher@example.com'`
    );
    if (teacherUsers.length) {
      await queryInterface.bulkInsert("teachers", [
        {
          user_id: teacherUsers[0].id,
          created_at: now,
          updated_at: now,
        },
      ]);
    }

    // Create starter course
    if (teacherUsers.length) {
      await queryInterface.bulkInsert("courses", [
        {
          title: "Initial Course",
          slug: "initial-course",
          description: "First seeded course",
          price: 0,
          category: "Mathematics",
          created_by: teacherUsers[0].id,
          created_at: now,
          updated_at: now,
        },
      ]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Delete course
    await queryInterface.bulkDelete("courses", { slug: "initial-course" });

    // Delete teacher by lookup
    const [teacherUsers] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'teacher@example.com'`
    );
    if (teacherUsers.length) {
      await queryInterface.bulkDelete("teachers", {
        user_id: teacherUsers[0].id,
      });
    }

    // Delete users
    await queryInterface.bulkDelete("users", {
      email: [
        "admin@example.com",
        "teacher@example.com",
        "student@example.com",
      ],
    });
  },
};
