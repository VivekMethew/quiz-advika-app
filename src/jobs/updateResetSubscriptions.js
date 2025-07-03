require("dotenv").config();
const { parentPort } = require("worker_threads");
const { mongooseConnection, CONSTANTS } = require("../config");
const { MySubscriptionModel } = require("../models/plans.selected.model");
const {
  usesClreadedForModerator,
  getExiredPlanDateAndTime,
} = require("../utils/plans.utils");
const { isResetDateMatched } = require("../utils/dateUtils");
const { SubscriptionsModel } = require("../models/subsription.plans.model");

mongooseConnection();

(async () => {
  try {
    const currentDate = new Date();
    const findQuery = {
      // name: { $ne: CONSTANTS.PLAN_NAMES.TRIAL },
      isResetAt: true,
      resetAt: { $lt: currentDate },
      isDeleted: null,
    };

    const response = await MySubscriptionModel.find(findQuery)
      .populate({ path: "subId", select: "name", model: SubscriptionsModel })
      .select(
        "planDurationType purchasedBy isPlatinumTrial isAssignedUser isAddOnUser noOfAddOnUsers plusNoOfUsers startTrial endTrial isResetAt resetAt subId purchasedDate expiredOnDate usesCount"
      );

    console.log(
      "LEN : ",
      response.filter((obj) => obj.subId.name !== "trial").length
    );

    if (response.length > 0) {
      for (let obj of response.filter((obj) => obj.subId.name !== "trial")) {
        const findQuery = { _id: obj._id, isDeleted: null };
        const updatePayload = {};
        updatePayload.isAssignedUser = false;
        updatePayload.isAddOnUser = false;
        updatePayload.isPlatinumTrial = false;
        updatePayload.plusNoOfUsers = 0;
        updatePayload.noOfAddOnUsers = 0;
        updatePayload.startTrial = null;
        updatePayload.endTrial = null;

        if (obj.planDurationType === CONSTANTS.PLAN_TYPE.ANNUALLY) {
          const isResetAtNext = isResetDateMatched(
            obj.expiredOnDate,
            obj.resetAt
          );
          if (isResetAtNext) {
            updatePayload.isResetAt = false;
          } else {
            update.resetAt = getExiredPlanDateAndTime(
              CONSTANTS.PLAN_TYPE.MONTHLY,
              new Date(obj.resetAt)
            ).expiredOnDate;
            updatePayload.isResetAt = true;
          }
        } else {
          updatePayload.isResetAt = false;
        }
        await MySubscriptionModel.findOneAndUpdate(findQuery, updatePayload);
        console.log(`Subscription has been reseted`);
        await usesClreadedForModerator(obj.purchasedBy);
        console.log(`Uses count has been updated...`);
      }
    }
  } catch (error) {
    console.log("ERROR =>", error);
  }

  if (parentPort) parentPort.postMessage("done");
  else process.exit(0);
})();
