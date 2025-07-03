const express = require("express");
const dashboardController = require("./dashboard.controller");
const { CONSTANTS } = require("../../../config");
const { validateAccessToken } = require("../../../middlewares/authorisation");
const { validationMiddleware } = require("../../../middlewares");
const { quizAndPollSchema } = require("./dashboard.validation");
const { analyticsRoutes } = require("../../analytics");

const router = express.Router();

router.get(
  "/nofications",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.getNotifications
);

router.patch(
  "/nofications/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.updateNotification
);

router.delete(
  "/nofications/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.deleteNotification
);

router.get(
  "/myActivitiesQuizAndPoll",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.myActivities
);

router.get(
  "/quizpoll/:id/moderator",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.quizAndPollModeratorList
);

router.post(
  "/addToFav/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.addToFav
);

router.post(
  "/AddToDeActivated/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.addToDeActivated
);

router.post(
  "/copyProduct",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.copyProduct
);

// moderator list
router.get(
  "/moderators",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.getModerators
);

router.get(
  "/moderatorsDeactivationLog",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.getModeratorsDeactivationLog
);

router.patch(
  "/moderators/:id/deactivate",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.deactivateModeratorAccount
);

router.delete(
  "/moderators/:id/delete",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.deleteModerators
);

router.get(
  "/moderators/:id/report",
  // validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.downloarReportModerators
);

router.get(
  "/admin/:id/report",
  // validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.downloarReportModerators
);

router.get(
  "/moderators/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.getModeratorView
);

router.patch(
  "/moderators/:id/assignedUsers",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  validationMiddleware(quizAndPollSchema.allowUsers),
  dashboardController.assignedPlayerToModerator
);

router.patch(
  "/moderators/:id/unablePlatinumTrial",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.unablePlatinumTrial
);

router.patch(
  "/moderators/:id/enableUnlimitedUser",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.enableUnlimitedUser
);

router.patch(
  "/moderators/:id/disablePlatinumTrial",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.disablePlatinumTrial
);

router.patch(
  "/moderators/:id/paused",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.pauseModeratorSubsciption
);

router.patch(
  "/moderators/:id/resumed",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.resumedModeratorSubsciption
);

router.get(
  "/moderators/:id/get",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.getModeratorSubsciption
);

router.patch(
  "/moderators/:id/cancel",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.cancelModeratorSubsciption
);

router.patch(
  "/moderators/:id/allowToPurchaseSubs",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.cancelModeratorAllowToPurchaseSubs
);

router.get(
  "/moderators/:id/invoices",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.invoicesModeratorAllPurchaseSubs
);

router.get(
  "/purchaseHistory/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.purchaseHistory
);

router.patch(
  "/profile/update/:userId/priority",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.updateProfilePriority
);

router.post(
  "/deActivated/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.deActivated
);

router.post(
  "/endQuizAndPoll/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.endQuizAndPoll
);

router.post(
  "/pendingToActiveQuizAndPoll/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  validationMiddleware(quizAndPollSchema.activated),
  dashboardController.pendingToActiveQuizAndPoll
);

router.post(
  "/startActiveQuizAndPoll/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  validationMiddleware(quizAndPollSchema.activated),
  dashboardController.startActiveQuizAndPoll
);

router.post(
  "/startClosedDeActivateToActivateQuizAndPoll/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  validationMiddleware(quizAndPollSchema.activated),
  dashboardController.startClosedDeActivateToActivateQuizAndPoll
);

router.post(
  "/activated/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  validationMiddleware(quizAndPollSchema.activated),
  dashboardController.activated
);

router.post(
  "/emiminate/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.playerEliminates
);

router.use(
  "/analytics",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  analyticsRoutes
);

router.put(
  "/unPublish/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.unPublish
);

router.put(
  "/unPublishManual/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.unPublishManual
);

router.post(
  "/update",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.update
);

router.post(
  "/updatePrices/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.updatePrices
);

router.post(
  "/vrAdmin/passwordReset",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  validationMiddleware(quizAndPollSchema.updateVRPASS),
  dashboardController.passwordReset
);

router.get(
  "/vr/getPassword",
  // validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.getPassword
);

module.exports = router;
