const { CONSTANTS } = require("../../../config");
const {
  WallOfFameAnswerModel,
} = require("../../../models/wallOfFame.answers.model.js");
const { RDS } = require("../../../utils/index.js");
const services = require("./moderator.services");
const { errorResponseMessage } = require("./res.handler.js");

exports.updateQuizPollPermissions = async ({ id, roomCode, isAccess }) => {
  // Validate the data
  if (!roomCode || !isAccess)
    return {
      error: errorResponseMessage("roomCode and isAccess is required"),
    };

  const isQuizPoll = await services.fetchQuizAndPoll({ roomCode });

  if (!isQuizPoll.success) {
    return {
      error: errorResponseMessage(isQuizPoll.message),
    };
  }

  await services.updatePermissionQuizPoll({
    quizId: isQuizPoll._id,
    isAccess: isAccess,
  });

  const event = {
    success: true,
    message:
      isAccess === "public" ? "Successfully publish" : "Successfully protected",
    data: { roomCode },
  };

  return { event };
};

exports.listParticipants = async (code) => {
  const response = await services.listParticipants(code);
  return response;
};

exports.getScoreBoard = async (roomCode) => {
  // Fetch total points and questions upfront
  const { totalPoint, questions, eventId } =
    await services.calculateTotalPoints(roomCode);

  // Fetch all participants and winners upfront
  const winners = await services.getWinners(roomCode);

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

  // Sort the results by obtainPoint and playedTime
  return winnerFilter.sort((a, b) => {
    if (b.obtainPoint === a.obtainPoint) {
      return a.playedTime - b.playedTime; // If points are the same, sort by time (ascending)
    } else {
      return b.obtainPoint - a.obtainPoint; // Sort by points (descending)
    }
  });
};
