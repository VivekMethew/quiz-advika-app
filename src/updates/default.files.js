require("dotenv").config();
const { mongooseConnection } = require("../config");
const { quizPollModel } = require("../models/quiz.poll.model");

mongooseConnection();

const POLL_DEFAULT_IMAGE = "66ae67aa1259b4835b55f1fb";
const QUIZ_DEFAULT_IMAGE = "66ae678c1259b4835b55f1f8";

(async () => {
  try {
    const response = await quizPollModel.find({}).select("type");
    for (let obj of response) {
      if (obj.type === "obj") {
        await quizPollModel.findOneAndUpdate(
          { _id: obj._id },
          { coverImage: QUIZ_DEFAULT_IMAGE }
        );
      } else {
        await quizPollModel.findOneAndUpdate(
          { _id: obj._id },
          { coverImage: POLL_DEFAULT_IMAGE }
        );
      }
    }
  } catch (error) {
    console.log("ERROR =>", error);
  }
  process.exit();
})();
