
"use strict";

/**
 * Migration to fix user approval_status ENUM:
 * - Ensures all approval_status values are lowercase
 * - Replaces old ENUM with lowercase-only values: 'pending', 'approved', 'rejected'
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Update any existing rows to lowercase
    await queryInterface.sequelize.query(`
      UPDATE "users"
      SET approval_status = LOWER(approval_status)
      WHERE approval_status IS NOT NULL;
    `);

    // 2. Drop the old ENUM type if it exists
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_users_approval_status') THEN
          ALTER TABLE "users" ALTER COLUMN "approval_status" DROP DEFAULT;
          ALTER TABLE "users" ALTER COLUMN "approval_status" TYPE TEXT;
          DROP TYPE enum_users_approval_status;
        END IF;
      END$$;
    `);

    // 3. Create a new ENUM type with only lowercase values
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_users_approval_status" AS ENUM ('pending', 'approved', 'rejected');
    `);

    // 4. Apply the new ENUM type back to the column
    await queryInterface.sequelize.query(`
      ALTER TABLE "users"
      ALTER COLUMN "approval_status" TYPE "enum_users_approval_status"
      USING LOWER(approval_status)::text::"enum_users_approval_status";
    `);

    // 5. Add a CHECK constraint for extra safety
    await queryInterface.sequelize.query(`
      ALTER TABLE "users"
      ADD CONSTRAINT approval_status_lowercase_check
      CHECK (approval_status IN ('pending','approved','rejected'));
    `);
  },

  async down(queryInterface, Sequelize) {
    // Rollback: remove constraint and ENUM
    await queryInterface.sequelize.query(`
      ALTER TABLE "users" DROP CONSTRAINT IF EXISTS approval_status_lowercase_check;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "users" ALTER COLUMN "approval_status" DROP DEFAULT;
      ALTER TABLE "users" ALTER COLUMN "approval_status" TYPE TEXT;
      DROP TYPE IF EXISTS "enum_users_approval_status";
    `);
  },
};
