
// // models/Enrollment.js
// const EnrollmentModel = (sequelize, DataTypes) => {
//   const Enrollment = sequelize.define("Enrollment", {
//     approval_status: {
//       type: DataTypes.ENUM("pending", "approved", "rejected"),
//       defaultValue: "pending",
//     },
//   });

//   Enrollment.associate = (models) => {
//     models.User.hasMany(Enrollment, { foreignKey: "studentId" });
//     Enrollment.belongsTo(models.User, { foreignKey: "studentId" });

//     models.Course.hasMany(Enrollment, { foreignKey: "courseId" });
//     Enrollment.belongsTo(models.Course, { foreignKey: "courseId" });
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
    // User ↔ Enrollment
    models.User.hasMany(Enrollment, {
      foreignKey: "studentId",
      as: "studentEnrollments", // ✅ unique
    });
    Enrollment.belongsTo(models.User, {
      foreignKey: "studentId",
      as: "student",
    });

    // Course ↔ Enrollment
    models.Course.hasMany(Enrollment, {
      foreignKey: "courseId",
      as: "courseEnrollments", // ✅ unique
    });
    Enrollment.belongsTo(models.Course, {
      foreignKey: "courseId",
      as: "course",
    });
  };

  return Enrollment;
};

export default EnrollmentModel;
