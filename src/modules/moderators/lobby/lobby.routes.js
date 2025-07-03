const express = require("express");
const { CONSTANTS } = require("../../../config");
const { validateAccessToken } = require("../../../middlewares/authorisation");
const { validationMiddleware } = require("../../../middlewares");
const lobbyController = require("./lobby.controller");
const { palyersSchema } = require("./lobby.validation");
const router = express.Router();

router.get(
  "/participants/:code/list",
  validateAccessToken([
    CONSTANTS.USER.ROLES.MODERATOR,
    CONSTANTS.USER.ROLES.ADMIN,
  ]),
  lobbyController.listParticipants
);

router.get(
  "/scoreboard/:code/list",
  validateAccessToken([
    CONSTANTS.USER.ROLES.MODERATOR,
    CONSTANTS.USER.ROLES.ADMIN,
  ]),
  lobbyController.scoreboard
);

router.post(
  "/:code/invites",
  validateAccessToken([
    CONSTANTS.USER.ROLES.MODERATOR,
    CONSTANTS.USER.ROLES.ADMIN,
  ]),
  validationMiddleware(palyersSchema.invites),
  lobbyController.invitesPlayers
);

module.exports = router;
