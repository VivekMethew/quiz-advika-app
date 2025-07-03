const logger = require("./logger");
const { s3 } = require("../config/s3.instance");

const mimeToExtension = {
  // Images
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/bmp": ".bmp",
  "image/tiff": ".tiff",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
  "image/heic": ".heic", // HEIC (High Efficiency Image Format)
  "image/heif": ".heif", // HEIF (High Efficiency Image Format)

  // Videos
  "video/mp4": ".mp4",
  "video/x-msvideo": ".avi", // AVI
  "video/quicktime": ".mov", // MOV (Apple QuickTime)
  "video/x-ms-wmv": ".wmv", // WMV (Windows Media Video)
  "video/webm": ".webm",
  "video/mpeg": ".mpeg", // MPEG
  "video/ogg": ".ogv", // OGG video
  "video/3gpp": ".3gp", // 3GPP multimedia file
  "video/x-flv": ".flv", // Flash video
  "video/hevc": ".hevc", // HEVC (High Efficiency Video Coding)
  "video/x-m4v": ".m4v", // M4V (Apple iTunes video format)

  // Documents
  "application/pdf": ".pdf",
  "application/msword": ".doc", // Microsoft Word (legacy format)
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx", // Microsoft Word (new format)
  "text/plain": ".txt", // Plain text
};

// Example function to get the extension from a MIME type
function getExtension(mimeType) {
  return mimeToExtension[mimeType] || ".jpeg";
}

// Example usage
const mimeType = "video/mp4";
console.log(getExtension(mimeType)); // Output: .mp4

exports.putObject = async (file) => {
  try {
    const fileExtention = getExtension(file.mimetype);

    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: `${process.env.FOLDER_NAME}/eskoops__${Date.now()}_file${fileExtention}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    return await s3.upload(params).promise();
  } catch (error) {
    logger.error(error);
    return null;
  }
};
