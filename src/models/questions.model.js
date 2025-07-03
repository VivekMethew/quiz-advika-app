const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuestionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    title: { type: String },
    type: { type: String, default: "quiz" },
    optionType: {
      type: String,
      enum: ["mcq", "text", "image", "video"],
      default: "mcq",
    },
    duration: { type: Number, default: 0 },
    isTextFree: { type: Boolean, default: true },
    answerText: { type: String, default: null },
    point: { type: Number, default: 0 },
    image: { type: Schema.Types.ObjectId, ref: "File", default: null },
    thumbnail: { type: Schema.Types.ObjectId, ref: "File", default: null },
    options: [{ type: String, required: true }],
    answers: [{ type: Number }],
    position: { type: Number },
    customMessage: {
      file: { type: Schema.Types.ObjectId, ref: "File", default: null },
      text: { type: String },
    },
    isUsed: { type: Boolean, default: false },
    isWallOfFame: { type: Boolean, default: false },
    status: { type: String, default: "active" },
    isCreatedByChatgpt: { type: Boolean, default: false },
    isDeleted: { type: Date, default: null },
  },
  { timestamps: true }
);
const QuestionModel = mongoose.model("Question", QuestionSchema);
module.exports = { QuestionModel };
