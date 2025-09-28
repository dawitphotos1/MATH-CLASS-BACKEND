
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // STEP 0: Clear dependent tables first to avoid conflicts
    await queryInterface.bulkDelete("courses", null, {});
    await queryInterface.bulkDelete("teachers", null, {});
    await queryInterface.bulkDelete("users", null, {});

    // Reset ID sequences (for PostgreSQL)
    await queryInterface.sequelize.query(
      `ALTER SEQUENCE courses_id_seq RESTART WITH 1;`
    );
    await queryInterface.sequelize.query(
      `ALTER SEQUENCE teachers_id_seq RESTART WITH 1;`
    );
    await queryInterface.sequelize.query(
      `ALTER SEQUENCE users_id_seq RESTART WITH 1;`
    );

    // STEP 1: Insert users
    await queryInterface.bulkInsert("users", [
      {
        id: 1,
        name: "Alice Student",
        email: "student@example.com",
        password: "...",
        role: "student",
        approval_status: "approved",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        name: "Bob Teacher",
        email: "teacher@example.com",
        password: "...",
        role: "teacher",
        approval_status: "approved",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        name: "Charlie Admin",
        email: "admin@example.com",
        password: "...",
        role: "admin",
        approval_status: "approved",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // STEP 2: Insert corresponding teacher
    await queryInterface.bulkInsert("teachers", [
      {
        id: 2,
        name: "Bob Teacher",
        email: "teacher@example.com",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // STEP 3: Insert the course referencing teacher_id: 2
    await queryInterface.bulkInsert("courses", [
      {
        id: 1,
        title: "Algebra Basics",
        description: "Learn the foundations of algebra.",
        price: 49.99,
        teacher_id: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("courses", null, {});
    await queryInterface.bulkDelete("teachers", null, {});
    await queryInterface.bulkDelete("users", null, {});
  },
};
