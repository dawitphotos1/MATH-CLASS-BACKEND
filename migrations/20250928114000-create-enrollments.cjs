"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create enum types first
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_enrollments_payment_status') THEN
          CREATE TYPE enum_enrollments_payment_status AS ENUM ('pending', 'completed', 'failed');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_enrollments_approval_status') THEN
          CREATE TYPE enum_enrollments_approval_status AS ENUM ('pending', 'approved', 'rejected');
        END IF;
      END$$;
    `);

    // Create enrollments table
    await queryInterface.createTable("enrollments", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "courses",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      payment_status: {
        type: "enum_enrollments_payment_status",
        defaultValue: "pending",
      },
      approval_status: {
        type: "enum_enrollments_approval_status",
        defaultValue: "pending",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("enrollments");

    // Drop enum types
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS enum_enrollments_payment_status;`
    );
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS enum_enrollments_approval_status;`
    );
  },
};
