require("dotenv").config();
const { mongooseConnection } = require("../config");
const { quizPollModel } = require("../models/quiz.poll.model");
mongooseConnection();

(async () => {
  try {
    const response = await quizPollModel.find({}).select("type");
    for (let item of response) {
      let ratings = parseFloat((Math.random() * (5 - 4.5) + 4.5).toFixed(2));
      console.log({ ratings });
      await quizPollModel.updateOne(
        { _id: item._id },
        {
          $set: { ratings: ratings },
        }
      );
    }
    console.log(`Ratings has been updated : ${response.length}`);
  } catch (error) {
    console.log("ERROR =>", error);
  }
  process.exit();
})();
