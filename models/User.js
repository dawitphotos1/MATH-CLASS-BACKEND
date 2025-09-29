
// export default (sequelize, DataTypes) => {
//   const User = sequelize.define(
//     "User",
//     {
//       id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//       },
//       name: {
//         type: DataTypes.STRING(255),
//         allowNull: false,
//       },
//       email: {
//         type: DataTypes.STRING(100),
//         allowNull: false,
//         unique: true,
//       },
//       password: {
//         type: DataTypes.STRING(255),
//         allowNull: false,
//       },
//       role: {
//         type: DataTypes.ENUM("student", "teacher", "admin"),
//         allowNull: false,
//         defaultValue: "student",
//       },
//       subject: {
//         type: DataTypes.STRING(255),
//         allowNull: true,
//       },
//       approval_status: {
//         type: DataTypes.ENUM("pending", "approved", "rejected"),
//         allowNull: true, // DB allows NULL
//         defaultValue: "approved", // match DB default
//       },
//       avatar: {
//         type: DataTypes.STRING(255),
//         allowNull: true,
//       },
//       email_notification_status: {
//         type: DataTypes.BOOLEAN,
//         allowNull: false,
//         defaultValue: true,
//       },
//       is_active: {
//         type: DataTypes.BOOLEAN,
//         allowNull: false,
//         defaultValue: true,
//       },
//     },
//     {
//       tableName: "users",
//       timestamps: true,
//       underscored: true, // maps createdAt → created_at
//     }
//   );

//   return User;
// };




// models/User.js
export default (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      role: {
        type: DataTypes.ENUM("admin", "teacher", "student"),
        allowNull: false,
        defaultValue: "student",
      },
      subject: { type: DataTypes.STRING },
      approval_status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
    },
    {
      tableName: "users",
      underscored: true,
      timestamps: true,
    }
  );

  User.associate = (models) => {
    User.hasOne(models.Teacher, { foreignKey: "user_id", as: "teacherProfile" });
    User.hasMany(models.Course, { foreignKey: "created_by", as: "courses" });
  };

  return User;
};
