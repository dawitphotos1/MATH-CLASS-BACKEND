

// import { DataTypes } from "sequelize";

// export default (sequelize) => {
//   const UserCourseAccess = sequelize.define("UserCourseAccess", {
//     approval_status: {
//       type: DataTypes.ENUM("pending", "approved", "rejected"),
//       defaultValue: "pending",
//     },
//   });

//   UserCourseAccess.associate = (models) => {
//     UserCourseAccess.belongsTo(models.User, { foreignKey: "userId" });
//     UserCourseAccess.belongsTo(models.Course, { foreignKey: "courseId" });
//   };

//   return UserCourseAccess;
// };




// models/UserCourseAccess.js
const UserCourseAccessModel = (sequelize, DataTypes) => {
  const UserCourseAccess = sequelize.define("UserCourseAccess", {
    approval_status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
  });

  UserCourseAccess.associate = (models) => {
    models.User.hasMany(UserCourseAccess, { foreignKey: "userId" });
    UserCourseAccess.belongsTo(models.User, { foreignKey: "userId" });

    models.Course.hasMany(UserCourseAccess, { foreignKey: "courseId" });
    UserCourseAccess.belongsTo(models.Course, { foreignKey: "courseId" });
  };

  return UserCourseAccess;
};

export default UserCourseAccessModel;
