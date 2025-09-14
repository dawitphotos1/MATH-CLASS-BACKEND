
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add a temporary column as TEXT
    await queryInterface.addColumn("users", "approval_status_tmp", {
      type: Sequelize.TEXT,
    });

    // 2. Copy existing values in lowercase
    await queryInterface.sequelize.query(`
      UPDATE "users"
      SET approval_status_tmp = LOWER(approval_status::text);
    `);

    // 3. Drop constraints/defaults, then remove the old column
    await queryInterface.sequelize.query(`
      ALTER TABLE "users" ALTER COLUMN "approval_status" DROP DEFAULT;
    `);
    await queryInterface.removeColumn("users", "approval_status");

    // 4. Drop the old enum type if it exists
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_users_approval_status') THEN
          DROP TYPE enum_users_approval_status;
        END IF;
      END$$;
    `);

    // 5. Create a new enum type
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_users_approval_status" AS ENUM ('pending', 'approved', 'rejected');
    `);

    // 6. Add the new enum column with default "pending"
    await queryInterface.addColumn("users", "approval_status", {
      type: "enum_users_approval_status",
      allowNull: false,
      defaultValue: "pending",
    });

    // 7. Copy values back
    await queryInterface.sequelize.query(`
      UPDATE "users"
      SET approval_status = approval_status_tmp::enum_users_approval_status;
    `);

    // 8. Drop the temp column
    await queryInterface.removeColumn("users", "approval_status_tmp");
  },

  async down(queryInterface, Sequelize) {
    // Optional rollback: you could reverse to TEXT if needed
    await queryInterface.changeColumn("users", "approval_status", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },
};
