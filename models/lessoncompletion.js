
// // models/LessonCompletion.js

// export default (sequelize, DataTypes) => {
//   const LessonCompletion = sequelize.define(
//     "LessonCompletion",
//     {
//       id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
//       user_id: { type: DataTypes.INTEGER, allowNull: false },
//       lesson_id: { type: DataTypes.INTEGER, allowNull: false },
//       completed_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
//     },
//     {
//       tableName: "lesson_completions",
//       underscored: true,
//       timestamps: true,
//     }
//   );

//   LessonCompletion.associate = (models) => {
//     LessonCompletion.belongsTo(models.User, {
//       foreignKey: "user_id",
//       as: "user",
//       onDelete: "CASCADE",
//     });

//     LessonCompletion.belongsTo(models.Lesson, {
//       foreignKey: "lesson_id",
//       as: "lesson",
//       onDelete: "CASCADE",
//     });
//   };

//   return LessonCompletion;
// };



//modeld/lessoncompletion.js
// models/LessonCompletion.js
export default (sequelize, DataTypes) => {
  const LessonCompletion = sequelize.define(
    "LessonCompletion",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      lesson_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "lessons",
          key: "id",
        },
      },
      completed_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "lesson_completions",
      timestamps: false,
      underscored: true,
    }
  );

  LessonCompletion.associate = (models) => {
    LessonCompletion.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
    LessonCompletion.belongsTo(models.Lesson, {
      foreignKey: "lesson_id",
      as: "lesson",
    });
  };

  return LessonCompletion;
};
