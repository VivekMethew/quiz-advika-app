const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrdersSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["subscription", "product", "addOnPack"],
      default: "subscription",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: "MySubscriptions",
    },
    subsId: {
      type: Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
    },
    quizAndPollId: {
      type: Schema.Types.ObjectId,
      ref: "QuizPoll",
    },
    amount: { type: Number, required: true },
    transactionId: { type: String },
    paymentMethod: { type: String },
    paymentResponse: { type: String },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    metadata: { type: String, default: null },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "success",
    },
    isDeleted: { type: Date, default: null },
  },
  { timestamps: true }
);

const OrderModel = mongoose.model("Orders", OrdersSchema);

module.exports = { OrderModel };
