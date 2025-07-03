const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WallOfFameAnswerSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "QuizPoll" },
    quisId: { type: Schema.Types.ObjectId, ref: "Question" },
    playerId: { type: Schema.Types.ObjectId, ref: "Player" },
    code: { type: Number, required: true },
    answers: { type: [String], default: [] },
    point: { type: Number, default: 0 },
    isDeleted: { type: Date, default: null },
  },
  { timestamps: true }
);

const WallOfFameAnswerModel = mongoose.model(
  "WallOfFameAnswer",
  WallOfFameAnswerSchema
);

module.exports = { WallOfFameAnswerModel };
