const { responseHelper } = require("../../helpers");
const analyticsService = require("./analytics.service");

exports.getSummary = async (req, res, next) => {
  try {
    const { user, params } = req;
    const response = await analyticsService.getSummary(params.id, user);
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

exports.getPlayersInfo = async (req, res, next) => {
  try {
    const { params, query } = req;
    const response = await analyticsService.getPlayersInfo(params.id, query);
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

exports.getPlayerReports = async (req, res, next) => {
  try {
    const { params, query } = req;
    const response = await analyticsService.getPlayerReports(params.id, query);
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

exports.getQuizReport = async (req, res, next) => {
  try {
    const { params, query } = req;
    const response = await analyticsService.getQuizReport(params.id, query);
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
