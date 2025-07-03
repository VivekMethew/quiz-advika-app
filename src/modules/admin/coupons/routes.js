const express = require("express");
const { SCHEMA } = require("./validation");
const CONTROLLER = require("./controller");
const { validationMiddleware } = require("../../../middlewares");
const { CONSTANTS } = require("../../../config");
const { validateAccessToken } = require("../../../middlewares/authorisation");

const router = express.Router();

router.post(
  "/add",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  validationMiddleware(SCHEMA.ADD),
  CONTROLLER.ADD
);

router.get(
  "/list",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  CONTROLLER.LIST
);

module.exports = router;
