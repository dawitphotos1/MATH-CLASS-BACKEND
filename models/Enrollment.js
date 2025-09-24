
// // models/Enrollment.js
// const EnrollmentModel = (sequelize, DataTypes) => {
//   const Enrollment = sequelize.define(
//     "Enrollment",
//     {
//       approval_status: {
//         type: DataTypes.ENUM("pending", "approved", "rejected"),
//         defaultValue: "pending",
//       },
//     },
//     {
//       tableName: "Enrollments",
//       freezeTableName: true,
//       timestamps: true,
//     }
//   );

//   Enrollment.associate = (models) => {
//     // BelongsTo User (student)
//     Enrollment.belongsTo(models.User, {
//       foreignKey: "studentId",
//       as: "student",
//     });

//     // BelongsTo Course
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
  const Enrollment = sequelize.define("Enrollment", {
    approval_status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
  });

  Enrollment.associate = (models) => {
    // Student ↔ Enrollment
    Enrollment.belongsTo(models.User, {
      foreignKey: "studentId",
      as: "student", // ✅ avoid duplicate alias
    });
    models.User.hasMany(Enrollment, {
      foreignKey: "studentId",
      as: "studentEnrollments", // ✅ different alias than Course.enrollments
    });

    // Course ↔ Enrollment
    Enrollment.belongsTo(models.Course, {
      foreignKey: "courseId",
      as: "course",
    });
    models.Course.hasMany(Enrollment, {
      foreignKey: "courseId",
      as: "courseEnrollments",
    });
  };

  return Enrollment;
};

export default EnrollmentModel;
