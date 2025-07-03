const express = require("express");
const quizSubmissionController = require("./quiz.submission.controller");
const { CONSTANTS } = require("../../../config");
const { validateAccessToken } = require("../../../middlewares/authorisation");
const { validationMiddleware } = require("../../../middlewares");
const { quizSubmissionSchema } = require("./quiz.submission.validation");

const router = express.Router();

router.post(
  "/quizsubmit/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  quizSubmissionController.addQuizSubmition
);

router.get(
  "/submissions",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  quizSubmissionController.getSubmissions
);

router.get(
  "/submissions/:userId/moderator",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  quizSubmissionController.getMySubmissions
);

router.get(
  "/submissions/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  quizSubmissionController.getQuizPollDetail
);

router.post(
  "/replySubmission/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  validationMiddleware(quizSubmissionSchema.reply),
  quizSubmissionController.replySubmissions
);

router.patch(
  "/replySubmission/:id/update",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  validationMiddleware(quizSubmissionSchema.replyUpdate),
  quizSubmissionController.replySubmissionsUpdate
);

module.exports = router;
