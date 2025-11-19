// models/Unit.js
export default (sequelize, DataTypes) => {
  const Unit = sequelize.define(
    "Unit",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      course_id: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT },
      order_index: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: "units",
      timestamps: true,
      underscored: true,
    }
  );

  Unit.associate = (models) => {
    Unit.belongsTo(models.Course, { foreignKey: "course_id", as: "course" });
    Unit.hasMany(models.Lesson, {
      foreignKey: "unit_id",
      as: "lessons",
      onDelete: "CASCADE",
    });
  };

  return Unit;
};
