

// "use strict";
// const bcrypt = require("bcryptjs");

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     const hashedAdmin = await bcrypt.hash("admin123", 10);
//     const hashedTeacher = await bcrypt.hash("teacher123", 10);
//     const hashedStudent = await bcrypt.hash("student123", 10);

//     await queryInterface.bulkInsert("users", [
//       {
//         name: "Admin User",
//         email: "admin@email.com",
//         password: hashedAdmin,
//         role: "admin",
//         subject: null,
//         approval_status: "approved",
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//       {
//         name: "Default Teacher",
//         email: "teacher@example.com",
//         password: hashedTeacher,
//         role: "teacher",
//         subject: "Mathematics",
//         approval_status: "approved",
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//       {
//         name: "Test Student",
//         email: "student@email.com",
//         password: hashedStudent,
//         role: "student",
//         subject: "Algebra",
//         approval_status: "approved",
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//     ]);
//   },

//   down: async (queryInterface, Sequelize) => {
//     await queryInterface.bulkDelete("users", null, {});
//   },
// };


"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // Admin
    await queryInterface.bulkInsert("users", [
      {
        name: "Admin User",
        email: "admin@example.com",
        password: "hashed_password_here", // ⚠️ replace with real hash
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("users", {
      email: [
        "admin@example.com",
        "teacher@example.com",
        "student@example.com",
      ],
    });
  },
};
