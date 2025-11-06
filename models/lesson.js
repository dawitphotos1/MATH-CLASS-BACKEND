// // //models/Lesson.js

// export default (sequelize, DataTypes) => {
//   const Lesson = sequelize.define(
//     "Lesson",
//     {
//       course_id: { type: DataTypes.INTEGER, allowNull: false },
//       title: { type: DataTypes.STRING, allowNull: false },
//       content: { type: DataTypes.TEXT },
//       video_url: { type: DataTypes.STRING },
//       order_index: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         defaultValue: 1,
//       },
//     },
//     {
//       tableName: "lessons",
//       underscored: true,
//     }
//   );

//   Lesson.associate = (models) => {
//     Lesson.belongsTo(models.Course, {
//       foreignKey: "course_id",
//       as: "course",
//       onDelete: "CASCADE",
//     });

//     Lesson.hasMany(models.Attachment, {
//       foreignKey: "lesson_id",
//       as: "attachments",
//       onDelete: "CASCADE",
//       hooks: true,
//     });

//     Lesson.hasMany(models.LessonCompletion, {
//       foreignKey: "lesson_id",
//       as: "completions",
//       onDelete: "CASCADE",
//       hooks: true,
//     });
//   };

//   return Lesson;
// };


// models/Lesson.js
export default (sequelize, DataTypes) => {
  const Lesson = sequelize.define(
    "Lesson",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      unit_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: "units", key: "id" } },
      course_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "courses", key: "id" } },
      title: { type: DataTypes.STRING, allowNull: false },
      content: { type: DataTypes.TEXT, allowNull: true },
      video_url: { type: DataTypes.STRING, allowNull: true },
      order_index: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      content_type: { type: DataTypes.ENUM("text", "video", "mixed"), defaultValue: "text" },
    },
    {
      tableName: "lessons",
      timestamps: true,
      underscored: true,
    }
  );

  Lesson.associate = (models) => {
    Lesson.belongsTo(models.Unit, { foreignKey: "unit_id", as: "unit" });
    Lesson.belongsTo(models.Course, { foreignKey: "course_id", as: "course" });
  };

  return Lesson;
};
