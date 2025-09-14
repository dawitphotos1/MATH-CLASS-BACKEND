
// "use strict";

// module.exports = {
//   async up(queryInterface) {
//     // Normalize role (enum or text) → lowercase
//     await queryInterface.sequelize.query(`
//       UPDATE "users"
//       SET role = LOWER(role::text)::enum_users_role
//       WHERE role IS NOT NULL;
//     `);

//     // Normalize approval_status (enum) → lowercase
//     await queryInterface.sequelize.query(`
//       UPDATE "users"
//       SET approval_status = LOWER(approval_status::text)::enum_users_approval_status
//       WHERE approval_status IS NOT NULL;
//     `);
//   },

//   async down() {
//     // no rollback needed
//   },
// };



"use strict";

module.exports = {
  async up(queryInterface) {
    // 1. Drop defaults first
    await queryInterface.sequelize.query(`
      ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
      ALTER TABLE "users" ALTER COLUMN "approval_status" DROP DEFAULT;
    `);

    // 2. Rename old enum types
    await queryInterface.sequelize.query(`
      ALTER TYPE enum_users_role RENAME TO enum_users_role_old;
      ALTER TYPE enum_users_approval_status RENAME TO enum_users_approval_status_old;
    `);

    // 3. Create new enum types (only lowercase values allowed)
    await queryInterface.sequelize.query(`
      CREATE TYPE enum_users_role AS ENUM ('admin', 'teacher', 'student');
      CREATE TYPE enum_users_approval_status AS ENUM ('pending', 'approved', 'rejected');
    `);

    // 4. Alter the table columns to use new enums
    await queryInterface.sequelize.query(`
      ALTER TABLE "users"
      ALTER COLUMN "role" TYPE enum_users_role
      USING LOWER(role::text)::enum_users_role;

      ALTER TABLE "users"
      ALTER COLUMN "approval_status" TYPE enum_users_approval_status
      USING LOWER(approval_status::text)::enum_users_approval_status;
    `);

    // 5. Restore defaults
    await queryInterface.sequelize.query(`
      ALTER TABLE "users" ALTER COLUMN "approval_status" SET DEFAULT 'pending';
    `);

    // 6. Drop old enums
    await queryInterface.sequelize.query(`
      DROP TYPE enum_users_role_old;
      DROP TYPE enum_users_approval_status_old;
    `);
  },

  async down() {
    console.log("Down migration skipped: enums recreated.");
  },
};
