require("dotenv").config();
const { parentPort } = require("worker_threads");

const { mongooseConnection, CONSTANTS } = require("../config");
const { MySubscriptionModel } = require("../models/plans.selected.model");
const { SubscriptionsModel } = require("../models/subsription.plans.model");

mongooseConnection();

(async () => {
  try {
    const findQuery = {
      isPlatinumTrial: true,
      endTrial: {
        $lt: new Date(),
      },
    };

    const response = await MySubscriptionModel.find(findQuery).select(
      "purchasedBy isPlatinumTrial startTrial endTrial subId"
    );

    console.log("LEN : ", response.length);

    if (response.length > 0) {
      const upgradePlan = await SubscriptionsModel.findOne({
        name: CONSTANTS.PLAN_NAMES.TRIAL,
        isDeleted: null,
      }).select("name monthlyPrice annuallyPrice");

      if (!upgradePlan) {
        return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
      }

      await MySubscriptionModel.findOneAndUpdate(
        findQuery,
        { subId: upgradePlan._id },
        {
          new: true,
        }
      );
    }
  } catch (error) {
    console.log("ERROR =>", error);
  }

  if (parentPort) parentPort.postMessage("done");
  else process.exit(0);
})();
