const express = require("express");
const dashboardController = require("./dashboard.controller");
const { CONSTANTS } = require("../../../config");
const { validateAccessToken } = require("../../../middlewares/authorisation");
const { validationMiddleware } = require("../../../middlewares");
const { dashboardSchema } = require("./dashboard.validation");

const router = express.Router();

router.get(
  "/myActivitiesQuizAndPoll",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  dashboardController.myActivities
);

router.get(
  "/list",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  dashboardController.getList
);

router.get(
  "/list/week",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  dashboardController.yourPastWeek
);

router.get(
  "/nofications",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  dashboardController.getNotifications
);

router.patch(
  "/nofications/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  dashboardController.updateNotification
);

router.delete(
  "/nofications/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  dashboardController.deleteNotification
);

router.post(
  "/addToFav/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  dashboardController.addToFav
);

router.post(
  "/AddToPrice/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  validationMiddleware(),
  dashboardController.addToFav
);

router.post(
  "/quizsubmit/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  dashboardController.addQuizSubmition
);

router.post(
  "/deActivated/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  dashboardController.deActivated
);

router.post(
  "/endQuizAndPoll/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  dashboardController.endQuizAndPoll
);

router.post(
  "/pendingToActiveQuizAndPoll/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  validationMiddleware(dashboardSchema.activated),
  dashboardController.pendingToActiveQuizAndPoll
);

router.post(
  "/startActiveQuizAndPoll/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  validationMiddleware(dashboardSchema.activated),
  dashboardController.startActiveQuizAndPoll
);

router.post(
  "/startClosedDeActivateToActivateQuizAndPoll/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  validationMiddleware(dashboardSchema.activated),
  dashboardController.startClosedDeActivateToActivateQuizAndPoll
);

router.post(
  "/activated/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  validationMiddleware(dashboardSchema.activated),
  dashboardController.activated
);

router.post(
  "/emiminate/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  dashboardController.playerEliminates
);

router.put(
  "/unPublish/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  dashboardController.unPublish
);

router.patch(
  "/updated/updateQuizpollBuy",
  // validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  dashboardController.updateQuizpollBuy
);

module.exports = router;
