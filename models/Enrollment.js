

// models/Enrollment.js
export default (sequelize, DataTypes) => {
  const Enrollment = sequelize.define(
    "Enrollment",
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
      tableName: "enrollments",
      underscored: true,
      timestamps: true,
    }
  );

  Enrollment.associate = (models) => {
    Enrollment.belongsTo(models.User, { foreignKey: "user_id", as: "student" });
    Enrollment.belongsTo(models.Course, {
      foreignKey: "course_id",
      as: "course",
    });
  };

  return Enrollment;
};
