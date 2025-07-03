const { HTTP_CODES,  MESSAGES } = require("../../../config");
const { serviceResponse } = require("../../../helpers/response");
const { OrderModel } = require("../../../models/orders.model");
const { MySubscriptionModel } = require("../../../models/plans.selected.model");
const { PlayerModel } = require("../../../models/player.model");
const { QuestionModel } = require("../../../models/questions.model");
const { quizPollModel } = require("../../../models/quiz.poll.model");
const { SubscriptionsModel } = require("../../../models/subsription.plans.model");
const { User } = require("../../../models/users.model");
const { WinnerModel } = require("../../../models/winners");

exports.getQuizReport = async (id) => {
  let findQuery = { _id: id, isDeleted: null };
  const quizPollDetail = await quizPollModel
    .findOne(findQuery)
    .populate({ path: "questions" ,model: QuestionModel})
    .populate({ path: "userId", select: "fname lname" ,model: User})
    .select(
      "type code userId title ratings purchaseCount description coverImage questions duration startDateTime endDateTime"
    );
  if (!quizPollDetail) {
    return serviceResponse(true, HTTP_CODES.NOT_FOUND, "Record Not Found");
  }

  let options = {};

  options._id = quizPollDetail._id;
  options.title = quizPollDetail.title;
  options.code = quizPollDetail.code;
  options.userId = quizPollDetail.userId;
  options.type = quizPollDetail.type;
  options.ratings = quizPollDetail.ratings;
  options.totalQues = quizPollDetail.questions.length;
  options.startDateTime = quizPollDetail.startDateTime;
  options.endDateTime = quizPollDetail.endDateTime;
  options.duration = quizPollDetail.duration;
  options.purchaseCount = quizPollDetail.purchaseCount;
  let allottedTime =
    quizPollDetail.questions
      .map((obj) => obj.duration)
      .reduce((acc, current) => acc + current, 0) / 60;
  options.allottedTime = allottedTime;
  if (quizPollDetail.type === "quiz") {
    options.totalPoint = quizPollDetail.questions
      .map((obj) => obj.point)
      .reduce((acc, current) => acc + current, 0);
  }

  const winners = await WinnerModel.find({
    code: quizPollDetail.code,
    isDeleted: null,
  });

  const spenTimes = winners.map((obj) => obj.playedTime);
  if (spenTimes.length > 0) {
    const spentTimeInMinutes =
      spenTimes.reduce((acc, current) => acc + current, 0) / 60;
    const avgTime = spentTimeInMinutes / spenTimes.length;

    options.avgTime = avgTime.toFixed(2);
    options.totalTimeSpent = spentTimeInMinutes.toFixed(2);
  } else {
    options.avgTime = 0;
    options.totalTimeSpent = 0;
  }

  const totalVisitors = await PlayerModel.find({
    code: quizPollDetail.code,
    isDeleted: null,
  });

  options.totalVisitors = totalVisitors.length;
  options.noOfDowns = quizPollDetail.purchaseCount
    ? quizPollDetail.purchaseCount
    : 0;

  const totalRevenue = await OrderModel.find({
    type: "product",
    quizAndPollId: quizPollDetail._id,
    isDeleted: null,
  })
    .populate({ path: "userId", select: "idd role fname lname email phone",model: User })
    .populate({
      path: "planId",
      select: "purchasedDate expiredOnDate",
      populate: { path: "subId", select: "name" ,model: SubscriptionsModel},
      model: MySubscriptionModel
    })
    .populate({ path: "quizAndPollId", select: "type title coverImage",model: quizPollModel })
    .select("-paymentResponse");

  options.invoiceHistory = totalRevenue;

  if (totalRevenue.length > 0) {
    options.totalRevenue = totalRevenue
      .map((obj) => obj.amount)
      .reduce((acc, current) => acc + current, 0);
  } else {
    options.totalRevenue = 0;
  }

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.FETCH, options);
};
