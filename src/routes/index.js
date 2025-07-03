const express = require("express");
const { moderatorRoutes } = require("../modules/moderators/users");
const { quizRoutes } = require("../modules/quizs");
const { questionRoutes } = require("../modules/questions");
const { adminRoutes } = require("../modules/admin/users");
// const { playersRoutes } = require("../modules/players");
const { analyticsRoutes } = require("../modules/analytics");
const { paymentHook } = require("../utils/stripe.utils");
const { streamRoutes } = require("../modules/streams");

const router = express.Router();

router.use("/moderators", moderatorRoutes);
router.use("/quizpoll", quizRoutes);
router.use("/questions", questionRoutes);
router.use("/admin", adminRoutes);
// router.use("/players", playersRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/streams", streamRoutes);

router.post(
  "/paymentHook",
  express.raw({ type: "application/json" }),
  paymentHook
);

module.exports = router;
