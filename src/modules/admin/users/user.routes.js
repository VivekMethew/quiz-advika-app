const express = require("express");
const { userSchema } = require("./user.validation");
const moderatorController = require("./user.controller");
const { validationMiddleware } = require("../../../middlewares");
const { CONSTANTS } = require("../../../config");
const {
  validateAccessToken,
  validateRefreshToken,
} = require("../../../middlewares/authorisation");
const { subscriptionRoutes } = require("../subscriptions");
const { filesRoutes } = require("../../files");
const { quizSubmissionRoutes } = require("../quiz_submission");
const { quizAdminRoutes } = require("../quiz");
const { dashboardRoutes } = require("../dashboard");
const { chatGPTRoutes } = require("../chatGPT");
const { analyticsRoutes } = require("../analytics");
const { couponRoutes } = require("../coupons");

const router = express.Router();

router.post(
  "/register",
  validationMiddleware(userSchema.register),
  moderatorController.register
);

router.post(
  "/login",
  validationMiddleware(userSchema.login),
  moderatorController.login
);

router.get(
  "/profile",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  moderatorController.getProfile
);

router.get(
  "/generateID",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  moderatorController.generateID
);

router.delete(
  "/profile/delete",
  // validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  moderatorController.deleteProfile
);

router.patch(
  "/profile/update",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  validationMiddleware(userSchema.update),
  moderatorController.updateProfile
);

router.post(
  "/profile/changePassword",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  validationMiddleware(userSchema.changePassword),
  moderatorController.changePassword
);

router.get(
  "/logout",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  moderatorController.UserLogout
);

// forget password routes
router.post(
  "/forgetPassword",
  validationMiddleware(userSchema.forgetPassword),
  moderatorController.forgetPassword
);

router.post(
  "/validateOtp",
  validationMiddleware(userSchema.validateOtp),
  moderatorController.validateOtp
);

router.post(
  "/resetPassword",
  validationMiddleware(userSchema.resetPassword),
  moderatorController.resetPassword
);

router.post(
  "/token",
  validateRefreshToken(CONSTANTS.USER.ROLES.ADMIN),
  moderatorController.getToken
);

router.use("/dashboard", dashboardRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/chatGPTs", chatGPTRoutes);
router.use("/requests", quizSubmissionRoutes);
router.use("/quiz", quizAdminRoutes);
router.use("/coupons", couponRoutes);

router.use(
  "/analytics",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  analyticsRoutes
);

router.use("/", validateAccessToken(CONSTANTS.USER.ROLES.ADMIN), filesRoutes);
module.exports = router;
