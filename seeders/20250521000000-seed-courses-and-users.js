module.exports = {
  up: async (queryInterface) => {
    // Clear existing courses to avoid conflicts
    await queryInterface.sequelize.query(`DELETE FROM courses;`);
    // Reset sequence for generated IDs
    await queryInterface.sequelize.query(
      `ALTER SEQUENCE courses_id_seq RESTART WITH 13;`
    );

    await queryInterface.sequelize.query(`
      INSERT INTO teachers (id, name, email, "createdAt", "updatedAt")
      VALUES (1, 'Default Teacher', 'teacher@example.com', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);

    await queryInterface.sequelize.query(`
      INSERT INTO courses (id, title, description, price, "teacherId", "createdAt", "updatedAt")
      VALUES
        (7, 'Algebra 1', 'Master the fundamentals of algebra through engaging lessons, visuals, and real-world applications.', 1200.00, 1, NOW(), NOW()),
        (8, 'Algebra 2', 'Explore equations, functions, systems, matrices, radicals, polynomials, logarithms, conics, sequences, and trigonometry.', 1200.00, 1, NOW(), NOW()),
        (9, 'Pre-Calculus', 'This two-semester course prepares students for calculus through a deep study of algebra, trigonometry, and analytical geometry.', 1200.00, 1, NOW(), NOW()),
        (10, 'Calculus', 'A comprehensive AP-level calculus course covering limits, derivatives, integrals, differential equations, and applications.', 1250.00, 1, NOW(), NOW()),
        (11, 'Geometry & Trigonometry', 'A complete course covering foundational geometry, triangle properties, right triangle trigonometry, quadrilaterals, circles, polygons, 3D figures, and transformations.', 1250.00, 1, NOW(), NOW()),
        (12, 'Statistics & Probability', 'This course introduces students to the principles of statistics and probability including data analysis, measures of center and spread, modeling distributions, bivariate data, study design, and combinatorics.', 1250.00, 1, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE
      SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        price = EXCLUDED.price,
        "teacherId" = EXCLUDED."teacherId",
        "updatedAt" = NOW();
    `);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete("courses", null, {});
    await queryInterface.bulkDelete("teachers", null, {});
    await queryInterface.bulkDelete("Users", null, {});
  },
};
