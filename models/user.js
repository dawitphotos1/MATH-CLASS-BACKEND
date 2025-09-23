
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
      tableName: "Users",   // ✅ ensure exact match with migration
      freezeTableName: true, // ✅ prevent pluralization issues
      timestamps: true,      // ✅ Sequelize manages createdAt/updatedAt
    }
  );

  User.associate = (models) => {
    User.hasMany(models.Enrollment, { foreignKey: "studentId" });
    User.hasMany(models.UserCourseAccess, { foreignKey: "userId" });
    // Add more associations if needed
  };

  return User;
};

export default UserModel;
