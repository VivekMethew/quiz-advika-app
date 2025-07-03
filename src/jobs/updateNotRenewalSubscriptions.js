require("dotenv").config();
const { parentPort } = require("worker_threads");
const { mongooseConnection, CONSTANTS } = require("../config");
const { MySubscriptionModel } = require("../models/plans.selected.model");
const {
  usesClreadedForModerator,
  getExiredPlanDateAndTime,
} = require("../utils/plans.utils");
const { SubscriptionsModel } = require("../models/subsription.plans.model");

mongooseConnection();

(async () => {
  try {
    const findQuery = {
      // name: { $ne: CONSTANTS.PLAN_NAMES.TRIAL },
      isResetAt: false,
      resetAt: { $ne: null },
      isDeleted: null,
    };

    const response = await MySubscriptionModel.find(findQuery)
      .populate({ path: "subId", select: "name", model: SubscriptionsModel })
      .select(
        "subId planDurationType purchasedBy isPlatinumTrial isAssignedUser isAddOnUser noOfAddOnUsers plusNoOfUsers startTrial endTrial isResetAt resetAt subId purchasedDate expiredOnDate usesCount"
      );

    if (response.length > 0) {
      for (let obj of response.filter((obj) => obj.subId.name !== "trial")) {
        const findQuery = { _id: obj._id, isDeleted: null };
        const upgradePlan = await SubscriptionsModel.findOne({
          name: "trial",
          isDeleted: null,
        }).select("name monthlyPrice annuallyPrice");

        if (!upgradePlan) {
          console.log(`Trial Not Found!!!`);
        } else {
          const updatePayload = {
            subId: upgradePlan._id,
            planDurationType: "annually",
            pause_collection: true,
            purchasedDate: new Date(),
          };

          updatePayload.isAssignedUser = false;
          updatePayload.isAddOnUser = false;
          updatePayload.isPlatinumTrial = false;
          updatePayload.plusNoOfUsers = 0;
          updatePayload.noOfAddOnUsers = 0;
          updatePayload.startTrial = null;
          updatePayload.endTrial = null;
          updatePayload.isResetAt = false;

          updatePayload.expiredOnDate = getExiredPlanDateAndTime(
            CONSTANTS.PLAN_TYPE.ANNUALLY,
            updatePayload.purchasedDate
          ).expiredOnDate;

          await MySubscriptionModelte(findQuery, updatePayload);

          console.log(`Subscription has been reseted`);
          await usesClreadedForModerator(obj.purchasedBy);
          console.log(`Uses count has been updated...`);
        }
      }
    }
  } catch (error) {
    console.log("ERROR =>", error);
  }

  if (parentPort) parentPort.postMessage("done");
  else process.exit(0);
})();
