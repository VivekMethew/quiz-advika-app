const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    QuizPollId: { type: Schema.Types.ObjectId, ref: "QuizPoll" },
    title: { type: String },
    content: { type: String },
    isRead: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    isDeleted: { type: Date, default: null },
  },
  { timestamps: true }
);

const NotificationModel = mongoose.model("Notifications", NotificationSchema);

module.exports = { NotificationModel };
