const path = require("path");
const sharp = require("sharp");

exports.compressImage = async (inputPath, outputPath) => {
  const compressionQuality = 40;

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    const imageFormat = metadata.format.toLowerCase();

    if (imageFormat === "png") {
      await image.png({ quality: compressionQuality }).toFile(outputPath);
    } else if (imageFormat === "jpeg" || imageFormat === "jpg") {
      await image.jpeg({ quality: compressionQuality }).toFile(outputPath);
    } else if (imageFormat === "svg") {
      await image.svg({ quality: compressionQuality }).toFile(outputPath);
    } else if (imageFormat === "gif") {
      await image.gif({ quality: compressionQuality }).toFile(outputPath);
    } else {
      throw new Error("Unsupported image format: " + imageFormat);
    }

    console.log("Image compressed successfully!");
    result.send("File has been compressed and saved.");
  } catch (error) {
    console.error("Error occurred while compressing the image:", error);
    result.send("Error occurred while compressing the image.");
  }
};
