
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Create new enum type with added values
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_Users_role_new" AS ENUM('admin', 'student', 'user', 'guest');
    `);

    // 2. Drop default on "role" column to avoid cast issues
    await queryInterface.sequelize.query(`
      ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
    `);

    // 3. Alter column type to new enum, casting through text
    await queryInterface.sequelize.query(`
      ALTER TABLE "users" ALTER COLUMN "role" TYPE "enum_Users_role_new" USING "role"::text::"enum_Users_role_new";
    `);

    // 4. Set default back on "role" column
    await queryInterface.sequelize.query(`
      ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'student';
    `);

    // 5. Drop old enum type
    await queryInterface.sequelize.query(`
      DROP TYPE "enum_Users_role";
    `);

    // 6. Rename new enum type to old name
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Users_role_new" RENAME TO "enum_Users_role";
    `);
  },

  async down(queryInterface, Sequelize) {
    // Reverse: recreate old enum with original values
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_Users_role_old" AS ENUM('admin', 'student');
    `);

    // Drop default on role
    await queryInterface.sequelize.query(`
      ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
    `);

    // Change role column back to old enum
    await queryInterface.sequelize.query(`
      ALTER TABLE "users" ALTER COLUMN "role" TYPE "enum_Users_role_old" USING "role"::text::"enum_Users_role_old";
    `);

    // Reset default
    await queryInterface.sequelize.query(`
      ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'student';
    `);

    // Drop new enum type
    await queryInterface.sequelize.query(`
      DROP TYPE "enum_Users_role";
    `);

    // Rename old enum type to original name
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Users_role_old" RENAME TO "enum_Users_role";
    `);
  },
};
