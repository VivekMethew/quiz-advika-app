const express = require("express");
const questionController = require("./marketplace.controller");
const router = express.Router();

router.get("/list", questionController.getTestList);

router.get("/list/websites", questionController.getWebsiteList);

router.get("/list/test", questionController.getTestList);
router.get("/admin/list", questionController.getTestList);
router.get("/view/:id", questionController.getPreview);
router.get("/quizView/:code", questionController.getByQuizCode);

module.exports = router;
