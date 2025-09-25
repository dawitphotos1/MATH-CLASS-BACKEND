
// // models/UserCourseAccess.js
// const UserCourseAccessModel = (sequelize, DataTypes) => {
//   const UserCourseAccess = sequelize.define("UserCourseAccess", {
//     approval_status: {
//       type: DataTypes.ENUM("pending", "approved", "rejected"),
//       defaultValue: "pending",
//     },
//   });

//   UserCourseAccess.associate = (models) => {
//     models.User.hasMany(UserCourseAccess, { foreignKey: "userId" });
//     UserCourseAccess.belongsTo(models.User, { foreignKey: "userId" });

//     models.Course.hasMany(UserCourseAccess, { foreignKey: "courseId" });
//     UserCourseAccess.belongsTo(models.Course, { foreignKey: "courseId" });
//   };

//   return UserCourseAccess;
// };

// export default UserCourseAccessModel;





// models/UserCourseAccess.js
"use strict";

module.exports = (sequelize, DataTypes) => {
  const UserCourseAccess = sequelize.define(
    "UserCourseAccess",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      payment_status: {
        type: DataTypes.ENUM("pending", "completed", "failed"),
        defaultValue: "pending",
      },
      approval_status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      approved_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "user_course_access",
      underscored: true, // ensures snake_case columns
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  UserCourseAccess.associate = (models) => {
    // belongs to User (student)
    UserCourseAccess.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "student",
    });

    // belongs to Course
    UserCourseAccess.belongsTo(models.Course, {
      foreignKey: "course_id",
      as: "course",
    });

    // approved_by references User (admin/teacher)
    UserCourseAccess.belongsTo(models.User, {
      foreignKey: "approved_by",
      as: "approver",
    });
  };

  return UserCourseAccess;
};
