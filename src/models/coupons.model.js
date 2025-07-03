const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;

const SCHEMA = new Schema(
  {
    code: { type: String, required: true },
    discount: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    isDeleted: { type: Date, default: null },
  },
  { timestamps: true }
);

const CouponModel = mongoose.model("Coupon", SCHEMA);

module.exports = { CouponModel };
