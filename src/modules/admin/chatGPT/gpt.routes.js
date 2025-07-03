const express = require("express");
const questionController = require("./gpt.controller");
const { validationMiddleware } = require("../../../middlewares");
const { topicSchema } = require("./gpt.validation");
const { validateAccessToken } = require("../../../middlewares/authorisation");
const { CONSTANTS } = require("../../../config");

const router = express.Router();

router.post(
  "/searchText/admin",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  validationMiddleware(topicSchema.search),
  questionController.createRecord
);

router.post(
  "/searchText/moderator",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  validationMiddleware(topicSchema.search),
  questionController.createRecord
);

router.post(
  "/createPoll/admin",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  validationMiddleware(topicSchema.search),
  questionController.createPoll
);
router.post(
  "/createPoll/moderator",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  validationMiddleware(topicSchema.search),
  questionController.createPoll
);

module.exports = router;
