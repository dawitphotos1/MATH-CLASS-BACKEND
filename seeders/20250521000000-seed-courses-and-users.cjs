// module.exports = {
//   up: async (queryInterface) => {
//     // Clear existing courses to avoid conflicts
//     await queryInterface.sequelize.query(`DELETE FROM courses;`);
//     // Reset sequence for generated IDs
//     await queryInterface.sequelize.query(
//       `ALTER SEQUENCE courses_id_seq RESTART WITH 13;`
//     );

//     await queryInterface.sequelize.query(`
//       INSERT INTO teachers (id, name, email, "createdAt", "updatedAt")
//       VALUES (1, 'Default Teacher', 'teacher@example.com', NOW(), NOW())
//       ON CONFLICT (id) DO NOTHING;
//     `);

//     await queryInterface.sequelize.query(`
//       INSERT INTO courses (id, title, description, price, "teacherId", "createdAt", "updatedAt")
//       VALUES
//         (7, 'Algebra 1', 'Master the fundamentals of algebra through engaging lessons, visuals, and real-world applications.', 1200.00, 1, NOW(), NOW()),
//         (8, 'Algebra 2', 'Explore equations, functions, systems, matrices, radicals, polynomials, logarithms, conics, sequences, and trigonometry.', 1200.00, 1, NOW(), NOW()),
//         (9, 'Pre-Calculus', 'This two-semester course prepares students for calculus through a deep study of algebra, trigonometry, and analytical geometry.', 1200.00, 1, NOW(), NOW()),
//         (10, 'Calculus', 'A comprehensive AP-level calculus course covering limits, derivatives, integrals, differential equations, and applications.', 1250.00, 1, NOW(), NOW()),
//         (11, 'Geometry & Trigonometry', 'A complete course covering foundational geometry, triangle properties, right triangle trigonometry, quadrilaterals, circles, polygons, 3D figures, and transformations.', 1250.00, 1, NOW(), NOW()),
//         (12, 'Statistics & Probability', 'This course introduces students to the principles of statistics and probability including data analysis, measures of center and spread, modeling distributions, bivariate data, study design, and combinatorics.', 1250.00, 1, NOW(), NOW())
//       ON CONFLICT (id) DO UPDATE
//       SET
//         title = EXCLUDED.title,
//         description = EXCLUDED.description,
//         price = EXCLUDED.price,
//         "teacherId" = EXCLUDED."teacherId",
//         "updatedAt" = NOW();
//     `);
//   },
//   down: async (queryInterface) => {
//     await queryInterface.bulkDelete("courses", null, {});
//     await queryInterface.bulkDelete("teachers", null, {});
//     await queryInterface.bulkDelete("Users", null, {});
//   },
// };

"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Reset courses (if needed)
    await queryInterface.sequelize.query(`
      DELETE FROM courses;
      ALTER SEQUENCE courses_id_seq RESTART WITH 1;
    `);

    // ✅ STEP 1: Insert the teacher into the "users" table first
    await queryInterface.sequelize.query(`
      INSERT INTO users (
        id,
        name,
        email,
        password,
        role,
        subject,
        "createdAt",
        "updatedAt",
        email_notification_status,
        approval_status,
        is_active,
        avatar
      )
      VALUES (
        1,
        'Default Teacher',
        'teacher@example.com',
        'fakehashedpassword',
        'teacher',
        'Mathematics',
        NOW(),
        NOW(),
        true,
        'approved',
        true,
        NULL
      )
      ON CONFLICT (id) DO NOTHING;
    `);

    // ✅ STEP 2: Insert into the "teachers" table
    await queryInterface.sequelize.query(`
      INSERT INTO teachers (id, name, email, "createdAt", "updatedAt")
      VALUES (1, 'Default Teacher', 'teacher@example.com', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);

    // ✅ STEP 3: Insert into the "courses" table
    await queryInterface.sequelize.query(`
      INSERT INTO courses (id, title, description, price, teacher_id, created_at, updated_at)
      VALUES
        (1, 'Algebra 1', 'Master the fundamentals of algebra through engaging lessons, visuals, and real-world applications.', 1200.00, 1, NOW(), NOW()),
        (2, 'Algebra 2', 'Explore equations, functions, systems, matrices, radicals, polynomials, logarithms, conics, sequences, and trigonometry.', 1200.00, 1, NOW(), NOW()),
        (3, 'Pre-Calculus', 'This two-semester course prepares students for calculus through a deep study of algebra, trigonometry, and analytical geometry.', 1200.00, 1, NOW(), NOW()),
        (4, 'Calculus', 'A comprehensive AP-level calculus course covering limits, derivatives, integrals, differential equations, and applications.', 1250.00, 1, NOW(), NOW()),
        (5, 'Geometry & Trigonometry', 'A complete course covering foundational geometry, triangle properties, right triangle trigonometry, quadrilaterals, circles, polygons, 3D figures, and transformations.', 1250.00, 1, NOW(), NOW()),
        (6, 'Statistics & Probability', 'This course introduces students to the principles of statistics and probability including data analysis, measures of center and spread, modeling distributions, bivariate data, study design, and combinatorics.', 1250.00, 1, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE
      SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        price = EXCLUDED.price,
        teacher_id = EXCLUDED.teacher_id,
        updated_at = NOW();
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DELETE FROM courses;
      DELETE FROM teachers WHERE id = 1;
      DELETE FROM users WHERE id = 1;
    `);
  },
};
