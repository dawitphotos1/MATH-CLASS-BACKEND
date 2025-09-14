// models/Enrollment.js
"use strict";

module.exports = (sequelize, DataTypes) => {
  const Enrollment = sequelize.define(
    "Enrollment",
    {
      studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      approved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "enrollments",
      timestamps: true,
    }
  );

  Enrollment.associate = (models) => {
    Enrollment.belongsTo(models.User, {
      foreignKey: "studentId",
      as: "student",
    });

    Enrollment.belongsTo(models.Course, {
      foreignKey: "courseId",
      as: "course",
    });
  };

  return Enrollment;
};
