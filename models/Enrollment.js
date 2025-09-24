
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
    // User (student) side
    // User hasMany Enrollment (user.enrollments)
    models.User.hasMany(Enrollment, {
      foreignKey: "studentId",
      as: "enrollments", // user's enrollments
    });
    // Enrollment belongsTo User as 'student' (enrollment.student)
    Enrollment.belongsTo(models.User, {
      foreignKey: "studentId",
      as: "student",
    });

    // Course side
    // Course hasMany Enrollment (course.courseEnrollments) - unique alias
    models.Course.hasMany(Enrollment, {
      foreignKey: "courseId",
      as: "courseEnrollments",
    });
    // Enrollment belongsTo Course as 'course' (enrollment.course)
    Enrollment.belongsTo(models.Course, {
      foreignKey: "courseId",
      as: "course",
    });
  };

  return Enrollment;
};

export default EnrollmentModel;
