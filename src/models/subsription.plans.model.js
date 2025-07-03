const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SubscriptionsSchema = new Schema(
  {
    name: { type: String, unique: true, required: true },
    monthlyPrice: { type: Number, default: 0 },
    annuallyPrice: { type: Number, default: 0 },
    isDiscount: { type: Boolean, default: false },
    discountPrice: { type: Number, default: 0 },
    couponId: { type: Schema.Types.ObjectId, ref: "Coupon" },
    noOfUsers: { type: Number, default: 5 },
    isActiveQuizPoll: { type: Number, default: 1 },
    cover: { type: String, default: null },
    isPaid: { type: Boolean, default: false },
    isAddonUsers: { type: Boolean, default: false },
    isMediaAnswers: { type: Boolean, default: false },
    isGallery: { type: Boolean, default: false },
    isCustomNotifyPopUp: { type: Boolean, default: true },
    isImageGifQuestions: { type: Boolean, default: true },
    isQuestionTimes: { type: Boolean, default: true },
    isDashboardAccess: { type: Boolean, default: true },
    isPredefinedUsers: { type: Boolean, default: false },
    isCreateQuizPoll: { type: Boolean, default: true },
    isPreScheduleQuizPoll: { type: Boolean, default: true },
    isBuyQuiz: { type: Boolean, default: true },
    isBuyPoll: { type: Boolean, default: true },
    isQuizChatGPT: { type: Boolean, default: false },
    isPollChatGPT: { type: Boolean, default: false },
    isLeaderboard: { type: Boolean, default: true },
    isQuizAnalytics: { type: Boolean, default: true },
    isPollAnalytics: { type: Boolean, default: true },
    isPlayerLiveLobby: { type: Boolean, default: true },
    isDownloadSummary: { type: Boolean, default: false },
    isBuyFromMarket: { type: Boolean, default: true },
    isMedia: { type: Boolean, default: false },
    isShared: { type: Boolean, default: true },
    isCustomizeTime: { type: Boolean, default: true },
    isLiveScoreBoard: { type: Boolean, default: true },
    isSharedSocialMedia: { type: Boolean, default: true },
    isSuffled: { type: Boolean, default: false },
    description: { type: String },
    monthlyProductId: { type: String, default: null },
    annuallyProductId: { type: String, default: null },
    monthlyPriceId: { type: String, default: null },
    annuallyPriceId: { type: String, default: null },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    isDeleted: { type: Date, default: null },
  },
  { timestamps: true }
);

const SubscriptionsModel = mongoose.model(
  "SubscriptionPlan",
  SubscriptionsSchema
);

module.exports = { SubscriptionsModel };
