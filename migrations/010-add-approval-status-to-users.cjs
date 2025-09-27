
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Use raw SQL for complete control
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        -- Only create type if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_Users_approvalStatus') THEN
          CREATE TYPE "enum_Users_approvalStatus" AS ENUM('pending', 'approved', 'rejected');
        END IF;
        
        -- Only add column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'approval_status'
        ) THEN
          ALTER TABLE "users" ADD COLUMN "approval_status" "enum_Users_approvalStatus" 
          DEFAULT 'approved' NOT NULL;
        END IF;
      END $$;
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE "users" DROP COLUMN IF EXISTS "approval_status";
      DROP TYPE IF EXISTS "enum_Users_approvalStatus";
    `);
  },
};

