const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VrPasscodeSchema = new Schema(
  {
    passcode:{type:String,default:"123456"},
    isDeleted: { type: Date, default: null },
  },
  { timestamps: true }
);

const VrPasscodeModel = mongoose.model("vrpassword", VrPasscodeSchema);

module.exports = { VrPasscodeModel };
