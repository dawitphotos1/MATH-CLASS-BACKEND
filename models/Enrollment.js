
// // models/Enrollment.js
// const EnrollmentModel = (sequelize, DataTypes) => {
//   const Enrollment = sequelize.define("Enrollment", {
//     approval_status: {
//       type: DataTypes.ENUM("pending", "approved", "rejected"),
//       defaultValue: "pending",
//     },
//   });

//   Enrollment.associate = (models) => {
//     // Student reference
//     Enrollment.belongsTo(models.User, {
//       foreignKey: "studentId",
//       as: "student",
//     });

//     // Course reference
//     Enrollment.belongsTo(models.Course, {
//       foreignKey: "courseId",
//       as: "course",
//     });
//   };

//   return Enrollment;
// };

// export default EnrollmentModel;




// models/Enrollment.js
const EnrollmentModel = (sequelize, DataTypes) => {
  const Enrollment = sequelize.define(
    "Enrollment",
    {
      approval_status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
    },
    {
      tableName: "Enrollments",
      freezeTableName: true,
      timestamps: true,
    }
  );

  Enrollment.associate = (models) => {
    // BelongsTo User (student)
    Enrollment.belongsTo(models.User, {
      foreignKey: "studentId",
      as: "student",
    });

    // BelongsTo Course
    Enrollment.belongsTo(models.Course, {
      foreignKey: "courseId",
      as: "course",
    });
  };

  return Enrollment;
};

export default EnrollmentModel;
