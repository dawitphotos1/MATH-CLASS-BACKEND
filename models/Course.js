// //models/Course.js
// export default (sequelize, DataTypes) => {
//   const Course = sequelize.define(
//     "Course",
//     {
//       title: { type: DataTypes.STRING, allowNull: false },
//       slug: { type: DataTypes.STRING, allowNull: false, unique: true },
//       description: { type: DataTypes.TEXT },
//       teacher_id: { type: DataTypes.INTEGER, allowNull: true },
//       price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
//       thumbnail: { type: DataTypes.STRING, allowNull: true },
//     },
//     {
//       tableName: "courses",
//       underscored: true,
//     }
//   );

//   Course.associate = (models) => {
//     Course.hasMany(models.Lesson, {
//       foreignKey: "course_id",
//       as: "lessons",
//       onDelete: "CASCADE",
//       hooks: true,
//     });

//     Course.belongsTo(models.User, {
//       foreignKey: "teacher_id",
//       as: "teacher",
//       onDelete: "SET NULL",
//     });
//   };

//   return Course;
// };




// models/Course.js
export default (sequelize, DataTypes) => {
  const Course = sequelize.define(
    "Course",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING, allowNull: false },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      description: { type: DataTypes.TEXT },
      teacher_id: { type: DataTypes.INTEGER, allowNull: true },
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      thumbnail: { type: DataTypes.STRING, allowNull: true },
    },
    {
      tableName: "courses",
      underscored: true,
      timestamps: true,
    }
  );

  Course.associate = (models) => {
    Course.hasMany(models.Lesson, {
      foreignKey: "course_id",
      as: "lessons",
      onDelete: "CASCADE",
    });

    Course.hasMany(models.Unit, {
      foreignKey: "course_id",
      as: "units",
      onDelete: "CASCADE",
    });

    Course.belongsTo(models.User, {
      foreignKey: "teacher_id",
      as: "teacher",
      onDelete: "SET NULL",
    });

    Course.hasMany(models.Enrollment, {
      foreignKey: "course_id",
      as: "enrollments",
    });
  };

  return Course;
};