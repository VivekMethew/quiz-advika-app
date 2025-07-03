const { HTTP_CODES, MESSAGES } = require("../../config");
const { BadRequestException } = require("../../helpers/errorResponse");
const { serviceResponse } = require("../../helpers/response");
const { FileModel } = require("../../models/files.model");
const { putObject } = require("../../utils/bucket");

exports.uploadBucketNew = async (user, file) => {
  const obj = await putObject(file);
  if (!obj) throw new BadRequestException(MESSAGES.BAD_REQUEST);
  const options = {};
  options.userId = user.id;
  options.fileName = obj.Key.split("/")[1];
  options.dirName = obj.Key.split("/")[0];
  options.fileSize = file.size;
  options.mimetype = file.mimetype;
  options.bucket = obj.Bucket;
  options.url = obj.Location;
  const response = await FileModel.create(options);
  if (!response) throw new BadRequestException(MESSAGES.BAD_REQUEST);
  return serviceResponse(true, HTTP_CODES.CREATED, MESSAGES.UPLOADED, {
    id: response._id,
    url: obj.Location,
  });
};

exports.uploadBucket = async (payload) => {
  const response = await FileModel.create(payload);
  return serviceResponse(true, HTTP_CODES.CREATED, MESSAGES.UPLOADED, {
    url: response._id,
  });
};
