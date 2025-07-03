const { CONSTANTS, URLS } = require("../../../config");
const { responseHelper } = require("../../../helpers");
const { serviceResponse } = require("../../../helpers/response");
const { upload } = require("../../../middlewares/upload.files");
const userService = require("./user.service");

exports.register = async (req, res, next) => {
  try {
    const { body } = req;
    body.role = CONSTANTS.USER.ROLES.MODERATOR;
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

exports.googleAuthLogin = async (req, res, next) => {
  try {
    const { user } = req;

    user.type = user?.provider;
    const response = await userService.authLogin(user);
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
    console.log(error);
    next(error);
  }
};

exports.facebookAuthLogin = async (req, res, next) => {
  try {
    const { user } = req;
    user.type = "facebook";
    const response = await userService.authLogin(user);
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
    console.log(error);
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

exports.updateProfile = async (req, res, next) => {
  try {
    let { body, user } = req;

    if (user.LoginType && user.LoginType !== "facebook") {
      body?.email && delete body?.email;
    }

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

exports.updateProfilePriority = async (req, res, next) => {
  try {
    let { user } = req;
    const response = await userService.updateProfilePriority(user);
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

exports.loginFailed = async (req, res, next) => {
  try {
    const response = await userService.loginFailed();
    if (!response.success) {
      return res.redirect(`${URLS.FRONTEND}/login`);
    }
    res.redirect(`${URLS.FRONTEND}/login`);
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

exports.uploadBucket = async (req, res, next) => {
  try {
    upload(req, res, async function (error) {
      if (error) {
        return serviceResponse(false, HTTP_CODES.BAD_REQUEST, error.message);
      }
      const options = {};
      options.fileName = req.file.key.split("/")[1];
      options.dirName = req.file.key.split("/")[0];
      options.fileSize = req.file.size;
      options.mimetype = req.file.mimetype;
      options.bucket = req.file.bucket;
      options.url = req.file.location;
      options.userId = req.user.id;
      const response = await userService.uploadBucket(options);
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
    });
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
