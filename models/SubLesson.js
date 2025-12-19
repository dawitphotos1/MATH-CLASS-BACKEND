// models/SubLesson.js
export default (sequelize, DataTypes) => {
  const SubLesson = sequelize.define(
    "SubLesson",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      lesson_id: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      content: { type: DataTypes.TEXT, allowNull: true },
      order_index: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      content_type: {
        type: DataTypes.ENUM("text", "video", "pdf", "mixed"),
        defaultValue: "text",
      },
    },
    {
      tableName: "sublessons",
      timestamps: true,
      underscored: true,
    }
  );

  SubLesson.associate = (models) => {
    SubLesson.belongsTo(models.Lesson, {
      foreignKey: "lesson_id",
      as: "lesson",
      onDelete: "CASCADE",
    });
    // ✅ ADDED: Relationship with attachments
    SubLesson.hasMany(models.Attachment, {
      foreignKey: "sublesson_id",
      as: "attachments",
      onDelete: "CASCADE",
    });
  };

  return SubLesson;
};