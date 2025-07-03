const { HTTP_CODES, MESSAGES } = require("../../config");
const { serviceResponse } = require("../../helpers/response");
const {
  WallOfFameAnswerModel,
} = require("../../models/wallOfFame.answers.model");
const { quizPollModel } = require("../../models/quiz.poll.model");
const { PlayerModel } = require("../../models/player.model");
const { pagination } = require("../../utils");
const { QuestionModel } = require("../../models/questions.model");

exports.LIST = async (id, query) => {
  let { search, page, limit, order } = query;

  if (search === "undefined") {
    search = null;
  }
  // find quiz with id

  const quiz = await quizPollModel.findOne({ _id: id, isDeleted: null });

  if (!quiz)
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);

  console.log({ quiz });

  const query_player = {};

  if (search) {
    query_player.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  query_player["code"] = quiz.code;
  query_player["isEliminate"] = false;
  const players = await PlayerModel.find(query_player, "_id");

  const playerIds = players.map((player) => player._id);

  console.log(playerIds);

  const findQuery = {};
  let sort = {};
  findQuery["$and"] = [];
  findQuery["$and"].push({ eventId: id, isDeleted: null });

  if (!page && !limit) {
    page = 1;
    limit = 10;
  } else {
    page = parseInt(page);
    limit = parseInt(limit);
  }

  if (order === "latest") {
    sort.createdAt = "desc";
  } else if (order === "oldest") {
    sort.createdAt = "asc";
  } else {
    sort.createdAt = "desc";
  }

  const offset = page === 1 ? 0 : limit * (page - 1);

  const documents = await WallOfFameAnswerModel.find({
    playerId: { $in: playerIds },
    ...findQuery,
  })
    .sort(sort)
    .skip(offset)
    .limit(limit)
    .populate({ path: "eventId", select: "userId type title coverImage code",model: quizPollModel })
    .populate({
      path: "quisId",
      select: "type optionType isWallOfFame image title",
      model: QuestionModel
    })
    .populate({
      path: "playerId",
      select: "name email",
      model: PlayerModel
    });

  const response = documents.filter((doc) => doc.quisId.isWallOfFame !== false);
  return serviceResponse(
    true,
    HTTP_CODES.OK,
    MESSAGES.FETCH,
    pagination.getPagingData(
      {
        count: await WallOfFameAnswerModel.countDocuments({
          playerId: { $in: playerIds },
          ...findQuery,
        }),
        rows: response,
      },
      page,
      limit
    )
  );
};

exports.VIEW = async (id) => {
  let response = await WallOfFameAnswerModel.findOne(
    { _id: id, isDeleted: null },
    { __v: 0 }
  )
    .populate({ path: "eventId", select: "userId type title coverImage code" ,model: quizPollModel})
    .populate({
      path: "quisId",
      select: "type optionType isWallOfFame image title",
      model: QuestionModel
    })
    .populate({
      path: "playerId",
      select: "name email",
      model: PlayerModel
    });

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.FETCH, response);
};

exports.DELETE = async (id) => {
  let findQuery = { _id: id, isDeleted: null };
  const response = await WallOfFameAnswerModel.findOne(findQuery);

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  await WallOfFameAnswerModel.findOneAndUpdate(findQuery, {
    isDeleted: new Date(),
  });

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.DELETED);
};
