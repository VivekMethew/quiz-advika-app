const { responseHelper } = require("../../../helpers");
const choosePlanService = require("./choose.plans.service");

exports.chooseSubscriptionPlan = async (req, res, next) => {
  try {
    const { user, body } = req;
    body.paymentDetails = {
      method: "Upi",
      transactionId: "hsc121232133",
      metadata: "metadata",
    };

    const response = await choosePlanService.chooseSubscriptionPlan(
      user.id,
      body
    );
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }
    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.useTrialPlan = async (req, res, next) => {
  try {
    const { user } = req;
    const response = await choosePlanService.useTrialPlan(user.id);
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }
    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.upgradeSubscriptionPlans = async (req, res, next) => {
  try {
    const { params, body } = req;
    body.paymentDetails = {
      method: "Upi",
      transactionId: "hsc121232133",
      metadata: "metadata",
    };

    const response = await choosePlanService.upgradeSubscriptionPlans(
      params.id,
      body
    );
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }
    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.updatePlanByEmailSubscriptionPlan = async (req, res, next) => {
  try {
    const { body } = req;
    body.paymentDetails = {
      method: "Upi",
      transactionId: "hsc121232133",
      metadata: "metadata",
    };

    const response = await choosePlanService.updatePlanByEmailSubscriptionPlan(
      body
    );
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }
    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.mySubscriptionPlan = async (req, res, next) => {
  try {
    const { user } = req;
    const response = await choosePlanService.mySubscriptionPlan(user.id);
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }
    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};
