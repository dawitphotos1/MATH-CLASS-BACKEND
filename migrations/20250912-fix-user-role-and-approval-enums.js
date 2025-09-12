// "use strict";

// /**
//  * Migration to fix ENUMs in users table:
//  * - Ensures role is always lowercase: 'student', 'teacher', 'admin'
//  * - Ensures approval_status is always lowercase: 'pending', 'approved', 'rejected'
//  * - Cleans existing data to lowercase
//  * - Drops old ENUMs and replaces with strict lowercase-only ones
//  */

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     // ✅ Step 1: Normalize existing data to lowercase
//     await queryInterface.sequelize.query(`
//       UPDATE "users"
//       SET role = LOWER(role)
//       WHERE role IS NOT NULL;
//     `);

//     await queryInterface.sequelize.query(`
//       UPDATE "users"
//       SET approval_status = LOWER(approval_status)
//       WHERE approval_status IS NOT NULL;
//     `);

//     // ✅ Step 2: Drop old role ENUM type if it exists
//     await queryInterface.sequelize.query(`
//       DO $$
//       BEGIN
//         IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_users_role') THEN
//           ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
//           ALTER TABLE "users" ALTER COLUMN "role" TYPE TEXT;
//           DROP TYPE enum_users_role;
//         END IF;
//       END$$;
//     `);

//     // ✅ Step 3: Drop old approval_status ENUM type if it exists
//     await queryInterface.sequelize.query(`
//       DO $$
//       BEGIN
//         IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_users_approval_status') THEN
//           ALTER TABLE "users" ALTER COLUMN "approval_status" DROP DEFAULT;
//           ALTER TABLE "users" ALTER COLUMN "approval_status" TYPE TEXT;
//           DROP TYPE enum_users_approval_status;
//         END IF;
//       END$$;
//     `);

//     // ✅ Step 4: Create new ENUMs with lowercase-only values
//     await queryInterface.sequelize.query(`
//       CREATE TYPE "enum_users_role" AS ENUM ('student', 'teacher', 'admin');
//     `);

//     await queryInterface.sequelize.query(`
//       CREATE TYPE "enum_users_approval_status" AS ENUM ('pending', 'approved', 'rejected');
//     `);

//     // ✅ Step 5: Re-apply ENUMs to columns
//     await queryInterface.sequelize.query(`
//       ALTER TABLE "users"
//       ALTER COLUMN "role" TYPE "enum_users_role"
//       USING LOWER(role)::text::"enum_users_role";
//     `);

//     await queryInterface.sequelize.query(`
//       ALTER TABLE "users"
//       ALTER COLUMN "approval_status" TYPE "enum_users_approval_status"
//       USING LOWER(approval_status)::text::"enum_users_approval_status";
//     `);

//     // ✅ Step 6: Add CHECK constraints for extra safety
//     await queryInterface.sequelize.query(`
//       ALTER TABLE "users"
//       ADD CONSTRAINT role_lowercase_check
//       CHECK (role IN ('student','teacher','admin'));
//     `);

//     await queryInterface.sequelize.query(`
//       ALTER TABLE "users"
//       ADD CONSTRAINT approval_status_lowercase_check
//       CHECK (approval_status IN ('pending','approved','rejected'));
//     `);
//   },

//   async down(queryInterface, Sequelize) {
//     // Rollback: remove constraints and ENUMs
//     await queryInterface.sequelize.query(`
//       ALTER TABLE "users" DROP CONSTRAINT IF EXISTS role_lowercase_check;
//     `);

//     await queryInterface.sequelize.query(`
//       ALTER TABLE "users" DROP CONSTRAINT IF EXISTS approval_status_lowercase_check;
//     `);

//     await queryInterface.sequelize.query(`
//       ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
//       ALTER TABLE "users" ALTER COLUMN "role" TYPE TEXT;
//       DROP TYPE IF EXISTS "enum_users_role";
//     `);

//     await queryInterface.sequelize.query(`
//       ALTER TABLE "users" ALTER COLUMN "approval_status" DROP DEFAULT;
//       ALTER TABLE "users" ALTER COLUMN "approval_status" TYPE TEXT;
//       DROP TYPE IF EXISTS "enum_users_approval_status";
//     `);
//   },
// };




"use strict";

/**
 * Migration to fix ENUMs in users table:
 * - Ensures role is always lowercase: 'student', 'teacher', 'admin'
 * - Ensures approval_status is always lowercase: 'pending', 'approved', 'rejected'
 * - Cleans existing data to lowercase
 * - Drops old ENUMs and replaces with strict lowercase-only ones
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    // ✅ Step 1: Normalize existing data to lowercase
    await queryInterface.sequelize.query(`
      UPDATE "users"
      SET role = LOWER(role)
      WHERE role IS NOT NULL;
    `);

    await queryInterface.sequelize.query(`
      UPDATE "users"
      SET approval_status = LOWER(approval_status)
      WHERE approval_status IS NOT NULL;
    `);

    // ✅ Step 2: Drop old role ENUM type if it exists
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

    // ✅ Step 3: Drop old approval_status ENUM type if it exists
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

    // ✅ Step 4: Create new ENUMs with lowercase-only values
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_users_role" AS ENUM ('student', 'teacher', 'admin');
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_users_approval_status" AS ENUM ('pending', 'approved', 'rejected');
    `);

    // ✅ Step 5: Re-apply ENUMs to columns
    await queryInterface.sequelize.query(`
      ALTER TABLE "users"
      ALTER COLUMN "role" TYPE "enum_users_role"
      USING LOWER(role)::text::"enum_users_role";
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "users"
      ALTER COLUMN "approval_status" TYPE "enum_users_approval_status"
      USING LOWER(approval_status)::text::"enum_users_approval_status";
    `);

    // ✅ Step 6: Add CHECK constraints for extra safety
    await queryInterface.sequelize.query(`
      ALTER TABLE "users"
      ADD CONSTRAINT role_lowercase_check
      CHECK (role IN ('student','teacher','admin'));
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "users"
      ADD CONSTRAINT approval_status_lowercase_check
      CHECK (approval_status IN ('pending','approved','rejected'));
    `);
  },

  async down(queryInterface, Sequelize) {
    // Rollback: remove constraints and ENUMs
    await queryInterface.sequelize.query(`
      ALTER TABLE "users" DROP CONSTRAINT IF EXISTS role_lowercase_check;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "users" DROP CONSTRAINT IF EXISTS approval_status_lowercase_check;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
      ALTER TABLE "users" ALTER COLUMN "role" TYPE TEXT;
      DROP TYPE IF EXISTS "enum_users_role";
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "users" ALTER COLUMN "approval_status" DROP DEFAULT;
      ALTER TABLE "users" ALTER COLUMN "approval_status" TYPE TEXT;
      DROP TYPE IF EXISTS "enum_users_approval_status";
    `);
  },
};
