const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WinnerSchema = new Schema(
  {
    eventType: { type: String, enum: ["quiz", "poll"], default: "quiz" },
    code: { type: Number, required: true },
    playerId: { type: Schema.Types.ObjectId, ref: "Player" },
    eventId: { type: Schema.Types.ObjectId, ref: "QuizPoll" },
    description: { type: String, default: null },
    points: { type: Number, default: 0 },
    totalPoint: { type: Number, default: 0 },
    playedInfo: [],
    year: { type: Number, default: null },
    playedQuestions: [],
    playedTime: { type: Number, default: 0 },
    status: { type: String, enum: ["finish", "failed"], default: "finish" },
    isDeleted: { type: Date, default: null },
  },
  { timestamps: true }
);

const WinnerModel = mongoose.model("Winner", WinnerSchema);

module.exports = { WinnerModel };
