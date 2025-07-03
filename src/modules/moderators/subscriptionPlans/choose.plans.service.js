const { HTTP_CODES, CONSTANTS, MESSAGES } = require("../../../config");
const { serviceResponse } = require("../../../helpers/response");
const { OrderModel } = require("../../../models/orders.model");
const { MySubscriptionModel } = require("../../../models/plans.selected.model");
const {
  SubscriptionsModel,
} = require("../../../models/subsription.plans.model");
const { User } = require("../../../models/users.model");
const { logger } = require("../../../utils");
const { getExiredPlanDateAndTime } = require("../../../utils/plans.utils");

exports.chooseSubscriptionPlan = async (id, payload) => {
  if (payload.name === CONSTANTS.PLAN_NAMES.TRIAL) {
    return serviceResponse(
      false,
      HTTP_CODES.BAD_REQUEST,
      `Your ${payload.name} period has been expired`
    );
  }

  const user = await User.findOne({ email: payload.email });
  const response = await MySubscriptionModel.findOne({
    purchasedBy: user.id,
  }).populate({path:"subId",model:SubscriptionsModel});

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  if (
    response.subId.name === payload.name &&
    response.planDurationType === payload.planDurationType
  )
    return serviceResponse(
      false,
      HTTP_CODES.BAD_REQUEST,
      `You have already ${payload.planDurationType} plan`
    );

  const upgradePlan = await SubscriptionsModel.findOne({
    name: payload.name,
    isDeleted: null,
  }).select("name monthlyPrice annuallyPrice");

  if (!upgradePlan)
    return serviceResponse(
      false,
      HTTP_CODES.NOT_FOUND,
      `${payload.name} Not Found!!!`
    );

  let update = {
    subId: upgradePlan._id,
    planDurationType: payload.planDurationType,
    purchasedDate: new Date(),
  };

  update.expiredOnDate = getExiredPlanDateAndTime(
    payload.planDurationType,
    update.purchasedDate
  ).expiredOnDate;

  update.resetAt = getExiredPlanDateAndTime(
    CONSTANTS.PLAN_TYPE.MONTHLY,
    update.purchasedDate
  ).expiredOnDate;

  update.paymentDetails = payload.paymentDetails;

  const updateMySub = await MySubscriptionModel.findOneAndUpdate(
    { _id: response._id, isDeleted: null },
    { $set: update },
    { new: true }
  );

  if (!updateMySub)
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);

  let orderPayload = {
    type: "subscription",
    userId: user._id,
    planId: response._id,
    subsId: upgradePlan._id,
    amount:
      payload.planDurationType === "monthly"
        ? upgradePlan.monthlyPrice
        : upgradePlan.annuallyPrice,
    transactionId: payload.paymentDetails.transactionId,
    paymentMethod: payload.paymentDetails.method,
    paymentStatus: "paid",
  };

  // const order = await OrderModel.create(orderPayload);
  const exist = await OrderModel.findOne({ userId: user._id });

  if (exist) {
    const order = await OrderModel.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          planId: orderPayload.planId,
          subsId: orderPayload.subsId,
          amount: orderPayload.amount,
          transactionId: orderPayload.transactionId,
          paymentMethod: orderPayload.paymentMethod,
          paymentStatus: orderPayload.paymentStatus,
        },
      },
      { new: true }
    );
    return serviceResponse(true, HTTP_CODES.OK, MESSAGES.UPGRADED, order);
  } else {
    const notExistorder = await OrderModel.create(orderPayload);
    return serviceResponse(
      true,
      HTTP_CODES.OK,
      MESSAGES.UPGRADED,
      notExistorder
    );
  }
};

exports.useTrialPlan = async (id) => {
  const findQuery = { purchasedBy: id, isDeleted: null };
  const response = await MySubscriptionModel.findOne(findQuery)
  .populate({path:"subId",model:SubscriptionsModel});

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  if (!response.isPlatinumTrial) {
    return serviceResponse(false, HTTP_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST);
  }

  if (response.subId.name === CONSTANTS.PLAN_NAMES.PLATINUM) {
    return serviceResponse(
      false,
      HTTP_CODES.BAD_REQUEST,
      MESSAGES.EXISTED_PLATUNUM_USER
    );
  }

  const upgradePlan = await SubscriptionsModel.findOne({
    name: CONSTANTS.PLAN_NAMES.PLATINUM,
    isDeleted: null,
  }).select("name monthlyPrice annuallyPrice");

  if (!upgradePlan) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  const payload = this.useTrialPlanChooses(upgradePlan._id);
  payload.holdSubId = response.subId._id;

  await MySubscriptionModel.findOneAndUpdate(findQuery, payload, { new: true });

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.UPGRADED);
};

exports.useTrialPlanChooses = (planId) => {
  let payload = {};
  payload.planDurationType = "monthly";
  payload.startTrial = new Date();
  payload.endTrial = getExiredPlanDateAndTime(
    payload.planDurationType,
    payload.startTrial
  ).expiredOnDate;

  payload.subId = planId;

  payload.paymentDetails = {
    method: "UPI",
    transactionId: "HDFC0099002",
    metadata: "metadata",
  };

  return payload;
};

exports.upgradeSubscriptionPlans = async (id, payload) => {
  payload.planDurationType = "annually";
  if (payload.name === CONSTANTS.PLAN_NAMES.TRIAL) {
    return serviceResponse(
      false,
      HTTP_CODES.BAD_REQUEST,
      `Your ${payload.name} period has been expired`
    );
  }

  const user = await User.findOne({ _id: id, isDeleted: null });
  if (!user)
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);

  const response = await MySubscriptionModel.findOne({
    purchasedBy: user._id,
  }).populate({path:"subId",model:SubscriptionsModel});

  if (!response)
    return serviceResponse(
      false,
      HTTP_CODES.NOT_FOUND,
      "Subscription Does not exist"
    );

  if (
    response.subId.name === payload.name &&
    response.planDurationType === payload.planDurationType
  )
    return serviceResponse(
      false,
      HTTP_CODES.BAD_REQUEST,
      `You have already ${payload.planDurationType} plan`
    );

  const upgradePlan = await SubscriptionsModel.findOne({
    name: payload.name,
    isDeleted: null,
  }).select("name monthlyPrice annuallyPrice");
  if (!upgradePlan)
    return serviceResponse(
      false,
      HTTP_CODES.NOT_FOUND,
      `${payload.name} Not Found!!!`
    );

  let update = {
    subId: upgradePlan._id,
    planDurationType: payload.planDurationType,
    purchasedDate: new Date(),
  };

  update.expiredOnDate = getExiredPlanDateAndTime(
    payload.planDurationType,
    update.purchasedDate
  ).expiredOnDate;

  update.paymentDetails = payload.paymentDetails;

  const updateMySub = await MySubscriptionModel.findOneAndUpdate(
    { _id: response._id, isDeleted: null },
    { $set: update },
    { new: true }
  );

  if (!updateMySub)
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);

  let orderPayload = {
    type: "subscription",
    userId: user._id,
    planId: response._id,
    subsId: upgradePlan._id,
    amount:
      payload.planDurationType === "monthly"
        ? upgradePlan.monthlyPrice
        : upgradePlan.annuallyPrice,
    transactionId: payload.paymentDetails.transactionId,
    paymentMethod: payload.paymentDetails.method,
    paymentStatus: "paid",
  };

  // const order = await OrderModel.create(orderPayload);
  const exist = await OrderModel.findOne({ userId: user._id });
  if (exist) {
    const order = await OrderModel.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          planId: orderPayload.planId,
          subsId: orderPayload.subsId,
          amount: orderPayload.amount,
          transactionId: orderPayload.transactionId,
          paymentMethod: orderPayload.paymentMethod,
          paymentStatus: orderPayload.paymentStatus,
        },
      },
      { new: true }
    );
    return serviceResponse(true, HTTP_CODES.OK, MESSAGES.UPGRADED);
  } else {
    const notExistorder = await OrderModel.create(orderPayload);
    return serviceResponse(
      true,
      HTTP_CODES.OK,
      MESSAGES.UPGRADED,
      notExistorder
    );
  }
};

exports.updatePlanByEmailSubscriptionPlan = async (payload) => {
  const user = await User.findOne({
    email: payload.email,
    isDeleted: null,
  }).select("email");

  if (!user) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  if (payload.name === CONSTANTS.PLAN_NAMES.TRIAL) {
    return serviceResponse(
      false,
      HTTP_CODES.BAD_REQUEST,
      `Your ${payload.name} period has been expired`
    );
  }
  const response = await MySubscriptionModel.findOne({
    purchasedBy: user._id,
  }).populate({path:"subId",model:SubscriptionsModel});

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  if (
    response.subId.name === payload.name &&
    response.planDurationType === payload.planDurationType
  )
    return serviceResponse(
      false,
      HTTP_CODES.BAD_REQUEST,
      `You have already ${payload.planDurationType} plan`
    );

  const upgradePlan = await SubscriptionsModel.findOne({
    name: payload.name,
    isDeleted: null,
  }).select("name monthlyPrice annuallyPrice");
  if (!upgradePlan)
    return serviceResponse(
      false,
      HTTP_CODES.NOT_FOUND,
      `${payload.name} Not Found!!!`
    );

  let update = {
    subId: upgradePlan._id,
    planDurationType: payload.planDurationType,
    purchasedDate: new Date(),
  };

  update.expiredOnDate = getExiredPlanDateAndTime(
    payload.planDurationType,
    update.purchasedDate
  ).expiredOnDate;

  update.paymentDetails = payload.paymentDetails;

  const updateMySub = await MySubscriptionModel.findOneAndUpdate(
    { _id: response._id, isDeleted: null },
    { $set: update },
    { new: true }
  );

  if (!updateMySub)
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);

  let orderPayload = {
    type: "subscription",
    userId: user._id,
    planId: response._id,
    subsId: upgradePlan._id,
    amount:
      payload.planDurationType === "monthly"
        ? upgradePlan.monthlyPrice
        : upgradePlan.annuallyPrice,
    transactionId: payload.paymentDetails.transactionId,
    paymentMethod: payload.paymentDetails.method,
    paymentStatus: "paid",
  };

  const order = await OrderModel.create(orderPayload);

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.UPGRADED, order);
};

exports.loginPlanChooses = async (planId, payload) => {
  payload.purchasedDate = new Date();
  payload.expiredOnDate = getExiredPlanDateAndTime(
    payload.planDurationType,
    payload.purchasedDate
  ).expiredOnDate;

  payload.subId = planId;
  payload.holdSubId = planId;
  payload.paymentDetails = {
    method: "Upi",
    transactionId: "ssjdjdii556464464",
    metadata: "metadata",
  };
  const choosePlan = await MySubscriptionModel.create(payload);
  if (choosePlan) logger.info("Choose plas been created");
  return 0;
};

exports.mySubscriptionPlan = async (id) => {
  const response = await MySubscriptionModel.findOne({
    purchasedBy: id,
    isDeleted: null,
  }).populate({path:"subId",model:SubscriptionsModel});

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  let options = {
    renewalOptions: response.renewalOptions,
    cancellationStatus: response.cancellationStatus,
    paymentDetails: response.paymentDetails,
    planDurationType: response.planDurationType,
    purchasedDate: response.purchasedDate,
    expiredOnDate: response.expiredOnDate,
    usesCount: response.usesCount,
    isPlatinumTrial: response.isPlatinumTrial,
    isAddonPurchaseUnlimited: response.isAddonPurchaseUnlimited,
    isResetAt: response.isResetAt,
    resetAt: response.resetAt,
    startTrial: response.startTrial,
    endTrial: response.endTrial,
    actives: response.actives,
    status: response.status,
    isDeleted: response.isDeleted,
    _id: response._id,
    purchasedBy: response.purchasedBy,
    subId: response.subId,
    pause_collection: response.pause_collection,
    cancel_collection_by_admin: response.cancel_collection_by_admin,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
  };

  if (response.isAssignedUser) {
    options.subId.noOfUsers += response.plusNoOfUsers;
  }

  if (response.isAddOnUser) {
    options.subId.noOfUsers += response.noOfAddOnUsers;
  }

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.OK, options);
};
