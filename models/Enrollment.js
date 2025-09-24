
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
    // Student association
    models.User.hasMany(Enrollment, {
      foreignKey: "studentId",
      as: "enrollments",
    });
    Enrollment.belongsTo(models.User, {
      foreignKey: "studentId",
      as: "student", // ✅ alias matches controller include
    });

    // Course association
    models.Course.hasMany(Enrollment, {
      foreignKey: "courseId",
      as: "enrollments",
    });
    Enrollment.belongsTo(models.Course, {
      foreignKey: "courseId",
      as: "course", // ✅ alias matches controller include
    });
  };

  return Enrollment;
};

export default EnrollmentModel;
