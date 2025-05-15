
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
        primaryKey: true,
        references: { model: "Users", key: "id" },
      },
      courseId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: "Courses", key: "id" },
      },
      accessGrantedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      approved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamps: false,
    }
  );

  UserCourseAccess.associate = (models) => {
    UserCourseAccess.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });

    UserCourseAccess.belongsTo(models.Course, {
      foreignKey: "courseId",
      as: "course",
    });
  };

  return UserCourseAccess;
};
