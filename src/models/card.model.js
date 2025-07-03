const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CardSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    custorerId: {
      type: String,
      default: null,
    },
    cardId: {
      type: String,
      default: null,
    },
    last4: {
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

const CardModel = mongoose.model("Cards", CardSchema);

module.exports = { CardModel };
