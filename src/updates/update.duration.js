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
        if (item.duration > 48) {
          await quizPollModel.updateOne(
            { _id: item._id },
            {
              $set: { duration: 48 },
            }
          );
        }

        console.log("Changes updated...");
      }
    }
  } catch (error) {
    console.log("ERROR =>", error);
  }
  process.exit();
})();
