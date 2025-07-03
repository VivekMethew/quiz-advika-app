const express = require("express");
const router = express.Router();
const choosePlanController = require("./choose.plans.controller");
const subscriptionController = require("../../../modules/admin/subscriptions/subscription.controller");
const { validateAccessToken } = require("../../../middlewares/authorisation");
const { validationMiddleware } = require("../../../middlewares");
const { SCHEMA } = require("./choose.plans.validation");
const { CONSTANTS } = require("../../../config");

router.post(
  "/upgradePlans",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  choosePlanController.chooseSubscriptionPlan
);

router.post(
  "/useTrialPlan",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  choosePlanController.useTrialPlan
);

router.post(
  "/upgradePlans/admin",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  choosePlanController.chooseSubscriptionPlan
);

router.patch(
  "/upgradePlans/:id/moderator",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  validationMiddleware(SCHEMA.upgradePlan),
  choosePlanController.upgradeSubscriptionPlans
);

router.get(
  "/myPlan",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  choosePlanController.mySubscriptionPlan
);

router.get(
  "/list",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  subscriptionController.getSubscriptionsByModerator
);

module.exports = router;
