

import { DataTypes } from "sequelize";

export default (sequelize) => {
  const UserCourseAccess = sequelize.define("UserCourseAccess", {
    approval_status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
  });

  UserCourseAccess.associate = (models) => {
    UserCourseAccess.belongsTo(models.User, { foreignKey: "userId" });
    UserCourseAccess.belongsTo(models.Course, { foreignKey: "courseId" });
  };

  return UserCourseAccess;
};
