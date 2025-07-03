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

exports.customFileUpload = (req, filePath) => {
  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(filePath);
    // With the open - event, data will start being written
    // from the request to the stream's destination path
    stream.on("open", () => {
      console.log("Stream open ...  0.00%");
      req.pipe(stream);
    });

    // Drain is fired whenever a data chunk is written.
    // When that happens, print how much data has been written yet.
    stream.on("drain", () => {
      const written = parseInt(stream.bytesWritten);
      const total = parseInt(req.headers["content-length"]);
      const pWritten = ((written / total) * 100).toFixed(2);
      console.log(`Processing  ...  ${pWritten}% done`);
    });

    // When the stream is finished, print a final message
    // Also, resolve the location of the file to calling function
    stream.on("close", () => {
      console.log("Processing  ...  100%");
      resolve(filePath);
    });
    // If something goes wrong, reject the primise
    stream.on("error", (err) => {
      console.error(err);
      reject(err);
    });
  });
};
