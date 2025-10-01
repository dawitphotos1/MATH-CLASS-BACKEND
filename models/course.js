
export default (sequelize, DataTypes) => {
  const Course = sequelize.define(
    "Course",
    {
      title: { type: DataTypes.STRING, allowNull: false },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      description: { type: DataTypes.TEXT },
      teacher_id: { type: DataTypes.INTEGER, allowNull: true },
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    },
    {
      tableName: "courses",
      underscored: true,
    }
  );

  Course.associate = (models) => {
    Course.hasMany(models.Lesson, {
      foreignKey: "course_id",
      onDelete: "CASCADE",
      hooks: true,
    });

    Course.belongsTo(models.User, {
      foreignKey: "teacher_id",
      as: "teacher",
      onDelete: "SET NULL",
    });
  };

  return Course;
};
