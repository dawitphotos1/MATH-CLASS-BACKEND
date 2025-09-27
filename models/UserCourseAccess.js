

// models/UserCourseAccess.js
export default (sequelize, DataTypes) => {
  const UserCourseAccess = sequelize.define(
    "UserCourseAccess",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      course_id: { type: DataTypes.INTEGER, allowNull: false },
      payment_status: {
        type: DataTypes.ENUM("pending", "paid", "failed"),
        defaultValue: "pending",
      },
      approval_status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
    },
    {
      tableName: "user_course_access",
      underscored: true,
      timestamps: true,
    }
  );

  UserCourseAccess.associate = (models) => {
    UserCourseAccess.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "student",
    });
    UserCourseAccess.belongsTo(models.Course, {
      foreignKey: "course_id",
      as: "course",
    });
  };

  return UserCourseAccess;
};
