require("dotenv").config();
const { mongooseConnection, CONSTANTS } = require("../config");
const { SubscriptionsModel } = require("../models/subsription.plans.model");
mongooseConnection();

(async () => {
  try {
    const plans = ["trial", "silver", "gold", "platinum"];
    for (const plan of plans) {
      let payload = { name: plan };

      if (payload.name === CONSTANTS.PLAN_NAMES.SILVER) {
        payload.noOfUsers = 50;
        payload.isActiveQuizPoll = 5;
        payload.monthlyPrice = 2999;
        payload.annuallyPrice = 35988;
        payload.isAddonUsers = true;
        payload.isPredefinedUsers = true;
        payload.discountPrice = payload.annuallyPrice / 12;
        payload.isDiscount = true;
        payload.monthlyProductId = "prod_PIwzCNe348dL4l";
        payload.annuallyProductId = "prod_PIwzCNe348dL4l";
        payload.monthlyPriceId = "price_1OUL5ASAFNtnKvUlNn3sUeTe";
        payload.annuallyPriceId = "price_1OUL5rSAFNtnKvUlmsKcUrNy";
      }

      if (payload.name === CONSTANTS.PLAN_NAMES.GOLD) {
        payload.noOfUsers = 350;
        payload.isActiveQuizPoll = 10;
        payload.monthlyPrice = 3999;
        payload.annuallyPrice = 39999;
        payload.isAddonUsers = true;
        payload.isPredefinedUsers = true;
        payload.isSuffled = true;
        payload.discountPrice = payload.annuallyPrice / 12;
        payload.isDiscount = true;
        payload.monthlyProductId = "prod_PIx0U5w4YIf78Z";
        payload.annuallyProductId = "prod_PIx0U5w4YIf78Z";
        payload.monthlyPriceId = "price_1OUL6eSAFNtnKvUl5MyubP3h";
        payload.annuallyPriceId = "price_1OUL7DSAFNtnKvUliszX252j";
      }

      if (payload.name === CONSTANTS.PLAN_NAMES.PLATINUM) {
        payload.noOfUsers = 500;
        payload.isActiveQuizPoll = 15;
        payload.monthlyPrice = 7999;
        payload.annuallyPrice = 79999;
        payload.isAddonUsers = true;
        payload.isPredefinedUsers = true;
        payload.isQuizChatGPT = true;
        payload.isPollChatGPT = true;
        payload.isMediaAnswers = true;
        payload.isMedia = true;
        payload.isGallery = true;
        payload.isSuffled = true;
        payload.discountPrice = payload.annuallyPrice / 12;
        payload.isDiscount = true;
        payload.monthlyProductId = "prod_PIx2VC4nEQq85v";
        payload.annuallyProductId = "prod_PIx2VC4nEQq85v";
        payload.monthlyPriceId = "price_1OUL82SAFNtnKvUlOhexIu0L";
        payload.annuallyPriceId = "price_1OUL8eSAFNtnKvUl4xzrzMi2";
      }
      await SubscriptionsModel.create(payload);
    }
    console.log(`Subscrip[tion] has been updated `);
  } catch (error) {
    console.log("ERROR =>", error);
  }
  process.exit();
})();
