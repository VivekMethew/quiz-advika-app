const { responseHelper } = require("../../helpers");
const { Base64Info } = require("../../utils");
const filesService = require("./files.service");

exports.uploadBucket = async (req, res, next) => {
  try {
    const { body } = req;
    if (body.base64) {
      let data = Base64Info(body.base64);
      data.file = body.base64;
      const options = {};
      options.fileName = data.filename;
      options.dirName = "eskoops";
      options.fileSize = data.size;
      options.mimetype = data.mimeType;
      options.bucket = "eskoops";
      options.url = data.file;
      options.userId = req.user.id;

      const response = await filesService.uploadBucket(options);
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
    }
  } catch (error) {
    next(error);
  }
};

exports.uploadBucketNew = async (req, res, next) => {
  try {
    const { file, user } = req;
    const response = await filesService.uploadBucketNew(user, file);
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
