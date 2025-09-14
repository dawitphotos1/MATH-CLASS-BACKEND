// // models/User.js
// module.exports = (sequelize, DataTypes) => {
//   const User = sequelize.define(
//     "User",
//     {
//       id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//       },
//       name: {
//         type: DataTypes.STRING(255),
//         allowNull: false,
//       },
//       email: {
//         type: DataTypes.STRING(100),
//         allowNull: false,
//         unique: true,
//       },
//       password: {
//         type: DataTypes.STRING(255),
//         allowNull: false,
//       },
//       role: {
//         type: DataTypes.ENUM("student", "teacher", "admin"),
//         allowNull: false,
//       },
//       subject: {
//         type: DataTypes.STRING(255),
//         allowNull: true,
//       },
//       approval_status: {
//         type: DataTypes.ENUM("pending", "approved", "rejected"),
//         allowNull: false,
//         defaultValue: "pending", // ✅ safest default (students pending by default)
//       },
//       lastLogin: {
//         type: DataTypes.DATE,
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
//       tableName: "users",
//     }
//   );

//   // ✅ Associations
//   User.associate = (models) => {
//     User.belongsToMany(models.Course, {
//       through: models.UserCourseAccess,
//       foreignKey: "user_id",
//       as: "enrolledCourses",
//     });
//   };

//   return User;
// };



"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Example associations
      User.hasMany(models.Course, { foreignKey: "teacherId", as: "courses" });
      User.hasMany(models.Enrollment, {
        foreignKey: "studentId",
        as: "enrollments",
      });
    }
  }

  User.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },

      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      role: {
        type: DataTypes.ENUM("admin", "teacher", "student"), // ✅ lowercase only
        allowNull: false,
      },

      subject: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      approval_status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"), // ✅ lowercase only
        allowNull: false,
        defaultValue: "pending",
      },

      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      underscored: true,
      hooks: {
        beforeValidate: (user) => {
          if (user.role) {
            user.role = user.role.toLowerCase();
          }
          if (user.approval_status) {
            user.approval_status = user.approval_status.toLowerCase();
          }
        },
      },
    }
  );

  return User;
};
