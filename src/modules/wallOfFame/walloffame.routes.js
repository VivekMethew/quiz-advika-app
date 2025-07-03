const express = require("express");
const CONSTOLLER = require("./walloffame.controller");
const { validateAccessToken } = require("../../middlewares/authorisation");
const { CONSTANTS } = require("../../config");
const router = express.Router();

router.get(
  "/list/:eventId",
  validateAccessToken([
    CONSTANTS.USER.ROLES.PLAYER,
    CONSTANTS.USER.ROLES.MODERATOR,
    CONSTANTS.USER.ROLES.ADMIN,
  ]),
  CONSTOLLER.LIST
);

router.get(
  "/view/:id",
  validateAccessToken([
    CONSTANTS.USER.ROLES.PLAYER,
    CONSTANTS.USER.ROLES.MODERATOR,
    CONSTANTS.USER.ROLES.ADMIN,
  ]),
  CONSTOLLER.VIEW
);

router.delete(
  "/delete/:id",
  validateAccessToken([
    CONSTANTS.USER.ROLES.MODERATOR,
    CONSTANTS.USER.ROLES.ADMIN,
  ]),
  CONSTOLLER.DELETE
);

module.exports = router;
