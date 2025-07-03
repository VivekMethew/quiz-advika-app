const { CONSTANTS } = require("../../../config");
const { responseHelper } = require("../../../helpers");
const userService = require("./user.service");

exports.register = async (req, res, next) => {
  try {
    const { body } = req;
    body.role = CONSTANTS.USER.ROLES.ADMIN;
    body.email = body.email.toLowerCase();
    const response = await userService.register(body);
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

exports.login = async (req, res, next) => {
  try {
    const { body } = req;
    body.email = body.email.toLowerCase();
    const response = await userService.login(body);
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

exports.getProfile = async (req, res, next) => {
  try {
    const { user } = req;
    const response = await userService.getProfile(user.id);
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

exports.generateID = async (req, res, next) => {
  try {
    const response = await userService.generateID();
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

exports.deleteProfile = async (req, res, next) => {
  try {
    const { body } = req;
    const response = await userService.deleteProfile(body.email);
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

exports.updateProfile = async (req, res, next) => {
  try {
    let { body, user } = req;
    const response = await userService.updateProfile(user.id, body);
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

exports.changePassword = async (req, res, next) => {
  try {
    let { body, user } = req;
    const response = await userService.changePassword(user.id, body);
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

exports.forgetPassword = async (req, res, next) => {
  try {
    let { body } = req;
    const response = await userService.forgetPassword(body);
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

exports.validateOtp = async (req, res, next) => {
  try {
    const { body } = req;
    const response = await userService.validateOtp(body);
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

exports.resetPassword = async (req, res, next) => {
  try {
    const { body } = req;
    const response = await userService.resetPassword(body);
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

exports.UserLogout = async (req, res, next) => {
  try {
    const response = await userService.UserLogout();
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

exports.getToken = async (req, res, next) => {
  try {
    const { user } = req;
    const response = await userService.getToken(user.id);
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
