// "use strict";

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     // Step 1: Create new enum type with desired roles
//     await queryInterface.sequelize.query(`
//       CREATE TYPE "enum_users_role_new" AS ENUM('admin', 'user', 'guest');
//     `);

//     // Step 2: Alter "role" column in "Users" table to use the new enum type,
//     // casting the old enum values to text and then to the new enum type
//     await queryInterface.sequelize.query(`
//       ALTER TABLE "Users" ALTER COLUMN "role" TYPE "enum_users_role_new" USING "role"::text::enum_users_role_new;
//     `);

//     // Step 3: Drop the old enum type
//     await queryInterface.sequelize.query(`
//       DROP TYPE "enum_users_role";
//     `);

//     // Step 4: Rename the new enum type to the old enum type name
//     await queryInterface.sequelize.query(`
//       ALTER TYPE "enum_users_role_new" RENAME TO "enum_users_role";
//     `);
//   },

//   async down(queryInterface, Sequelize) {
//     // Rollback: reverse the steps if needed

//     // Step 1: Create old enum type (assuming original roles)
//     await queryInterface.sequelize.query(`
//       CREATE TYPE "enum_users_role_old" AS ENUM('admin', 'user');
//     `);

//     // Step 2: Alter "role" column to use old enum type
//     await queryInterface.sequelize.query(`
//       ALTER TABLE "Users" ALTER COLUMN "role" TYPE "enum_users_role_old" USING "role"::text::enum_users_role_old;
//     `);

//     // Step 3: Drop new enum type
//     await queryInterface.sequelize.query(`
//       DROP TYPE "enum_users_role";
//     `);

//     // Step 4: Rename old enum type back
//     await queryInterface.sequelize.query(`
//       ALTER TYPE "enum_users_role_old" RENAME TO "enum_users_role";
//     `);
//   },
// };




"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Step 1: Create new enum type with desired roles
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_users_role_new" AS ENUM('admin', 'user', 'guest');
    `);

    // Step 2: Alter "role" column in "Users" table to use the new enum type,
    // casting the old enum values to text and then to the new enum type
    await queryInterface.sequelize.query(`
      ALTER TABLE "Users" ALTER COLUMN "role" TYPE "enum_users_role_new" USING "role"::text::enum_users_role_new;
    `);

    // Step 3: Drop the old enum type
    await queryInterface.sequelize.query(`
      DROP TYPE "enum_users_role";
    `);

    // Step 4: Rename the new enum type to the old enum type name
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_users_role_new" RENAME TO "enum_users_role";
    `);
  },

  async down(queryInterface, Sequelize) {
    // Rollback: reverse the steps if needed

    // Step 1: Create old enum type (assuming original roles)
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_users_role_old" AS ENUM('admin', 'user');
    `);

    // Step 2: Alter "role" column to use old enum type
    await queryInterface.sequelize.query(`
      ALTER TABLE "Users" ALTER COLUMN "role" TYPE "enum_users_role_old" USING "role"::text::enum_users_role_old;
    `);

    // Step 3: Drop new enum type
    await queryInterface.sequelize.query(`
      DROP TYPE "enum_users_role";
    `);

    // Step 4: Rename old enum type back
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_users_role_old" RENAME TO "enum_users_role";
    `);
  },
};
