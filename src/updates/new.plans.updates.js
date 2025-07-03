require("dotenv").config();
const { mongooseConnection, CONSTANTS } = require("../config");
const { quizPollModel } = require("../models/quiz.poll.model");
const { SubscriptionsModel } = require("../models/subsription.plans.model");
mongooseConnection();

(async () => {
  try {
    const response = await SubscriptionsModel.find({});
    for (let item of response) {
      let payload = {
        isCreateQuizPoll: true,
        isPreScheduleQuizPoll: true,
      };

      await SubscriptionsModel.findOneAndUpdate(
        { _id: item._id },
        {
          $set: payload,
        }
      );
    }
    console.log(`Subscrip[tion] has been updated : ${response.length}`);
  } catch (error) {
    console.log("ERROR =>", error);
  }
  process.exit();
})();
