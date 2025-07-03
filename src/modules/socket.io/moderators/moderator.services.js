const { CONSTANTS } = require("../../../config");
const { FileModel } = require("../../../models/files.model");
const { PlayerModel } = require("../../../models/player.model");
const { QuestionModel } = require("../../../models/questions.model");
const { quizPollModel } = require("../../../models/quiz.poll.model");
const { User } = require("../../../models/users.model");
const { WinnerModel } = require("../../../models/winners");
const { RDS } = require("../../../utils");

exports.fetchParticipants = async (code) => {
  let findQuery = { isDeleted: null };
  findQuery.code = code;
  // findQuery.isEliminate = false;
  findQuery[{ $or: [{ isPlayed: "joined" }, { isPlayed: "played" }] }];
  const response = await PlayerModel.find(findQuery, { __v: 0, password: 0 });
  return response;
};

exports.fetchQuizAndPoll = async (payload) => {
  const response = await quizPollModel
    .findOne({ code: payload.roomCode })
    .populate({ path: "userId", select: "fname lname", model: User })
    .populate({
      path: "questions",
      populate: [
        {
          path: "thumbnail",
          select: "url",
          model: FileModel,
        },
        {
          path: "image",
          select: "url",
          model: FileModel,
        },
        {
          path: "customMessage.file",
          select: "url",
          model: FileModel,
        },
      ],
      model: QuestionModel,
    })
    .populate({
      path: "coverImage",
      select: "url",
      model: FileModel,
    });
  if (!response) {
    return { success: false, message: "Quil/Poll does not exists" };
  }

  return { success: true, message: "success", data: response };
};

exports.updatePermissionQuizPoll = async (payload) => {
  try {
    const updateEvent = await quizPollModel.findOneAndUpdate(
      {
        _id: payload.quizId,
        isDeleted: null,
      },
      { isAccess: payload.isAccess },
      { new: true }
    );

    return updateEvent;
  } catch (error) {
    console.log("Error :", error);
    throw error;
  }
};

exports.listParticipants = async (code) => {
  let findQuery = { isDeleted: null };
  findQuery.code = code;
  // findQuery.isEliminate = false;
  findQuery[{ $or: [{ isPlayed: "joined" }, { isPlayed: "played" }] }];
  const response = await PlayerModel.find(findQuery, { __v: 0, password: 0 });
  return response;
};

exports.getWinners = async (code) => {
  const limit = 5;
  const response = await WinnerModel.find({
    code: code,
    isDeleted: null,
  })
    .populate({
      path: "playerId",
      select: "name isPlayed createdAt updatedAt",
      model: PlayerModel,
    })
    .populate({
      path: "eventId",
      select: "type code userId",
      model: quizPollModel,
    })
    .sort({ points: -1 })
    .limit(limit);
  return response;
};

// Function to calculate total points with Redis caching
exports.calculateTotalPoints = async (roomCode) => {
  const cacheKey = `totalPoints:${roomCode}`;

  // Check cache first
  const cachedData = await RDS.getTotalPointDetail(cacheKey);

  if (cachedData) {
    return JSON.parse(cachedData);
  }

  // If not cached, query the database
  const response = await quizPollModel
    .findOne({
      code: roomCode,
      isDeleted: null,
    })
    .populate({
      path: "questions",
      match: { isDeleted: null },
      model: QuestionModel,
    });

  if (!response) {
    return null; // or handle case when response is null
  }

  const totalPoints = response.questions
    .map((q) => q.point)
    .reduce((acc, cv) => acc + cv, 0);

  const payload = {
    eventId: response._id,
    questions: response.questions,
    totalPoint: totalPoints,
  };

  await RDS.saveTotalPointDetail(cacheKey, payload);
  return payload;
};

exports.getQuizPoll = async (payload) => {
  const response = await quizPollModel.findOne(
    {
      code: payload.roomCode,
      // $or: [{ status: "active" }, { status: "running" }],
    },
    { __v: 0 }
  );
  if (!response) {
    return { success: false, message: "Quiz/Poll does not exists" };
  }

  return { success: true, message: "success", data: response };
};
