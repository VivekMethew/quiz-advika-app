const multer = require("multer");
const { logger } = require("../utils");
const { MESSAGES } = require("../config");
const { BadRequestException } = require("../helpers/errorResponse");

const allowedFileFormats = [
  // Images
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/bmp",
  "image/tiff",
  "image/webp",
  "image/svg+xml",
  "image/heic", // Mac & iOS HEIC
  "image/heif", // Mac & iOS HEIF

  // Videos
  "video/mp4",
  "video/x-msvideo", // AVI
  "video/quicktime", // MOV
  "video/x-ms-wmv", // WMV
  "video/webm",
  "video/mpeg",
  "video/ogg",
  "video/3gpp",
  "video/x-flv",
  "video/hevc", // HEVC for Apple devices
  "video/x-m4v", // M4V for Mac

  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
];

const fileFilter = (req, file, cb) => {
  logger.info(`file.mimetype ${file.mimetype}`);
  allowedFileFormats.includes(file.mimetype)
    ? cb(null, true)
    : cb(new BadRequestException(MESSAGES.INVALID_FILE_FORMAT), false);
};

module.exports = {
  uploadFile: multer({ storage: multer.memoryStorage(), fileFilter }).single(
    "file"
  ),
};
