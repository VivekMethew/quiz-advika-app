const qrCode = require("qrcode");
const path = require("path");
const fs = require("fs");
const { s3 } = require("../config/s3.instance");
const { sharpImages } = require("./sharp.images");
const { URLS } = require("../config");
const logger = require("./logger");
const { contentType } = require("prom-client");
const { BUCKET_NAME, FOLDER_NAME } = process.env;

exports.qrCodeGenreate = async (code) => {
  return await new Promise((resolve, reject) => {
    let filePath = path.join(__dirname, "../public/images");
    let filename = `QR${code}.jpeg`;
    let filename1 = `QRS${code}.jpeg`;
    qrCode.toFile(
      `${filePath}/${filename}`,
      `${URLS.PLAYER_CLIENT_BASE_URL}/player-entry?code=${code}`,
      async (err) => {
        if (err) {
          reject(err);
        }

        const inputPath = `${filePath}/${filename}`;
        const outputPath = `${filePath}/${filename1}`;

        const sharp = await sharpImages(inputPath, outputPath, 1000, 800);
        if (sharp.success) {
          const fileContent = fs.readFileSync(outputPath);

          const params = {
            Bucket: BUCKET_NAME,
            Key: `${FOLDER_NAME}/${filename1}`,
            Body: fileContent,
            contentType: "image/jpeg",
          };

          s3.upload(params, (err, data) => {
            logger.info(`err, data , ${err}, ${data}`);
            if (err) {
              reject(err);
            }

            resolve({
              url: data.Location,
              filePath: `${filePath}/${filename}`,
              outputPath: sharp.outputPath,
            });
          });
        }
      }
    );
  });
};
