
"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
          isIn: [["student", "teacher", "admin"]],
        },
      },
      subject: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      approval_status: {
        type: DataTypes.STRING(10),
        defaultValue: "pending",
        validate: {
          isIn: [["pending", "approved", "rejected"]],
        },
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "users",
      timestamps: false,
      hooks: {
        beforeCreate: (user) => {
          // Auto-approve admins and teachers
          if (user.role === "admin" || user.role === "teacher") {
            user.approval_status = "approved";
          }
        },
      },
    }
  );

  return User;
};