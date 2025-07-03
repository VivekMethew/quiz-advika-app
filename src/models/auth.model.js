const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const authUserSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    authUserId: {
      type: String,
      default: null,
    },
    fullname: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      default: null,
    },
    url: {
      type: String,
      default: null,
    },
    isDeleted: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const AuthModel = mongoose.model("Auth", authUserSchema);

module.exports = { AuthModel };
