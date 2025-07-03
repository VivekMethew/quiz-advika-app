require("dotenv").config();
const { mongooseConnection } = require("../config");
const { Category } = require("../models/category.model");
const { quizPollModel } = require("../models/quiz.poll.model");

mongooseConnection();

(async () => {
  try {
    const response = await quizPollModel.updateMany(
      { catId: { $ne: null } },
      { $set: { catId: "65ed8578ec651a6c7411d524" } }
    );
    console.log("up", response);
  } catch (error) {
    console.log("ERROR =>", error);
  }
  process.exit();
})();
