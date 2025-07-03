const express = require("express");
const analyticsController = require("./analytics.controller");
const router = express.Router();

router.get("/quizReport/:id", analyticsController.getQuizReport);

module.exports = router;
