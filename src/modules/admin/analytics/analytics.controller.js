const { responseHelper } = require("../../../helpers");
const analyticsService = require("./analytics.service");

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
