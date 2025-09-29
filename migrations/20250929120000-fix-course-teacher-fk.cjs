// "use strict";

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     // 1️⃣ Drop the old foreign key
//     await queryInterface.removeConstraint("courses", "courses_teacher_id_fkey");

//     // 2️⃣ Add a new foreign key to teachers.id
//     await queryInterface.addConstraint("courses", {
//       fields: ["teacher_id"],
//       type: "foreign key",
//       name: "courses_teacher_id_fkey", // reuse same name
//       references: {
//         table: "teachers",
//         field: "id",
//       },
//       onDelete: "CASCADE",
//       onUpdate: "CASCADE",
//     });
//   },

//   down: async (queryInterface, Sequelize) => {
//     // 1️⃣ Drop the teacher FK
//     await queryInterface.removeConstraint("courses", "courses_teacher_id_fkey");

//     // 2️⃣ Restore old FK to users.id
//     await queryInterface.addConstraint("courses", {
//       fields: ["teacher_id"],
//       type: "foreign key",
//       name: "courses_teacher_id_fkey",
//       references: {
//         table: "users",
//         field: "id",
//       },
//       onDelete: "CASCADE",
//       onUpdate: "CASCADE",
//     });
//   },
// };




"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1️⃣ Drop the old foreign key
    await queryInterface.removeConstraint("courses", "courses_teacher_id_fkey");

    // 2️⃣ Add a new foreign key to teachers.id
    await queryInterface.addConstraint("courses", {
      fields: ["teacher_id"],
      type: "foreign key",
      name: "courses_teacher_id_fkey", // reuse same name
      references: {
        table: "teachers",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 1️⃣ Drop the teacher FK
    await queryInterface.removeConstraint("courses", "courses_teacher_id_fkey");

    // 2️⃣ Restore old FK to users.id
    await queryInterface.addConstraint("courses", {
      fields: ["teacher_id"],
      type: "foreign key",
      name: "courses_teacher_id_fkey",
      references: {
        table: "users",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  },
};
