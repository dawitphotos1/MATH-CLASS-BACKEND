
// models/User.js
export default (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      role: {
        type: DataTypes.ENUM("admin", "teacher", "student"),
        allowNull: false,
        defaultValue: "student",
      },
      subject: { type: DataTypes.STRING },
      approval_status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
    },
    {
      tableName: "users",
      underscored: true,
      timestamps: true,
    }
  );

  User.associate = (models) => {
    // One teacher profile per user
    User.hasOne(models.Teacher, { foreignKey: "user_id", as: "teacherProfile" });

    // A user can create many courses
    User.hasMany(models.Course, { foreignKey: "teacher_id", as: "courses" });

    // A user can complete many lessons
    User.hasMany(models.LessonCompletion, {
      foreignKey: "user_id",
      as: "lessonCompletions",
      onDelete: "CASCADE",
      hooks: true,
    });
  };

  return User;
};
