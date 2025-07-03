const express = require("express");
const { subscriptionSchema } = require("./subscription.validation");
const subscriptionController = require("./subscription.controller");
const { validationMiddleware } = require("../../../middlewares");
const { CONSTANTS } = require("../../../config");
const { validateAccessToken } = require("../../../middlewares/authorisation");

const router = express.Router();

router.post(
  "/add",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  validationMiddleware(subscriptionSchema.add),
  subscriptionController.AddSubscriptions
);

router.post(
  "/test/update/:id/gold",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  subscriptionController.updateGoldPlanSubscriptions
);

router.get(
  "/list",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  subscriptionController.getSubscriptions
);

router.get("/list/public", subscriptionController.getSubscriptions);

router.get(
  "/view/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  subscriptionController.viewSubscriptions
);

router.patch(
  "/update/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  validationMiddleware(subscriptionSchema.update),
  subscriptionController.updateSubscriptions
);

router.post(
  "/addProductOnStripe/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  subscriptionController.addProductOnStripe
);

router.patch(
  "/updateProductOnStripe/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  subscriptionController.deleteProductOnStripe
);

router.delete(
  "/delete/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  subscriptionController.deleteSubscriptions
);

router.get(
  "/subsAnalytics",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  subscriptionController.subsAnalytics
);

router.get(
  "/subsAnalytics/exc/download",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  subscriptionController.subsDownloadExcelAnalytics
);

router.get(
  "/test",
  // validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  subscriptionController.test
);
router.delete(
  "/deleteOrder/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  subscriptionController.deleteOrder
);

module.exports = router;
