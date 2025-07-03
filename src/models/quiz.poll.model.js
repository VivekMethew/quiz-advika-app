const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const quizPollSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    catId: { type: Schema.Types.ObjectId, ref: "Category" },
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    code: { type: Number, unique: true, required: true },
    title: { type: String, required: true },
    type: { type: String, default: "quiz" },
    questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    description: { type: String, default: null },
    coverImage: { type: Schema.Types.ObjectId, ref: "File", default: null },
    tags: [{ type: String }],
    timezon: { type: String, default: null },
    startDateTime: { type: Date, required: true },
    duration: { type: Number, required: true },
    isForEver: { type: Boolean, default: false },
    endDateTime: { type: Date, required: true },
    qrCodeLink: { type: String, default: null },
    isSuggested: { type: Boolean, default: false },
    ratings: {
      type: Number,
      default: null,
    },
    addToFav: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    price: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },
    isWallOfFame: { type: Boolean, default: false },
    isApplied: { type: Boolean, default: false },
    isAccess: { type: String, enum: ["public", "private"], default: "public" },
    isApproved: {
      type: String,
      enum: ["pending", "approved", "reject"],
      default: "pending",
    },
    isRejectReason: { type: String, default: null },
    suggestion: { type: String, default: null },
    status: {
      type: String,
      enum: ["pending", "active", "deactivated", "running", "closed", "order"],
      default: "pending",
    },
    createdFrom: {
      type: Schema.Types.ObjectId,
      ref: "QuizPoll",
      default: null,
    },
    isPurchased: { type: Boolean, default: false },
    isShuffle: { type: Boolean, default: false },
    isArchives: { type: Boolean, default: false },
    isCreatedFrom: { type: Boolean, default: false },
    purchaseCount: { type: Number, default: 0 },
    isDated: { type: Date, default: null },
    isDeleted: { type: Date, default: null },
    isAutostart: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    isDuplicate: { type: Boolean, default: false },
    isActivated: { type: Boolean, default: false },
    copyCount: { type: Number, default: 0 },
  },

  { timestamps: true }
);

const quizPollModel = mongoose.model("QuizPoll", quizPollSchema);

module.exports = { quizPollModel };
