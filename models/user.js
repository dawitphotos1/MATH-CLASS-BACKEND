
// const { DataTypes } = require("sequelize");
// const bcrypt = require("bcryptjs");

// module.exports = (sequelize) => {
//   const User = sequelize.define("User", {
//     name: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     email: {
//       type: DataTypes.STRING(100),
//       allowNull: false,
//       unique: true,
//       validate: {
//         isEmail: true,
//       },
//     },
//     password: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     role: {
//       type: DataTypes.ENUM("student", "teacher", "admin"),
//       allowNull: false,
//     },
//     subject: {
//       type: DataTypes.STRING,
//     },
//     approvalStatus: {
//       type: DataTypes.ENUM("pending", "approved", "rejected"),
//       defaultValue: "approved",
//     },
//     lastLogin: {
//       type: DataTypes.DATE,
//     },
//   });

//   User.beforeCreate(async (user, options) => {
//     if (user.password) {
//       const salt = await bcrypt.genSalt(10);
//       user.password = await bcrypt.hash(user.password, salt);
//     }
//   });

//   User.associate = (models) => {
//     User.hasMany(models.Course, { foreignKey: "teacherId", as: "courses" });
//     User.hasMany(models.UserCourseAccess, { foreignKey: "userId" });
//     User.hasMany(models.Lesson, { foreignKey: "userId" });
//   };

//   return User;
// };



module.exports = (sequelize, DataTypes) => {
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
        type: DataTypes.ENUM("student", "teacher", "admin"),
        allowNull: false,
      },
      subject: {
        type: DataTypes.STRING(255),
      },
      approval_status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "approved",
      },
      lastLogin: {
        type: DataTypes.DATE,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "Users",
    }
  );

  User.associate = (models) => {
    User.belongsToMany(models.Course, {
      through: models.UserCourseAccess,
      foreignKey: "userId",
      as: "enrolledCourses",
    });
  };

  return User;
};
