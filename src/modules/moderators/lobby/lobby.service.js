const { HTTP_CODES, MESSAGES, CONSTANTS, URLS } = require("../../../config");
const { serviceResponse } = require("../../../helpers/response");
const { MySubscriptionModel } = require("../../../models/plans.selected.model");
const { PlayerModel } = require("../../../models/player.model");
const { quizPollModel } = require("../../../models/quiz.poll.model");
const { User } = require("../../../models/users.model");
const {
  WallOfFameAnswerModel,
} = require("../../../models/wallOfFame.answers.model");
const { WinnerModel } = require("../../../models/winners");
const { logger, RDS, pagination } = require("../../../utils");
const {
  usesCountUpdated,
  usesCountOfModerator,
  validateSubsPlanForGames,
} = require("../../../utils/plans.utils");
const {
  calculateTotalPoints,
} = require("../../socket.io/moderators/moderator.services");

exports.invitesPlayers = async (code, payload) => {
  let emails = [...new Set(payload.emails.map((obj) => obj.toLowerCase()))];
  const existEmails = [];

  const isMatch = await quizPollModel.findOne({
    code: code,
    isDeleted: null,
  });

  if (!isMatch)
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.INVALID_CODE);

  for (let email of emails) {
    const response = await PlayerModel.findOne({
      email: email,
      code: isMatch.code,
    });

    if (response) {
      existEmails.push(email);
    }
  }

  emails = emails.filter((email) => !existEmails.includes(email));

  if (emails.length === 0)
    return serviceResponse(
      false,
      HTTP_CODES.BAD_REQUEST,
      MESSAGES.EMAILS_EXIST
    );

  const usesData = await usesCountOfModerator(isMatch.userId);

  const pendingUsesCount = usesData.noOfUser - usesData.usesCount;

  if (pendingUsesCount < emails.length)
    return serviceResponse(
      false,
      HTTP_CODES.BAD_REQUEST,
      MESSAGES.LIMIT_EXCEEDED
    );

  const isUser = await User.findOne({
    _id: isMatch.userId,
    isDeleted: null,
  }).select("fname lname role");

  if (isUser.role !== CONSTANTS.USER.ROLES.ADMIN) {
    const usesData = await usesCountOfModerator(isMatch.userId);

    if (usesData.usesCount >= usesData.noOfUser) {
      return serviceResponse(
        false,
        HTTP_CODES.TOO_MANY_REQUESTS,
        MESSAGES.LIMIT_EXCEEDED
      );
    }

    if (isUser.role === CONSTANTS.USER.ROLES.MODERATOR) {
      const isSubs = await MySubscriptionModel.findOne({
        purchasedBy: isMatch.userId,
        isDeleted: null,
      }).populate({ path: "subId", select: "name" });

      const isAllow = validateSubsPlanForGames(isSubs.subId.name);

      if (isSubs.isAddOnUser) {
        isAllow.noOfUser += isSubs.noOfAddOnUsers;
      }

      const quizz = await quizPollModel
        .find({
          userId: isMatch.userId,
          isDeleted: null,
        })
        .select("code");

      const isCount = await PlayerModel.countDocuments({
        code: { $in: quizz.map((obj) => obj.code) },
        isPlayed: "joined",
        isCleared: false,
        isDeleted: null,
      });

      if (isCount >= isAllow.noOfUser) {
        return serviceResponse(
          false,
          HTTP_CODES.NOT_FOUND,
          MESSAGES.GAME_IS_FULL
        );
      }
    }
  }

  for (let email of emails) {
    let playerPayload = {};
    playerPayload.eventId = isMatch._id;
    playerPayload.name = email.split("@")[0];
    playerPayload.email = email;
    playerPayload.code = isMatch.code;
    playerPayload.isPlayed = "invited";

    try {
      await PlayerModel.create(playerPayload);
      await usesCountUpdated(isMatch.userId);
      logger.info("Uses Count has been updated!!!");
    } catch (error) {
      logger.info(error.message);
    }
  }

  return serviceResponse(
    true,
    HTTP_CODES.CREATED,
    MESSAGES.INVITED_USER_ADDED,
    emails
  );
};

exports.listParticipants = async (code, query) => {
  let { page, limit, order, search } = query;
  const findQuery = {};
  let sort = {};
  findQuery["$and"] = [];
  findQuery["$and"].push({ code: code, isDeleted: null });

  if (!page && !limit) {
    page = 1;
    limit = 10;
  } else {
    page = parseInt(page);
    limit = parseInt(limit);
  }

  if (search) {
    findQuery["$and"].push({
      $or: [
        {
          $expr: {
            $regexMatch: {
              input: { $toLower: "$name" },
              regex: new RegExp(search.toLowerCase()),
            },
          },
        },
        {
          $expr: {
            $regexMatch: {
              input: { $toLower: "$email" },
              regex: new RegExp(search.toLowerCase()),
            },
          },
        },
      ],
    });
  }

  if (order === "latest") {
    sort.createdAt = "desc";
  } else if (order === "oldest") {
    sort.createdAt = "asc";
  } else {
    sort.createdAt = "desc";
  }

  const offset = page === 1 ? 0 : limit * (page - 1);

  const response = await PlayerModel.find(findQuery)
    .sort(sort)
    .skip(offset)
    .limit(limit);

  let result = pagination.getPagingData(
    {
      count: await PlayerModel.countDocuments(findQuery),
      rows: response,
    },
    page,
    limit
  );
  return serviceResponse(
    true,
    HTTP_CODES.CREATED,
    MESSAGES.INVITED_USER_ADDED,
    result
  );
};

exports.scoreboard = async (roomCode) => {
  // Fetch total points and questions upfront
  const { totalPoint, questions, eventId } =
    await calculateTotalPoints(roomCode);

  // Fetch all participants and winners upfront
  const winners = await this.getWinners(roomCode);

  // Fetch WallOfFameAnswerModel records in batch for all participants
  const participantIds = winners.map((winner) =>
    winner?.playerId?._id.toString()
  );

  // `lean` makes it faster by returning plain JS objects instead of Mongoose documents
  const wallOfFameRecords = await WallOfFameAnswerModel.find({
    eventId: eventId,
    playerId: { $in: participantIds },
  }).lean();

  // Create a map of WallOfFame records for quick lookup
  const wallOfFameMap = new Map();
  for (let record of wallOfFameRecords) {
    wallOfFameMap.set(`${record.playerId}_${record.quisId}`, record);
  }

  // Prepare the scoreboard
  const winnerFilter = [];

  for (let obj of winners) {
    let payload = {
      userId: obj?.playerId?._id,
      name: obj?.playerId?.name,
      roomCode: obj?.code,
      type: obj?.eventId?.type,
      totalPoint,
      isPlayed: obj?.playerId?.isPlayed,
      createdAt: obj?.playerId?.createdAt,
      updatedAt: obj?.playerId?.updatedAt,
    };

    const gameInfo = await RDS.findGameInfor(
      `${obj.code}_${obj.playerId?._id}`
    );

    if (gameInfo) {
      // Prepare the payload based on whether game info is available

      payload.obtainPoint = gameInfo ? gameInfo.obtainPoint : 0;
      payload.dated = gameInfo ? gameInfo.dated : null;
      payload.playedTime = gameInfo ? gameInfo.AnswerTimeCount : 0;

      if (gameInfo) {
        // Deduct points for deleted answers from wall of fame
        for (let ques of questions) {
          const wallOfFame = wallOfFameMap.get(
            `${obj?.playerId?._id}_${ques._id}`
          );
          if (wallOfFame && wallOfFame.isDeleted !== null) {
            payload.obtainPoint -= wallOfFame.point;
          }
        }
      }
    } else {
      // Winner handling

      payload.obtainPoint = obj.points;
      payload.dated = obj.createdAt;
      payload.playedTime = obj.playedTime;

      // Deduct points for deleted answers from wall of fame
      for (let ques of JSON.parse(obj.playedQuestions)) {
        const wallOfFame = wallOfFameMap.get(
          `${obj.playerId?._id}_${ques.quesId}`
        );
        if (wallOfFame && wallOfFame.isDeleted !== null) {
          payload.obtainPoint -= wallOfFame.point;
        }
      }
    }

    winnerFilter.push(payload);
  }

  return serviceResponse(
    true,
    HTTP_CODES.OK,
    MESSAGES.FETCH,
    winnerFilter.sort((a, b) => {
      if (b.obtainPoint === a.obtainPoint) {
        return a.playedTime - b.playedTime; // If points are the same, sort by time (ascending)
      } else {
        return b.obtainPoint - a.obtainPoint; // Sort by points (descending)
      }
    })
  );
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
