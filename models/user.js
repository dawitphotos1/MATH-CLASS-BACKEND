
// models/User.js
const UserModel = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("student", "teacher", "admin"),
        allowNull: false,
        defaultValue: "student",
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      approval_status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
    },
    {
      tableName: "Users", // ✅ match migration
      freezeTableName: true,
      timestamps: true,
    }
  );

  User.associate = (models) => {
    User.hasMany(models.Enrollment, {
      foreignKey: "studentId",
      as: "enrollments", // ✅ unique alias
    });
    User.hasMany(models.UserCourseAccess, {
      foreignKey: "userId",
      as: "courseAccess",
    });
  };

  return User;
};

export default UserModel;
