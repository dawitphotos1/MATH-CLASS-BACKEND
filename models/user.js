
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
//         defaultValue: "approved", // ✅ default for teacher/admin
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



// models/User.js
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
        allowNull: true,
      },
      approval_status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending", // ✅ safest default (students pending by default)
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
      tableName: "users",
    }
  );

  // ✅ Associations
  User.associate = (models) => {
    User.belongsToMany(models.Course, {
      through: models.UserCourseAccess,
      foreignKey: "user_id",
      as: "enrolledCourses",
    });
  };

  return User;
};
