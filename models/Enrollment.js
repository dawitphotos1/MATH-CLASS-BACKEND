
// models/Enrollment.js
const EnrollmentModel = (sequelize, DataTypes) => {
  const Enrollment = sequelize.define("Enrollment", {
    approval_status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
  });

  Enrollment.associate = (models) => {
    // Student reference
    Enrollment.belongsTo(models.User, {
      foreignKey: "studentId",
      as: "student",
    });

    // Course reference
    Enrollment.belongsTo(models.Course, {
      foreignKey: "courseId",
      as: "course",
    });
  };

  return Enrollment;
};

export default EnrollmentModel;
