
// // models/Payment.js
// export default (sequelize, DataTypes) => {
//   const Payment = sequelize.define(
//     "Payment",
//     {
//       id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
//       user_id: { type: DataTypes.INTEGER, allowNull: false },
//       course_id: { type: DataTypes.INTEGER, allowNull: false },
//       stripe_session_id: { type: DataTypes.STRING, unique: true },
//       amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
//       currency: { type: DataTypes.STRING, defaultValue: "usd" },
//       status: {
//         type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
//         defaultValue: "pending",
//       },
//       payment_method: { type: DataTypes.STRING, defaultValue: "stripe" },
//       paid_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
//     },
//     {
//       tableName: "payments",
//       underscored: true,
//       timestamps: true,
//     }
//   );

//   Payment.associate = (models) => {
//     Payment.belongsTo(models.User, {
//       foreignKey: "user_id",
//       as: "user",
//       onDelete: "CASCADE",
//     });
//     Payment.belongsTo(models.Course, {
//       foreignKey: "course_id",
//       as: "course",
//       onDelete: "CASCADE",
//     });
//   };

//   return Payment;
// };





// models/Payment.js
export default (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    "Payment",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      course_id: { type: DataTypes.INTEGER, allowNull: false },
      stripe_session_id: { type: DataTypes.STRING, unique: true },
      amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      currency: { type: DataTypes.STRING, defaultValue: "usd" },
      status: {
        type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
        defaultValue: "pending",
      },
      payment_method: { type: DataTypes.STRING, defaultValue: "stripe" },
      paid_at: { type: DataTypes.DATE },
    },
    {
      tableName: "payments",
      underscored: true,
      timestamps: true,
    }
  );

  Payment.associate = (models) => {
    Payment.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE",
    });
    Payment.belongsTo(models.Course, {
      foreignKey: "course_id",
      as: "course",
      onDelete: "CASCADE",
    });
  };

  return Payment;
};