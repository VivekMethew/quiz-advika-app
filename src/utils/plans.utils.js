const { CONSTANTS, MESSAGES } = require("../config");
const { MySubscriptionModel } = require("../models/plans.selected.model");
const { PlayerModel } = require("../models/player.model");
const { quizPollModel } = require("../models/quiz.poll.model");
const { SubscriptionsModel } = require("../models/subsription.plans.model");
const logger = require("./logger");

exports.getExiredPlanDateAndTime = (planType, date) => {
  let response = {};
  switch (planType) {
    case CONSTANTS.PLAN_TYPE.MONTHLY:
      date.setMonth(date.getMonth() + 1);
      response.expiredOnDate = date.toISOString();
      break;
    case CONSTANTS.PLAN_TYPE.ANNUALLY:
      date.setMonth(date.getMonth() + 1);
      response.expiredOnDate = date.toISOString();
      break;
    case CONSTANTS.PLAN_NAMES.TRIAL:
      response.expiredOnDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 7
      );
      break;
  }
  return response;
};

exports.validateSubsPlanForGames = (planType) => {
  let response = {};
  switch (planType) {
    case CONSTANTS.PLAN_NAMES.PLATINUM:
      response.noOfUser = 150;
      response.noOfActiveQuizPoll = 15;
      break;
    case CONSTANTS.PLAN_NAMES.GOLD:
      response.noOfUser = 100;
      response.noOfActiveQuizPoll = 10;
      break;
    case CONSTANTS.PLAN_NAMES.SILVER:
      response.noOfUser = 50;
      response.noOfActiveQuizPoll = 5;
      break;
    case CONSTANTS.PLAN_NAMES.TRIAL:
      response.noOfUser = 5;
      response.noOfActiveQuizPoll = 1;
      break;
  }
  return response;
};

exports.usesCountOfModerator = async (userId) => {
  const mySubscription = await MySubscriptionModel.findOne({
    purchasedBy: userId,
    isDeleted: null,
  })
    .populate({
      path: "subId",
      select: "name noOfUsers",
      model: SubscriptionsModel,
    })
    .select(
      "usesCount plusNoOfUsers isAssignedUser status isAddOnUser noOfAddOnUsers"
    );

  const isAllow = this.validateSubsPlanForGames(mySubscription.subId.name);

  if (mySubscription.isAddOnUser) {
    isAllow.noOfUser += mySubscription.noOfAddOnUsers;
  }

  const isActiveCount = await quizPollModel.find({
    userId: userId,
    $or: [{ status: "active" }, { status: "running" }],
    isDeleted: null,
  });

  return {
    ...isAllow,
    isActiveCount: isActiveCount.length,
    usesCount: mySubscription.usesCount,
  };
};

exports.usesClreadedForModerator = async (userId) => {
  const response = await quizPollModel
    .find({
      userId: userId,
      isDeleted: null,
    })
    .select("code");

  let findQuery = {
    code: { $in: response.map((obj) => obj.code) },
    isCleared: false,
    isDeleted: null,
  };

  await PlayerModel.updateMany(
    findQuery,
    { $set: { isCleared: true } },
    { multi: true }
  );

  await this.assignedPlayersToDisabled(userId);
  return;
};

exports.assignedPlayersToDisabled = async (id) => {
  const findQuery = {};
  findQuery["$and"] = [];
  findQuery["$and"].push({
    purchasedBy: id,
    isDeleted: null,
  });

  const response = await MySubscriptionModel.findOne(findQuery);

  if (!response) {
    logger.error(MESSAGES.NOT_FOUND);
  } else {
    await MySubscriptionModel.findOneAndUpdate(
      findQuery,
      { isAssignedUser: false },
      {
        new: true,
      }
    );
    logger.error("Players assigned disabled...");
  }

  return;
};

exports.usesCountUpdated = async (userId) => {
  await MySubscriptionModel.findOneAndUpdate(
    { purchasedBy: userId, isDeleted: null },
    {
      $inc: { usesCount: 1 },
    },
    { new: true }
  );
  return true;
};
