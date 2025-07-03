require("dotenv").config();
const { mongooseConnection, CONSTANTS } = require("../config");
const { SubscriptionsModel } = require("../models/subsription.plans.model");
mongooseConnection();

(async () => {
  try {
    const plans = ["trial", "silver", "gold", "platinum"];
    for (const plan of plans) {
      const findQuery = { name: plan, isDeleted: null };
      let payload = { name: plan };

      // if (payload.name === CONSTANTS.PLAN_NAMES.TRIAL) {
      //   payload.isAddonUsers = false;
      //   payload.isMediaAnswers = false;
      //   payload.isGallery = false;
      //   payload.isCustomNotifyPopUp = true;
      //   payload.isImageGifQuestions = true;
      //   payload.isQuestionTimes = true;
      //   payload.isDashboardAccess = true;
      //   payload.isPredefinedUsers = false;
      //   payload.isCreateQuizPoll = true;
      //   payload.isPreScheduleQuizPoll = true;
      //   payload.isBuyQuiz = true;
      //   payload.isBuyPoll = true;
      //   payload.isQuizChatGPT = false;
      //   payload.isPollChatGPT = false;
      //   payload.isLeaderboard = true;
      //   payload.isQuizAnalytics = true;
      //   payload.isPollAnalytics = true;
      //   payload.isPlayerLiveLobby = true;
      //   payload.isDownloadSummary = false;
      //   payload.isBuyFromMarket = true;
      //   payload.isMedia = false;
      //   payload.isShared = true;
      //   payload.isCustomizeTime = true;
      //   payload.isLiveScoreBoard = true;
      //   payload.isSharedSocialMedia = true;
      //   payload.isSuffled = false;
      // }

      if (payload.name === CONSTANTS.PLAN_NAMES.SILVER) {
        // payload.noOfUsers = 50;
        // payload.isActiveQuizPoll = 5;
        // payload.monthlyPrice = 2999;
        // payload.annuallyPrice = 35988;
        // payload.isAddonUsers = true;
        // payload.isMediaAnswers = false;
        // payload.isGallery = false;
        // payload.isCustomNotifyPopUp = true;
        // payload.isImageGifQuestions = true;
        // payload.isQuestionTimes = true;
        // payload.isDashboardAccess = true;
        // payload.isPredefinedUsers = true;
        // payload.isCreateQuizPoll = true;
        // payload.isPreScheduleQuizPoll = true;
        // payload.isBuyQuiz = true;
        // payload.isBuyPoll = true;
        // payload.isQuizChatGPT = false;
        // payload.isPollChatGPT = false;
        // payload.isLeaderboard = true;
        // payload.isQuizAnalytics = true;
        // payload.isPollAnalytics = true;
        // payload.isPlayerLiveLobby = true;
        // payload.isDownloadSummary = false;
        // payload.isBuyFromMarket = true;
        // payload.isMedia = false;
        // payload.isShared = true;
        // payload.isCustomizeTime = true;
        // payload.isLiveScoreBoard = true;
        // payload.isSharedSocialMedia = true;
        // payload.isSuffled = false;
        // payload.discountPrice = payload.annuallyPrice / 12;
        // payload.isDiscount = true;
        payload.monthlyProductId = "prod_PIwzCNe348dL4l";
        payload.annuallyProductId = "prod_PIwzCNe348dL4l";
        payload.monthlyPriceId = "price_1OUL5ASAFNtnKvUlNn3sUeTe";
        payload.annuallyPriceId = "price_1PtqucSAFNtnKvUlC1f6lU79";
      }

      if (payload.name === CONSTANTS.PLAN_NAMES.GOLD) {
        // payload.noOfUsers = 100;
        // payload.isActiveQuizPoll = 10;
        // payload.monthlyPrice = 3999;
        // payload.annuallyPrice = 47988;
        // payload.isAddonUsers = true;
        // payload.isMediaAnswers = false;
        // payload.isGallery = false;
        // payload.isCustomNotifyPopUp = true;
        // payload.isImageGifQuestions = true;
        // payload.isQuestionTimes = true;
        // payload.isDashboardAccess = true;
        // payload.isPredefinedUsers = true;
        // payload.isCreateQuizPoll = true;
        // payload.isPreScheduleQuizPoll = true;
        // payload.isBuyQuiz = true;
        // payload.isBuyPoll = true;
        // payload.isQuizChatGPT = false;
        // payload.isPollChatGPT = false;
        // payload.isLeaderboard = true;
        // payload.isQuizAnalytics = true;
        // payload.isPollAnalytics = true;
        // payload.isPlayerLiveLobby = true;
        // payload.isDownloadSummary = false;
        // payload.isBuyFromMarket = true;
        // payload.isMedia = false;
        // payload.isShared = true;
        // payload.isCustomizeTime = true;
        // payload.isLiveScoreBoard = true;
        // payload.isSharedSocialMedia = true;
        // payload.isSuffled = true;
        // payload.discountPrice = payload.annuallyPrice / 12;
        // payload.isDiscount = true;
        payload.monthlyProductId = "prod_PIx0U5w4YIf78Z";
        payload.annuallyProductId = "prod_PIx0U5w4YIf78Z";
        payload.monthlyPriceId = "price_1OUL6eSAFNtnKvUl5MyubP3h";
        payload.annuallyPriceId = "price_1Ptqq5SAFNtnKvUlHHstB0Xf";
      }

      if (payload.name === CONSTANTS.PLAN_NAMES.PLATINUM) {
        // payload.noOfUsers = 150;
        // payload.isActiveQuizPoll = 15;
        // payload.monthlyPrice = 6499;
        // payload.annuallyPrice = 77988;
        // payload.isAddonUsers = true;
        // payload.isMediaAnswers = true;
        // payload.isGallery = true;
        // payload.isCustomNotifyPopUp = true;
        // payload.isImageGifQuestions = true;
        // payload.isQuestionTimes = true;
        // payload.isDashboardAccess = true;
        // payload.isPredefinedUsers = true;
        // payload.isCreateQuizPoll = true;
        // payload.isPreScheduleQuizPoll = true;
        // payload.isBuyQuiz = true;
        // payload.isBuyPoll = true;
        // payload.isQuizChatGPT = true;
        // payload.isPollChatGPT = true;
        // payload.isLeaderboard = true;
        // payload.isQuizAnalytics = true;
        // payload.isPollAnalytics = true;
        // payload.isPlayerLiveLobby = true;
        // payload.isDownloadSummary = true;
        // payload.isBuyFromMarket = true;
        // payload.isMedia = true;
        // payload.isShared = true;
        // payload.isCustomizeTime = true;
        // payload.isLiveScoreBoard = true;
        // payload.isSharedSocialMedia = true;
        // payload.isSuffled = true;
        // payload.discountPrice = payload.annuallyPrice / 12;
        // payload.isDiscount = true;
        payload.monthlyProductId = "prod_PIx2VC4nEQq85v";
        payload.annuallyProductId = "prod_PIx2VC4nEQq85v";
        payload.monthlyPriceId = "price_1PtqoHSAFNtnKvUl3BRPB0E6";
        payload.annuallyPriceId = "price_1PtqneSAFNtnKvUlFomW0tLS";
      }

      await SubscriptionsModel.findOneAndUpdate(findQuery, payload);
      // await SubscriptionsModel.create(payload);
    }
    console.log(`Subscrip[tion] has been updated `);
  } catch (error) {
    console.log("ERROR =>", error);
  }
  process.exit();
})();
