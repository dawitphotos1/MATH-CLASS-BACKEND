// // models/paymentModel.js
// import mongoose from "mongoose";

// const paymentSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     course: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Course",
//       required: true,
//     },

//     amount: {
//       type: Number,
//       required: true,
//     },

//     currency: {
//       type: String,
//       default: "usd",
//     },

//     stripeSessionId: {
//       type: String,
//       unique: true,
//       sparse: true,
//     },

//     status: {
//       type: String,
//       enum: ["pending", "paid", "failed", "refunded"],
//       default: "pending",
//     },

//     paymentMethod: {
//       type: String,
//       default: "stripe",
//     },

//     enrolledAt: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   { timestamps: true }
// );

// // Optional: clean output
// paymentSchema.methods.toJSON = function () {
//   const obj = this.toObject();
//   delete obj.__v;
//   return obj;
// };

// const Payment = mongoose.model("Payment", paymentSchema);

// export default Payment;




// models/paymentModel.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "usd",
    },

    stripeSessionId: {
      type: String,
      unique: true,
      sparse: true,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      default: "stripe",
    },

    enrolledAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Optional: clean output
paymentSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
