
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Users table
    await queryInterface.createTable("users", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING(100), unique: true, allowNull: false },
      password: { type: Sequelize.STRING, allowNull: false },
      role: {
        type: Sequelize.ENUM("student", "teacher", "admin"),
        allowNull: false,
      },
      subject: { type: Sequelize.STRING },
      approval_status: {
        type: Sequelize.ENUM("pending", "approved", "rejected"),
        defaultValue: "approved",
      },
      last_login: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
    });

    // Courses table
    await queryInterface.createTable("courses", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, unique: true, allowNull: false },
      description: { type: Sequelize.TEXT },
      teacher_id: {
        type: Sequelize.INTEGER,
        references: { model: "users", key: "id" },
        onDelete: "SET NULL",
      },
      price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
    });

    // Lessons table
    await queryInterface.createTable("lessons", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      course_id: {
        type: Sequelize.INTEGER,
        references: { model: "courses", key: "id" },
        onDelete: "CASCADE",
      },
      title: { type: Sequelize.STRING, allowNull: false },
      content: { type: Sequelize.TEXT },
      video_url: { type: Sequelize.STRING },
      order_index: { type: Sequelize.INTEGER, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
    });

    // User course access table — fixed plural name
    await queryInterface.createTable("user_course_accesses", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      course_id: {
        type: Sequelize.INTEGER,
        references: { model: "courses", key: "id" },
        onDelete: "CASCADE",
      },
      access_granted_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
    });

    await queryInterface.addConstraint("user_course_accesses", {
      fields: ["user_id", "course_id"],
      type: "unique",
      name: "user_course_unique_constraint",
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order of their dependencies
    await queryInterface.dropTable("user_course_accesses");
    await queryInterface.dropTable("lessons");

    // 🧠 Drop lesson_completions BEFORE users
    await queryInterface.dropTable("lesson_completions");

    await queryInterface.dropTable("courses");
    await queryInterface.dropTable("users");

    // Drop enums
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_users_role";`
    );
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_users_approval_status";`
    );
  },
};
