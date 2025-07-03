const { CONSTANTS } = require("../../config");
const { responseHelper } = require("../../helpers");
const SERVICES = require("./walloffame.service");

exports.LIST = async (req, res, next) => {
  try {
    const { query, params } = req;
    const response = await SERVICES.LIST(params.eventId, query);
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

exports.VIEW = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user, query } = req;
    const response = await SERVICES.VIEW(id, user.id, query);
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

exports.DELETE = async (req, res, next) => {
  try {
    const { user, params } = req;
    const response = await SERVICES.DELETE(params.id, user.id);
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
