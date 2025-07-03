const sharp = require("sharp");
const path = require("path");

exports.sharpImages = async (inputPath, outputPath, newWidth, newHeight) => {
  await sharp(inputPath)
    .resize({ width: newWidth, height: newHeight, fit: "contain" })
    .toFile(outputPath)
    .then(() => {
      console.log("Image resized successfully!");
    })
    .catch((error) => {
      console.error("Error occurred while resizing the image:", error);
    });
  return { success: true, outputPath };
};
