// // models/LessonCompletion.js
// export default (sequelize, DataTypes) => {
//   const LessonCompletion = sequelize.define(
//     "LessonCompletion",
//     {
//       id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//         allowNull: false,
//       },
//       user_id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//       },
//       lesson_id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//       },
//       completed_at: {
//         type: DataTypes.DATE,
//         allowNull: false,
//         defaultValue: DataTypes.NOW,
//       },
//     },
//     {
//       tableName: "lesson_completions",
//       underscored: true,
//       timestamps: true, // adds created_at + updated_at
//     }
//   );

//   LessonCompletion.associate = (models) => {
//     // Each completion belongs to one user
//     LessonCompletion.belongsTo(models.User, {
//       foreignKey: "user_id",
//       as: "user",
//       onDelete: "CASCADE",
//     });

//     // Each completion belongs to one lesson
//     LessonCompletion.belongsTo(models.Lesson, {
//       foreignKey: "lesson_id",
//       as: "lesson",
//       onDelete: "CASCADE",
//     });
//   };

//   return LessonCompletion;
// };




// models/LessonCompletion.js
export default (sequelize, DataTypes) => {
  const LessonCompletion = sequelize.define(
    "LessonCompletion",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      lesson_id: { type: DataTypes.INTEGER, allowNull: false },
      completed_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "lesson_completions",
      underscored: true,
      timestamps: true,
    }
  );

  LessonCompletion.associate = (models) => {
    LessonCompletion.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE",
    });

    LessonCompletion.belongsTo(models.Lesson, {
      foreignKey: "lesson_id",
      as: "lesson",
      onDelete: "CASCADE",
    });
  };

  return LessonCompletion;
};
