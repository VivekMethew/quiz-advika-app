const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const moderatorDeactivationLogSchema = new Schema(
  {

     type:{
      type: String,
      enum: ["activation", "deactivation"],
     },
     performedTo:{
        type: String,
        default: null,
     },
     performedBy:{
        type: String,
        default: null,
     },
     performedAt:{
        type: Date,
        default: null,
     },
     isDeleted: { type: Date, default: null },
  },
  { timestamps: true }
);

const ModeratorDeactivationLog = mongoose.model("ModeratorDeactivationLog", moderatorDeactivationLogSchema);

module.exports = { ModeratorDeactivationLog };