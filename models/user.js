
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




const bcrypt = require("bcryptjs");

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
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("student", "teacher", "admin"),
        allowNull: false,
      },
      subject: {
        type: DataTypes.STRING,
      },
      approvalStatus: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        field: "approval_status",
        defaultValue: "approved",
      },
      lastLogin: {
        type: DataTypes.DATE,
        field: "last_login",
      },
    },
    {
      tableName: "users",
      timestamps: true,
      underscored: true,
    }
  );

  // Hash password before save
  User.beforeCreate(async (user) => {
    if (user.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  User.associate = (models) => {
    User.hasMany(models.Course, {
      foreignKey: { name: "teacherId", field: "teacher_id" },
      as: "courses",
    });

    User.hasMany(models.UserCourseAccess, {
      foreignKey: { name: "userId", field: "user_id" },
    });

    User.hasMany(models.Lesson, {
      foreignKey: { name: "userId", field: "user_id" },
    });
  };

  return User;
};
