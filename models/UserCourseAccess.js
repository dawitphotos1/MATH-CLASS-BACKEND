
// module.exports = (sequelize, DataTypes) => {
//   const UserCourseAccess = sequelize.define(
//     "UserCourseAccess",
//     {
//       id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//       },
//       userId: {
//         type: DataTypes.INTEGER,
//         references: {
//           model: "Users",
//           key: "id",
//         },
//         onDelete: "CASCADE",
//       },
//       courseId: {
//         type: DataTypes.INTEGER,
//         references: {
//           model: "Courses",
//           key: "id",
//         },
//         onDelete: "CASCADE",
//       },
//       accessGrantedAt: {
//         type: DataTypes.DATE,
//         allowNull: false,
//         defaultValue: DataTypes.NOW,
//       },
//       createdAt: {
//         type: DataTypes.DATE,
//         allowNull: false,
//         defaultValue: DataTypes.NOW,
//       },
//       updatedAt: {
//         type: DataTypes.DATE,
//         allowNull: false,
//         defaultValue: DataTypes.NOW,
//       },
//     },
//     {
//       tableName: "user_course_access",
//       indexes: [
//         {
//           unique: true,
//           fields: ["userId", "courseId"],
//         },
//       ],
//     }
//   );

//   return UserCourseAccess;
// };





module.exports = (sequelize, DataTypes) => {
  const UserCourseAccess = sequelize.define(
    "UserCourseAccess",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      approval_status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      payment_status: {
        type: DataTypes.ENUM("pending", "paid", "failed"),
        defaultValue: "pending",
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "user_course_access",
    }
  );

  UserCourseAccess.associate = (models) => {
    UserCourseAccess.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "student",
    });
    UserCourseAccess.belongsTo(models.Course, {
      foreignKey: "course_id",
      as: "course",
    });
  };

  return UserCourseAccess;
};
