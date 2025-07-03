const { responseHelper } = require("../../../helpers");
const subscriptionService = require("./quiz.submission.service");

exports.getSubmissions = async (req, res, next) => {
  try {
    const { query } = req;
    const response = await subscriptionService.getSubscriptions(query);
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

exports.getSubmissions = async (req, res, next) => {
  try {
    const { query } = req;
    const response = await subscriptionService.getSubscriptions(query);
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

exports.getMySubmissions = async (req, res, next) => {
  try {
    const { query, params } = req;
    const response = await subscriptionService.getMySubmissions(
      params.userId,
      query
    );
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

exports.getQuizPollDetail = async (req, res, next) => {
  try {
    const { params } = req;
    const response = await subscriptionService.getQuizPollDetail(params.id);
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

exports.replySubmissions = async (req, res, next) => {
  try {
    const { body, params } = req;
    const response = await subscriptionService.replySubmissions(
      params.id,
      body
    );
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

exports.replySubmissionsUpdate = async (req, res, next) => {
  try {
    const { body, params } = req;
    const response = await subscriptionService.replySubmissionsUpdate(
      params.id,
      body
    );
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

exports.addQuizSubmition = async (req, res, next) => {
  try {
    const { user, params } = req;
    const response = await subscriptionService.addQuizSubmition(
      params.id,
      user.id
    );
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
