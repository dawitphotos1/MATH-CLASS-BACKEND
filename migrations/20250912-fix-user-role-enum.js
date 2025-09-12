
"use strict";

/**
 * Migration to fix user role ENUM:
 * - Ensures all roles are lowercase
 * - Replaces old ENUM with lowercase-only values: 'student', 'teacher', 'admin'
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Update any existing rows to lowercase
    await queryInterface.sequelize.query(`
      UPDATE "users"
      SET role = LOWER(role)
      WHERE role IS NOT NULL;
    `);

    // 2. Drop the old ENUM type if it exists
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_users_role') THEN
          ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
          ALTER TABLE "users" ALTER COLUMN "role" TYPE TEXT;
          DROP TYPE enum_users_role;
        END IF;
      END$$;
    `);

    // 3. Create a new ENUM type with only lowercase values
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_users_role" AS ENUM ('student', 'teacher', 'admin');
    `);

    // 4. Apply the new ENUM type back to the column
    await queryInterface.sequelize.query(`
      ALTER TABLE "users"
      ALTER COLUMN "role" TYPE "enum_users_role" USING LOWER(role)::text::"enum_users_role";
    `);

    // 5. Add a CHECK constraint to enforce lowercase safety
    await queryInterface.sequelize.query(`
      ALTER TABLE "users"
      ADD CONSTRAINT role_lowercase_check
      CHECK (role IN ('student','teacher','admin'));
    `);
  },

  async down(queryInterface, Sequelize) {
    // Rollback: remove constraint and ENUM
    await queryInterface.sequelize.query(`
      ALTER TABLE "users" DROP CONSTRAINT IF EXISTS role_lowercase_check;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
      ALTER TABLE "users" ALTER COLUMN "role" TYPE TEXT;
      DROP TYPE IF EXISTS "enum_users_role";
    `);
  },
};
