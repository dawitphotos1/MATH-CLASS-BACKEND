
// export default (sequelize, DataTypes) => {
//   const Attachment = sequelize.define(
//     "Attachment",
//     {
//       lesson_id: { type: DataTypes.INTEGER, allowNull: false },
//       file_path: { type: DataTypes.STRING, allowNull: false },
//       file_type: { type: DataTypes.STRING },
//     },
//     {
//       tableName: "attachments",
//       underscored: true,
//     }
//   );

//   Attachment.associate = (models) => {
//     Attachment.belongsTo(models.Lesson, {
//       foreignKey: "lesson_id",
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
      lesson_id: { type: DataTypes.INTEGER, allowNull: false },
      file_path: { type: DataTypes.STRING, allowNull: false },
      file_type: { type: DataTypes.STRING },
    },
    {
      tableName: "attachments",
      underscored: true,
    }
  );

  Attachment.associate = (models) => {
    Attachment.belongsTo(models.Lesson, {
      foreignKey: "lesson_id",
      onDelete: "CASCADE",
    });
  };

  return Attachment;
};
