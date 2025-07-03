const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CustomerSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["customer", "owner"],
      default: "customer",
    },
    custId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["inactive", "active"],
      default: "active",
    },
    isDeleted: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const CustomerModel = mongoose.model("Customer", CustomerSchema);

module.exports = { CustomerModel };
