
// import { DataTypes } from "sequelize";

// export default (sequelize) => {
//   const Enrollment = sequelize.define("Enrollment", {
//     status: {
//       type: DataTypes.ENUM("pending", "approved", "rejected"),
//       defaultValue: "pending",
//     },
//   });

//   Enrollment.associate = (models) => {
//     Enrollment.belongsTo(models.User, { foreignKey: "studentId" });
//     Enrollment.belongsTo(models.Course, { foreignKey: "courseId" });
//   };

//   return Enrollment;
// };


// models/Enrollment.js
const EnrollmentModel = (sequelize, DataTypes) => {
  const Enrollment = sequelize.define("Enrollment", {
    approval_status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
  });

  Enrollment.associate = (models) => {
    models.User.hasMany(Enrollment, { foreignKey: "studentId" });
    Enrollment.belongsTo(models.User, { foreignKey: "studentId" });

    models.Course.hasMany(Enrollment, { foreignKey: "courseId" });
    Enrollment.belongsTo(models.Course, { foreignKey: "courseId" });
  };

  return Enrollment;
};

export default EnrollmentModel;
