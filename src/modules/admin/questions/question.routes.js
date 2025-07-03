const express = require("express");
const questionController = require("./question.controller");
const { CONSTANTS } = require("../../../config");
const { validateAccessToken } = require("../../../middlewares/authorisation");
const { validationMiddleware } = require("../../../middlewares");
const { questionSchema } = require("./question.validation");

const router = express.Router();

router.post(
  "/add",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  validationMiddleware(questionSchema.question),
  questionController.createRecord
);

router.get(
  "/list",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  questionController.getList
);

router.get(
  "/view/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  questionController.getView
);

router.patch(
  "/update/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  validationMiddleware(questionSchema.update),
  questionController.updateRecord
);

router.post(
  "/update/bulk",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  validationMiddleware(questionSchema.bulkUpdate),
  questionController.updateBulk
);

router.post(
  "/update/chatGPT",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  validationMiddleware(questionSchema.chatGPT),
  questionController.updateChatGPT
);

router.delete(
  "/delete/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  questionController.deleteRecord
);

router.post(
  "/delete/bulk",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  questionController.deleteBulk
);

module.exports = router;
