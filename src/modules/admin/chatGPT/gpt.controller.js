const { responseHelper } = require("../../../helpers");
const questionService = require("./gpt.service");

exports.createRecord = async (req, res, next) => {
  try {
    const { body, user } = req;
    body.userId = user.id;
    const response = await questionService.createRecord(body);
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
exports.createPoll = async (req, res, next) => {
  try {
    const { body, user } = req;
    body.userId = user.id;
    const response = await questionService.createPoll(body);
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
