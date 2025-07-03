const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MySubscriptionSchema = new Schema(
  {
    subId: { type: Schema.Types.ObjectId, ref: "SubscriptionPlan" },
    holdSubId: { type: Schema.Types.ObjectId, ref: "SubscriptionPlan" },
    purchasedBy: { type: Schema.Types.ObjectId, ref: "User" },
    planDurationType: {
      type: String,
      enum: ["trial", "monthly", "annually"],
      default: "trial",
    },
    purchasedDate: { type: Date, default: null },
    expiredOnDate: { type: Date, default: null },
    isResetAt: { type: Boolean, default: false },
    resetAt: { type: Date, default: null },
    renewalOptions: {
      autoRenew: {
        type: Boolean,
        default: false,
      },
      renewalDate: { type: Date, default: null },
      frequency: { type: String, default: null },
    },
    cancellationStatus: {
      isCancelled: {
        type: Boolean,
        default: false,
      },
      cancelledAt: { type: Date, default: null },
    },
    paymentDetails: {
      method: {
        type: String,
        required: true,
      },
      transactionId: { type: String, default: null },
      status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
      },
      metadata: { type: String, default: null },
    },
    usesCount: { type: Number, default: 0 },
    isAssignedUser: { type: Boolean, default: false },
    plusNoOfUsers: { type: Number, default: 0 },
    isAddOnUser: { type: Boolean, default: false },
    noOfAddOnUsers: { type: Number, default: 0 },
    actives: { type: Number, default: 1 },
    isPlatinumTrial: { type: Boolean, default: false },
    isAddonPurchaseUnlimited: { type: Boolean, default: false },
    startTrial: { type: Date, default: null },
    endTrial: { type: Date, default: null },
    status: {
      type: String,
      enum: ["active", "inactive", "pause", "cancel"],
      default: "active",
    },
    pause_collection: { type: Boolean, default: false },
    cancel_collection_by_admin: { type: Boolean, default: false },
    isDeleted: { type: Date, default: null },
  },
  { timestamps: true }
);

const MySubscriptionModel = mongoose.model(
  "MySubscriptions",
  MySubscriptionSchema
);

module.exports = { MySubscriptionModel };
