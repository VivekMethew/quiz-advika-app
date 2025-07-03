const { responseHelper } = require("../../../helpers");
const SERVICES = require("./service");

exports.ADD = async (req, res, next) => {
  try {
    const { body } = req;
    const response = await SERVICES.ADD(body);
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

exports.LIST = async (req, res, next) => {
  try {
    const { query } = req;
    const response = await SERVICES.LIST(query);
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
