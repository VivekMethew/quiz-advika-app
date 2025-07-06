const express = require("express");
const { categoryRoutes } = require("../../category/index");
const quizPollController = require("./quiz.controller");
const { CONSTANTS } = require("../../../config");
const { validateAccessToken } = require("../../../middlewares/authorisation");
const { validationMiddleware } = require("../../../middlewares");
const { quizAndPollSchema } = require("./quiz.validation");
const { questionRoutes } = require("../questions");
const { uploadBuilkUpload } = require("../../../middlewares/bulk.files");

const router = express.Router();

router.post(
  "/add",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  validationMiddleware(quizAndPollSchema.createQuilPoll),
  quizPollController.addQuizPoll
);

router.post(
  "/upload/bulk",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  uploadBuilkUpload.single("bulkFile"),
  quizPollController.bulkUpload
);

router.get("/download/sample", quizPollController.downloadSample);

router.get(
  "/list",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  quizPollController.getList
);

router.get(
  "/list/week",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  quizPollController.yourPastWeek
);

router.get(
  "/list/archives",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  quizPollController.getListArchives
);

router.post(
  "/list/:id/archives",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  quizPollController.addArchivesRecord
);

router.get(
  "/list/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  quizPollController.getSingleRecord
);

router.patch(
  "/list/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  validationMiddleware(quizAndPollSchema.updateQuilPoll),
  quizPollController.updateSingleRecord
);

router.patch(
  "/order/updates",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  validationMiddleware(quizAndPollSchema.ordering),
  quizPollController.updateOrdering
);

router.delete(
  "/list/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  quizPollController.deleteSingleRecord
);

router.patch(
  "/activated/bulk",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  validationMiddleware(quizAndPollSchema.bulkDelete),
  quizPollController.bulkQuizPollActivated
);

router.patch(
  "/deActivated/bulk",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  validationMiddleware(quizAndPollSchema.bulkDelete),
  quizPollController.bulkQuizPollDeActivated
);

router.patch(
  "/delete/bulk",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  validationMiddleware(quizAndPollSchema.bulkDelete),
  quizPollController.bulkQuizPollDelete
);

router.post(
  "/ratings/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  validationMiddleware(quizAndPollSchema.ratings),
  quizPollController.createRatings
);

router.patch(
  "/ratings/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  validationMiddleware(quizAndPollSchema.ratings),
  quizPollController.updateRatings
);

router.delete(
  "/ratings/:id",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  quizPollController.deleteRatings
);

router.use("/category", categoryRoutes);
router.use("/questions", questionRoutes);

module.exports = router;
