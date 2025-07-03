const { s3 } = require("../../config/s3.instance");

exports.STREAM = async (req, res, next) => {
  try {
    const { params } = req;
    // Set S3 getObject parameters
    const payload = {
      Bucket: process.env.BUCKET_NAME,
      Key: `${process.env.FOLDER_NAME}/${params.key}`,
    };

    // Get the video file from S3
    const fileStream = s3.getObject(payload).createReadStream();

    // Set appropriate headers for streaming
    res.setHeader("Content-Type", "video/mp4");

    // Stream the file to the client
    fileStream.pipe(res);

    fileStream.on("error", (err) => {
      console.error("S3 stream error:", err);
      res.status(500).send("Internal Server Error");
    });
  } catch (error) {
    next(error);
  }
};
