
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
      tableName: "Users",
      freezeTableName: true,
      timestamps: true,
    }
  );

  User.associate = (models) => {
    // Enrollments (for students)
    User.hasMany(models.Enrollment, {
      as: "studentEnrollments", // ✅ renamed to avoid conflict
      foreignKey: "studentId",
    });

    // UserCourseAccess (generic)
    User.hasMany(models.UserCourseAccess, {
      as: "courseAccess",
      foreignKey: "userId",
    });

    // Courses they teach (for teachers)
    User.hasMany(models.Course, {
      as: "teachingCourses",
      foreignKey: "teacherId",
    });
  };

  return User;
};

export default UserModel;
