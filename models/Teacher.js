
// models/Teacher.js
export default (sequelize, DataTypes) => {
  const Teacher = sequelize.define(
    "Teacher",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    },
    {
      tableName: "teachers",
      underscored: true,
      timestamps: true,
    }
  );

  Teacher.associate = (models) => {
    Teacher.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return Teacher;
};
