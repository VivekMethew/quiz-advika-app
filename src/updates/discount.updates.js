require("dotenv").config();
const { mongooseConnection } = require("../config");
const { quizPollModel } = require("../models/quiz.poll.model");
const { SubscriptionsModel } = require("../models/subsription.plans.model");
mongooseConnection();

(async () => {
  try {
    const response = await SubscriptionsModel.find({ name: { $ne: "trial" } });
    for (let item of response) {
      const discountPrice = item.annuallyPrice / 12;
      await SubscriptionsModel.updateOne(
        { _id: item._id },
        {
          $set: { isDiscount: true, discountPrice },
        }
      );
    }
    console.log(`Subscrip[tion] has been updated : ${response.length}`);
  } catch (error) {
    console.log("ERROR =>", error);
  }
  process.exit();
})();
