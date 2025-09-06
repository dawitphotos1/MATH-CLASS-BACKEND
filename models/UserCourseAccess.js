
// // const { DataTypes } = require("sequelize");

// // module.exports = (sequelize) => {
// //   const UserCourseAccess = sequelize.define(
// //     "UserCourseAccess",
// //     {
// //       userId: {
// //         type: DataTypes.INTEGER,
// //         primaryKey: true,
// //         references: {
// //           model: "Users",
// //           key: "id",
// //         },
// //       },
// //       courseId: {
// //         type: DataTypes.INTEGER,
// //         primaryKey: true,
// //         references: {
// //           model: "Courses",
// //           key: "id",
// //         },
// //       },
// //       accessGrantedAt: {
// //         type: DataTypes.DATE,
// //         allowNull: false,
// //       },
// //     },
// //     {
// //       timestamps: false,
// //     }
// //   );

// //   return UserCourseAccess;
// // };


// const { DataTypes } = require("sequelize");

// module.exports = (sequelize) => {
//   const UserCourseAccess = sequelize.define(
//     "UserCourseAccess",
//     {
//       userId: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         references: {
//           model: "Users",
//           key: "id",
//         },
//       },
//       courseId: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         references: {
//           model: "Courses",
//           key: "id",
//         },
//       },
//       accessGrantedAt: {
//         type: DataTypes.DATE,
//         allowNull: true,
//       },
//       status: {
//         type: DataTypes.STRING,
//         allowNull: false,
//         defaultValue: "pending", // added status: 'pending', 'approved', 'rejected'
//       },
//     },
//     {
//       timestamps: false,
//     }
//   );

//   return UserCourseAccess;
// };


const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const UserCourseAccess = sequelize.define(
    "UserCourseAccess",
    {
      userId: {
        type: DataTypes.INTEGER,
        field: "user_id",
        primaryKey: true,
      },
      courseId: {
        type: DataTypes.INTEGER,
        field: "course_id",
        primaryKey: true,
      },
      accessGrantedAt: {
        type: DataTypes.DATE,
        field: "access_granted_at",
      },
      approved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      approvalStatus: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        field: "approval_status",
        defaultValue: "pending",
      },
      paymentStatus: {
        type: DataTypes.ENUM("pending", "paid", "failed"),
        field: "payment_status",
        defaultValue: "pending",
      },
    },
    {
      tableName: "usercourseaccess",
      timestamps: true,
      underscored: true,
    }
  );

  UserCourseAccess.associate = (models) => {
    UserCourseAccess.belongsTo(models.User, {
      foreignKey: { name: "userId", field: "user_id" },
      as: "user",
    });

    UserCourseAccess.belongsTo(models.Course, {
      foreignKey: { name: "courseId", field: "course_id" },
      as: "course",
    });
  };

  return UserCourseAccess;
};
