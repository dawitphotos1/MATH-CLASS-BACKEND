
// "use strict";
// const { Model } = require("sequelize");

// module.exports = (sequelize, DataTypes) => {
//   class User extends Model {
//     static associate(models) {
//       User.hasMany(models.Course, { foreignKey: "teacherId", as: "courses" });
//       User.hasMany(models.Enrollment, {
//         foreignKey: "studentId",
//         as: "enrollments",
//       });
//     }
//   }

//   User.init(
//     {
//       id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//       },
//       name: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       email: {
//         type: DataTypes.STRING,
//         allowNull: false,
//         unique: true,
//         validate: {
//           isEmail: true,
//         },
//       },
//       password: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       role: {
//         type: DataTypes.ENUM("admin", "teacher", "student"),
//         allowNull: false,
//       },
//       subject: {
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//       approvalStatus: {
//         type: DataTypes.ENUM("pending", "approved", "rejected"),
//         allowNull: false,
//         defaultValue: "pending",
//       },
//       lastLogin: {
//         type: DataTypes.DATE,
//         allowNull: true,
//       },
//       createdAt: {
//         type: DataTypes.DATE,
//         allowNull: false,
//       },
//       updatedAt: {
//         type: DataTypes.DATE,
//         allowNull: false,
//       },
//     },
//     {
//       sequelize,
//       modelName: "User",
//       tableName: "users",
//       underscored: true,
//       hooks: {
//         beforeValidate: (user) => {
//           if (user.role) {
//             user.role = user.role.toLowerCase();
//           }
//           if (user.approvalStatus) {
//             user.approvalStatus = user.approvalStatus.toLowerCase();
//           }
//         },
//       },
//     }
//   );

//   return User;
// };



"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
          isIn: [["student", "teacher", "admin"]],
        },
      },
      subject: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      approval_status: {
        type: DataTypes.STRING(10),
        defaultValue: "approved",
        validate: {
          isIn: [["pending", "approved", "rejected"]],
        },
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "users",
      timestamps: false,
    }
  );

  return User;
};