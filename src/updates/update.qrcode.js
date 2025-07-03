require("dotenv").config();
const { mongooseConnection } = require("../config");
const { quizPollModel } = require("../models/quiz.poll.model");
const { qrCodeGenreate } = require("../utils/qrcode");
const fs = require("fs");
mongooseConnection();

(async () => {
  try {
    const response = await quizPollModel.find({ isDeleted: null });
    if (response.length > 0) {
      for (let item of response) {
        const result = await qrCodeGenreate(item.code);

        fs.unlink(result.filePath, (err) => {
          if (err) logger.error(err);
          console.log("file has been deleted");
        });

        fs.unlink(result.outputPath, (err) => {
          if (err) logger.error(err);
          console.log("file has been deleted");
        });

        await quizPollModel.updateOne(
          { _id: item._id },
          {
            $set: { qrCodeLink: result.url },
          }
        );

        console.log("Changes updated...");
      }
    }
  } catch (error) {
    console.log("ERROR =>", error);
  }
  process.exit();
})();
