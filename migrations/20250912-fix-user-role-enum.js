
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Remove default if any
    await queryInterface.sequelize.query(`
      ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
    `);

    // 2. Change role column to TEXT so we can update values and drop enum
    await queryInterface.sequelize.query(`
      ALTER TABLE "users" ALTER COLUMN "role" TYPE TEXT;
    `);

    // 3. Drop old enum type if it exists
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_users_role') THEN
          DROP TYPE enum_users_role;
        END IF;
      END $$;
    `);

    // 4. Create new enum type
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_users_role" AS ENUM ('student', 'teacher', 'admin');
    `);

    // 5. Clean up and normalize role values
    await queryInterface.sequelize.query(`
      UPDATE "users"
      SET role = LOWER(role);
    `);

    // 6. Convert column back to enum
    await queryInterface.sequelize.query(`
      ALTER TABLE "users"
      ALTER COLUMN "role" TYPE enum_users_role USING role::enum_users_role;
    `);

    // 7. Optionally add default or not null
    await queryInterface.sequelize.query(`
      ALTER TABLE "users"
      ALTER COLUMN "role" SET DEFAULT 'student';
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "users"
      ALTER COLUMN "role" SET NOT NULL;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Revert to TEXT
    await queryInterface.sequelize.query(`
      ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "users" ALTER COLUMN "role" DROP NOT NULL;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "users" ALTER COLUMN "role" TYPE TEXT;
    `);

    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_users_role";
    `);
  },
};
