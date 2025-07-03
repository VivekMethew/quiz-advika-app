const express = require("express");
const analyticsController = require("./analytics.controller");
const router = express.Router();

router.get("/summary/:id", analyticsController.getSummary);
router.get("/playerInfo/:id", analyticsController.getPlayersInfo);
router.get("/playerReport/:id", analyticsController.getPlayerReports);
router.get("/quizReport/:id", analyticsController.getQuizReport);

module.exports = router;
