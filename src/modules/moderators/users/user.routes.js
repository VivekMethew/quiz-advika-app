const express = require("express");
const { userSchema } = require("./user.validation");
const moderatorController = require("./user.controller");
const { validationMiddleware } = require("../../../middlewares");
const { googleAuth, facebookAuth } = require("../../auth");
const { CONSTANTS } = require("../../../config");
const {
  validateAccessToken,
  validateRefreshToken,
} = require("../../../middlewares/authorisation");
const { dashboardRoutes } = require("../dashboard");
const { choosePlanRoutes } = require("../subscriptionPlans");
const { filesRoutes } = require("../../files");
const { paymentRoutes } = require("../../payments");
const { analyticsRoutes } = require("../../analytics");
const { ordersRoutes } = require("../../orders");
const { lobbyRoutes } = require("../lobby");

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
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  moderatorController.getProfile
);

router.patch(
  "/profile/update",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  validationMiddleware(userSchema.update),
  moderatorController.updateProfile
);

router.patch(
  "/profile/update/priority",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  moderatorController.updateProfilePriority
);

router.post(
  "/profile/changePassword",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  validationMiddleware(userSchema.changePassword),
  moderatorController.changePassword
);

// router.get(
//   "/login/success",
//   // isAuthenticated,
//   moderatorController.googleAuthLogin
// );

// googleAuth(router);
// facebookAuth(router);

// router.get("/login/failed", moderatorController.loginFailed);

router.get(
  "/logout",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
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
  validateRefreshToken(CONSTANTS.USER.ROLES.MODERATOR),
  moderatorController.getToken
);

// dashboard APIS
router.use("/dashboard", dashboardRoutes);
router.use("/lobby", lobbyRoutes);
router.use("/plans", choosePlanRoutes);
router.use(
  "/analytics",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  analyticsRoutes
);

router.use(
  "/payments",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  paymentRoutes
);

router.use(
  "/orders",
  validateAccessToken(CONSTANTS.USER.ROLES.MODERATOR),
  ordersRoutes
);

router.use(
  "/",
  validateAccessToken([
    CONSTANTS.USER.ROLES.MODERATOR,
    CONSTANTS.USER.ROLES.ADMIN,
    CONSTANTS.USER.ROLES.PLAYER,
  ]),
  filesRoutes
);

module.exports = router;
