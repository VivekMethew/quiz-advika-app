const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const playersSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "QuizPoll" },
    name: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: true,
    },
    code: { type: Number },
    description: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    isPlayed: {
      type: String,
      enum: ["joined", "played", "unplayed", "invited"],
      default: "joined",
    },
    isCleared: {
      type: Boolean,
      default: false,
    },
    isEliminate: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    isDeleted: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const PlayerModel = mongoose.model("Player", playersSchema);

module.exports = { PlayerModel };
