// // models/Enrollment.js - Fix field names
// export default (sequelize, DataTypes) => {
//   const Enrollment = sequelize.define(
//     "Enrollment",
//     {
//       id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
//       user_id: { // Changed from studentId
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         references: { model: "users", key: "id" },
//         onDelete: "CASCADE",
//       },
//       course_id: { // Changed from courseId
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         references: { model: "courses", key: "id" },
//         onDelete: "CASCADE",
//       },
//       payment_status: {
//         type: DataTypes.ENUM("pending", "paid", "failed"),
//         defaultValue: "pending",
//       },
//       approval_status: {
//         type: DataTypes.ENUM("pending", "approved", "rejected"),
//         defaultValue: "pending",
//       },
//     },
//     {
//       tableName: "enrollments",
//       underscored: true,
//       timestamps: true,
//     }
//   );

//   // Associations
//   Enrollment.associate = (models) => {
//     Enrollment.belongsTo(models.User, {
//       foreignKey: "user_id",
//       as: "student",
//       onDelete: "CASCADE",
//     });
//     Enrollment.belongsTo(models.Course, {
//       foreignKey: "course_id", 
//       as: "course",
//       onDelete: "CASCADE",
//     });
//   };

//   return Enrollment;
// };




export default (sequelize, DataTypes) => {
  const Enrollment = sequelize.define(
    "Enrollment",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "courses", key: "id" },
        onDelete: "CASCADE",
      },
      payment_status: {
        type: DataTypes.ENUM("pending", "paid", "failed"),
        defaultValue: "pending",
      },
      approval_status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
    },
    {
      tableName: "enrollments",
      underscored: true,
      timestamps: true,
      indexes: [{ unique: true, fields: ["user_id", "course_id"] }], // ✅ enforce one enrollment per course per user
    }
  );

  Enrollment.associate = (models) => {
    Enrollment.belongsTo(models.User, { foreignKey: "user_id", as: "student" });
    Enrollment.belongsTo(models.Course, {
      foreignKey: "course_id",
      as: "course",
    });
  };

  return Enrollment;
};
