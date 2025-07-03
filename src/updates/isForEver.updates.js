require("dotenv").config();
const { mongooseConnection } = require("../config");
const { quizPollModel } = require("../models/quiz.poll.model");
mongooseConnection();

(async () => {
  try {
    const response = await quizPollModel.updateMany(
      {},
      { $set: { isForEver: false, isSuggested: false } }
    );
    console.log("up", response);
  } catch (error) {
    console.log("ERROR =>", error);
  }
  process.exit();
})();
