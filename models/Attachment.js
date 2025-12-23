// // models/Attachment.js
// export default (sequelize, DataTypes) => {
//   const Attachment = sequelize.define(
//     "Attachment",
//     {
//       id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
//       lesson_id: { type: DataTypes.INTEGER, allowNull: true },
//       sublesson_id: { type: DataTypes.INTEGER, allowNull: true },
//       file_path: { type: DataTypes.STRING, allowNull: false },
//       file_type: { type: DataTypes.STRING },
//       file_name: { type: DataTypes.STRING },
//       file_size: { type: DataTypes.INTEGER },
//     },
//     {
//       tableName: "attachments",
//       underscored: true,
//       timestamps: true,
//     }
//   );

//   Attachment.associate = (models) => {
//     Attachment.belongsTo(models.Lesson, {
//       foreignKey: "lesson_id",
//       onDelete: "CASCADE",
//     });
//     Attachment.belongsTo(models.SubLesson, {
//       foreignKey: "sublesson_id",
//       onDelete: "CASCADE",
//     });
//   };

//   return Attachment;
// };





// models/Attachment.js
export default (sequelize, DataTypes) => {
  const Attachment = sequelize.define(
    "Attachment",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      lesson_id: { type: DataTypes.INTEGER, allowNull: true },
      sublesson_id: { type: DataTypes.INTEGER, allowNull: true },
      file_path: { type: DataTypes.STRING, allowNull: false },
      file_type: { type: DataTypes.STRING },
      file_name: { type: DataTypes.STRING },
      file_size: { type: DataTypes.INTEGER },
    },
    {
      tableName: "attachments",
      underscored: true,
      timestamps: true,
    }
  );

  Attachment.associate = (models) => {
    Attachment.belongsTo(models.Lesson, {
      foreignKey: "lesson_id",
      onDelete: "CASCADE",
    });
    Attachment.belongsTo(models.SubLesson, {
      foreignKey: "sublesson_id",
      onDelete: "CASCADE",
    });
  };

  return Attachment;
};
