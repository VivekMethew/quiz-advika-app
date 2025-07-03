const { responseHelper } = require("../../helpers");
const questionService = require("./marketplace.service");

exports.getList = async (req, res, next) => {
  try {
    const { query } = req;
    const response = await questionService.getList(query);
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

exports.getTestList = async (req, res, next) => {
  try {
    const { query } = req;
    const response = await questionService.getTestList(query);
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

exports.getWebsiteList = async (req, res, next) => {
  try {
    const { query } = req;
    const response = await questionService.getWebsiteList(query);
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

exports.getPreview = async (req, res, next) => {
  try {
    const { params } = req;
    const response = await questionService.getPreview(params.id);
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

exports.getByQuizCode = async (req, res, next) => {
  try {
    const { params } = req;
    const response = await questionService.getByQuizCode(params.code);
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

exports.getAdminList = async (req, res, next) => {
  try {
    const { query } = req;
    const response = await questionService.getAdminList(query);
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
