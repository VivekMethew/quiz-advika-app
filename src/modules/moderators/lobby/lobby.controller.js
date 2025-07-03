const { responseHelper } = require("../../../helpers");
const lobbyService = require("./lobby.service");

exports.invitesPlayers = async (req, res, next) => {
  try {
    const { body, params } = req;
    const response = await lobbyService.invitesPlayers(params.code, body);
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }
    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.listParticipants = async (req, res, next) => {
  try {
    const { params, query } = req;
    const response = await lobbyService.listParticipants(params.code, query);
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }
    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.scoreboard = async (req, res, next) => {
  try {
    const { params } = req;
    const response = await lobbyService.scoreboard(params.code);
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }
    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};
