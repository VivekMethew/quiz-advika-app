const express = require("express");
const { categoryRoutes } = require("../category/index");
const quizPollController = require("./quiz.controller");
const { CONSTANTS } = require("../../config");
const { validateAccessToken } = require("../../middlewares/authorisation");
const { validationMiddleware } = require("../../middlewares");
const { quizAndPollSchema } = require("./quiz.validation");
const { marketplaceRoutes } = require("../marketplaces");

const router = express.Router();

router.post(
  "/add",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  validationMiddleware(quizAndPollSchema.createQuilPoll),
  quizPollController.addQuizPoll
);

router.get(
  "/list",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  quizPollController.getList
);

router.get(
  "/list/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  quizPollController.getSingleRecord
);

router.patch(
  "/list/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  validationMiddleware(quizAndPollSchema.updateQuilPoll),
  quizPollController.updateSingleRecord
);

router.patch(
  "/permission/:id/update",
  validateAccessToken([
    CONSTANTS.USER.ROLES.MODERATOR,
    CONSTANTS.USER.ROLES.ADMIN,
  ]),
  validationMiddleware(quizAndPollSchema.updatePermission),
  quizPollController.updatePermission
);

router.patch(
  "/order/updates",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  validationMiddleware(quizAndPollSchema.ordering),
  quizPollController.updateOrdering
);

router.patch(
  "/activated/bulk",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  validationMiddleware(quizAndPollSchema.bulkDelete),
  quizPollController.bulkQuizPollActivated
);

router.patch(
  "/deActivated/bulk",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  validationMiddleware(quizAndPollSchema.bulkDelete),
  quizPollController.bulkQuizPollDeActivated
);

router.patch(
  "/delete/bulk",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  validationMiddleware(quizAndPollSchema.bulkDelete),
  quizPollController.bulkQuizPollDelete
);

router.patch(
  "/Activated/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  quizPollController.quizAndPollActived
);

router.delete(
  "/list/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  quizPollController.deleteSingleRecord
);

router.post(
  "/ratings/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  validationMiddleware(quizAndPollSchema.ratings),
  quizPollController.createRatings
);

router.patch(
  "/ratings/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  validationMiddleware(quizAndPollSchema.ratings),
  quizPollController.updateRatings
);

router.delete(
  "/ratings/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  quizPollController.deleteRatings
);

router.use("/category", categoryRoutes);
router.use("/marketplace", marketplaceRoutes);

module.exports = router;
