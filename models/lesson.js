
module.exports = (sequelize, DataTypes) => {
  const Lesson = sequelize.define(
    "Lesson",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contentType: {
        type: DataTypes.STRING,
        defaultValue: "text",
      },
      contentUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isPreview: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isUnitHeader: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      orderIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      unitId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Lessons",
          key: "id",
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: "Lessons",
      indexes: [{ fields: ["isUnitHeader"] }, { fields: ["unitId"] }],
    }
  );

  Lesson.associate = (models) => {
    if (!models.Course) {
      console.error("Course model is undefined in Lessons.associate");
      return;
    }

    Lesson.belongsTo(models.Course, {
      foreignKey: "courseId",
      as: "course",
    });

    Lesson.belongsTo(models.Lesson, {
      foreignKey: "unitId",
      as: "unit",
    });
  };

  return Lesson;
};
