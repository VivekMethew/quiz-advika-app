const { HTTP_CODES, MESSAGES, CONSTANTS, URLS } = require("../../../config");
// const { REDIS } = require("../../../config/constants");
const { serviceResponse } = require("../../../helpers/response");
const { NotificationModel } = require("../../../models/notification.models");
const { PlayerModel } = require("../../../models/player.model");
const { quizPollModel } = require("../../../models/quiz.poll.model");
const { pagination, logger, RDS } = require("../../../utils");
const {
  generateStartTimeEnd,
  dateMustBeGreater,
} = require("../../../utils/dateUtils");
const { usesCountOfModerator } = require("../../../utils/plans.utils");
// const { getScoreBoard } = require("../../socket.io/players/player.controls");
// const { listParticipants } = require("../../socket.io/players/player.services");
//const { successResponseMessage } = require("../../socket.io/players/response");
const { MySubscriptionModel } = require("../../../models/plans.selected.model");
const {
  SubscriptionsModel,
} = require("../../../models/subsription.plans.model");
const { QuestionModel } = require("../../../models/questions.model");
const { User } = require("../../../models/users.model");
const { Category } = require("../../../models/category.model");
const { FileModel } = require("../../../models/files.model");
const { REDIS } = require("../../../config/constants");
const { radisPublishAction } = require("../../../utils/radis.action");

exports.getList = async (user, query) => {
  let { search, type, page, limit, order, status } = query;
  let sort = {};
  const findQuery = {};
  findQuery["$and"] = [];
  findQuery["$and"].push({
    userId: user.id,
    $or: [
      { $and: [{ isPurchased: false }, { createdFrom: null }] },
      { $and: [{ isPurchased: true }, { createdFrom: { $ne: null } }] },
      {
        $and: [
          { isPurchased: false },
          { isDuplicate: true },
          { createdFrom: { $ne: null } },
        ],
      },
    ],

    // $or: [
    //   { $and: [{ isPurchased: false }, { createdFrom: null }] },
    //   {
    //     $or: [
    //       {
    //         $and: [
    //           { isCreatedFrom: true },
    //           { isPurchased: false },
    //           { createdFrom: { $ne: null } },
    //         ],
    //       },
    //       {
    //         $and: [{ isPurchased: true }, { createdFrom: { $ne: null } }],
    //       },
    //     ],
    //   },
    // ],
    isDeleted: null,
  });

  //new addded

  // const usesDetail = await usesCountOfModerator(user.id);
  // if (usesDetail.isActiveCount >= usesDetail.noOfActiveQuizPoll) {
  //   //const activeIds = await quizPollModel.find({ status: "active" }).sort({ updatedAt: -1 }).limit(usesDetail.noOfActiveQuizPoll);
  //   const activeIds = await quizPollModel.find({
  //     userId: user.id,
  //     $or: [{ status: "active" }, { status: "running" }]
  //   }).sort({ updatedAt: -1 }).limit((usesDetail.noOfActiveQuizPoll)+1);
  //   // findQuery["$and"].push({
  //   //   _id: { $in: activeIds.map(doc => doc._id) }
  //   // });
  //   await quizPollModel.updateMany(
  //     { _id: { $nin: activeIds }, userId: user.id },
  //     { $set: { status: "closed" } }
  //   );
  // }
  const usesDetail = await usesCountOfModerator(user.id);
  if (usesDetail.isActiveCount >= usesDetail.noOfActiveQuizPoll) {
    const limit = usesDetail.noOfActiveQuizPoll + 1;

    // const activeIds = await quizPollModel.find({
    //   status: { $in: ["active", "running"] }
    // }).sort({ updatedAt: -1 }).limit(limit);

    const activeIds = await quizPollModel
      .find({
        userId: user.id,
        $or: [{ status: "active" }, { status: "running" }],
      })
      .sort({ isDated: -1 })
      .limit(limit);

    await quizPollModel.updateMany(
      { _id: { $nin: activeIds } },
      { $set: { status: "closed", isActivated: false } },
      { new: true }
    );
    //nn
    if (activeIds.length != usesDetail.noOfActiveQuizPoll) {
      const mySubs = await MySubscriptionModel.findOne({
        purchasedBy: user.id,
        isDeleted: null,
      })
        .populate({
          path: "subId",
          select: "name noOfUsers",
          model: SubscriptionsModel,
        })
        .select("usesCount status");

      if (mySubs.subId.name != "trial") {
        await quizPollModel.findOneAndUpdate(
          { _id: activeIds[activeIds.length - 1] },
          { $set: { status: "closed", isActivated: false } }
        );
      }
    }
    //eod
  }

  //end here

  //new 2
  const mySubscription = await MySubscriptionModel.findOne({
    purchasedBy: user.id,
    isDeleted: null,
  })
    .populate({
      path: "subId",
      select: "name noOfUsers",
      model: SubscriptionsModel,
    })
    .select("usesCount status");

  if (mySubscription.subId.name == "trial") {
    await quizPollModel.findOneAndUpdate(
      {
        isActivated: true,
        $or: [{ status: "active" }, { status: "closed" }],
      },
      {
        $set: { status: "running" },
      },
      {
        sort: { isDated: -1 },
        new: true,
      }
    );
  } else {
    await quizPollModel.updateMany(
      {
        isActivated: true,
      },
      {
        $set: { status: "running" },
      }
    );
  }

  //end 2

  if (search) {
    findQuery["$and"].push({
      $or: [
        { title: { $regex: new RegExp(search, "i") } },
        {
          tags: { $elemMatch: { $regex: new RegExp(search, "i") } },
        },
      ],
    });
  }

  if (type == "quiz" || type == "poll") {
    findQuery["$and"].push({ type: type });
  }

  if (type == "favourites") {
    findQuery["$and"].push({ addToFav: user.id, isDeleted: null });
  }

  if (status && status === "live") {
    findQuery["$and"].push({ status: { $in: ["active", "running"] } });
  } else if (status && status === "inactive") {
    findQuery["$and"].push({
      status: { $in: ["pending", "closed", "deactivated", "order"] },
    });
  } else if (status && (status === "active" || status === "running")) {
    findQuery["$and"].push({
      status: status,
    });
  }

  if (!query.page && !query.limit) {
    page = 1;
    limit = 10;
  } else {
    page = parseInt(page);
    limit = parseInt(limit);
  }

  if (order === "latest") {
    sort.isDated = "desc";
  } else if (order === "oldest") {
    sort.isDated = "asc";
  } else {
    sort.isDated = "desc";
  }

  const offset = page === 1 ? 0 : limit * (page - 1);
  let response = await quizPollModel
    .find(findQuery, { __v: 0 })
    .sort(sort)
    .skip(offset)
    .limit(limit)
    .populate({
      path: "questions",
      populate: [
        {
          path: "image",
          select: "url",
          model: FileModel,
        },
        {
          path: "thumbnail",
          select: "url",
          model: FileModel,
        },
        {
          path: "customMessage",
          select: "url",
          model: FileModel,
        },
      ],
      model: QuestionModel,
    })
    .populate({
      path: "userId",
      select: "_id idd role fname lname email status",
      model: User,
    })
    .populate({
      path: "catId",
      select: "_id name description status isDeleted createdAt updatedAt",
      model: Category,
    })
    .populate({
      path: "coverImage",
      select: "url",
      model: FileModel,
    });

  let result = pagination.getPagingData(
    {
      count: await quizPollModel.countDocuments(findQuery),
      rows: response,
    },
    page,
    limit
  );

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.FETCH, result);
};

exports.yourPastWeek = async (user, query) => {
  let { search, type, page, limit, order, status } = query;
  let sort = {};

  const today = new Date(); // Get the current date
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);

  const findQuery = {};
  findQuery["$and"] = [];
  findQuery["$and"].push({
    userId: user.id,
    $or: [
      { $and: [{ isPurchased: false }, { createdFrom: null }] },
      { $and: [{ isPurchased: true }, { createdFrom: { $ne: null } }] },
    ],
    createdAt: { $gte: oneWeekAgo, $lte: today },
    isDeleted: null,
  });

  //new addded

  const usesDetail = await usesCountOfModerator(user.id);
  if (usesDetail.isActiveCount >= usesDetail.noOfActiveQuizPoll) {
    const activeIds = await quizPollModel
      .find({ status: { $in: ["active", "running"] } })
      .sort({ updatedAt: -1 })
      .limit(usesDetail.noOfActiveQuizPoll);
    // findQuery["$and"].push({
    //   _id: { $in: activeIds.map(doc => doc._id) }
    // });
    await quizPollModel.updateMany(
      { _id: { $nin: activeIds } },
      { $set: { status: "closed" } }
    );
  }

  //end here

  if (search) {
    findQuery["$and"].push({
      $or: [
        { title: { $regex: new RegExp(search, "i") } },
        {
          tags: { $elemMatch: { $regex: new RegExp(search, "i") } },
        },
      ],
    });
  }

  if (type) {
    findQuery["$and"].push({ type: type });
  }

  if (status) {
    findQuery["$and"].push({ status: status });
  }

  if (!query.page && !query.limit) {
    page = 1;
    limit = 10;
  } else {
    page = parseInt(page);
    limit = parseInt(limit);
  }

  if (order === "latest") {
    sort.isDated = "desc";
  } else if (order === "oldest") {
    sort.isDated = "asc";
  } else {
    sort.isDated = "desc";
  }

  const offset = page === 1 ? 0 : limit * (page - 1);

  let response = await quizPollModel
    .find(findQuery, { __v: 0 })
    .sort(sort)
    .skip(offset)
    .limit(limit)
    .populate({
      path: "questions",
      populate: [
        {
          path: "image",
          select: "url",
          model: FileModel,
        },
        {
          path: "thumbnail",
          select: "url",
          model: FileModel,
        },
        {
          path: "customMessage",
          select: "url",
          model: FileModel,
        },
      ],
      model: QuestionModel,
    })
    .populate({
      path: "userId",
      select: "_id idd role fname lname email status",
      model: User,
    })
    .populate({
      path: "catId",
      select: "_id name description status isDeleted createdAt updatedAt",
      model: Category,
    })
    .populate({
      path: "coverImage",
      select: "url",
      model: FileModel,
    });

  let result = pagination.getPagingData(
    {
      count: await quizPollModel.countDocuments(findQuery),
      rows: response,
    },
    page,
    limit
  );

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.FETCH, result);
};

exports.getNotifications = async (query, user) => {
  let { search, page, limit, order, isRead } = query;
  let sort = {};
  const findQuery = {};
  findQuery["$and"] = [];
  findQuery["$and"].push({ userId: user.id, isDeleted: null });

  if (search) {
    findQuery["$and"].push({
      $or: [{ title: { $regex: new RegExp(search, "i") } }],
    });
  }

  if (isRead) {
    findQuery["$and"].push({ isRead: isRead });
  }
  const undeletedQuizzes = await quizPollModel.find({ isDeleted: null });
  findQuery["$and"].push({
    QuizPollId: { $in: undeletedQuizzes.map((quiz) => quiz._id) },
  });

  if (!query.page && !query.limit) {
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

  let response = await NotificationModel.find(findQuery)
    .sort(sort)
    .skip(offset)
    .limit(limit)
    .populate({
      path: "userId",
      select: "idd fname lname role email",
      model: User,
    })
    .populate({
      path: "QuizPollId",
      select: "type userId title",
      model: quizPollModel,
    });

  return serviceResponse(
    true,
    HTTP_CODES.OK,
    MESSAGES.FETCH,
    pagination.getPagingData(
      {
        count: await NotificationModel.countDocuments(findQuery),
        rows: response,
      },
      page,
      limit
    )
  );
};

exports.updateNotification = async (id) => {
  let findQuery = { _id: id, isDeleted: null };
  const response = await NotificationModel.findOneAndUpdate(findQuery, {
    isRead: true,
  });

  if (!response) {
    return serviceResponse(false, "Record Not Found");
  }

  return serviceResponse(true, "Successfully Deleted Record..");
};

exports.deleteNotification = async (id) => {
  let findQuery = { _id: id, isDeleted: null };
  const response = await NotificationModel.findOneAndUpdate(findQuery, {
    isDeleted: new Date(),
  });

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.DELETED);
};

exports.addToFav = async (id, userId) => {
  let findQuery = { _id: id, isDeleted: null };
  let payload;
  let response = await quizPollModel
    .findOne(findQuery)
    .select("title addToFav");

  const isMacth = response.addToFav.includes(userId);
  if (!isMacth) {
    payload = { $addToSet: { addToFav: userId } };
  } else {
    payload = { $pull: { addToFav: userId } };
  }

  await quizPollModel.findOneAndUpdate(findQuery, payload);

  return serviceResponse(
    true,
    isMacth ? HTTP_CODES.OK : HTTP_CODES.CREATED,
    isMacth ? MESSAGES.FAV_REM : MESSAGES.FAV_ADD
  );
};

exports.addToDeActivated = async (id, userId) => {
  let findQuery = { _id: id, isDeleted: null };
  let payload;
  let response = await quizPollModel
    .findOne(findQuery)
    .select("title addToFav");

  const isMacth = response.addToFav.includes(userId);
  if (!isMacth) {
    payload = { $addToSet: { addToFav: userId } };
  } else {
    payload = { $pull: { addToFav: userId } };
  }

  await quizPollModel.findOneAndUpdate(findQuery, payload);

  return serviceResponse(
    true,
    isMacth ? HTTP_CODES.OK : HTTP_CODES.CREATED,
    isMacth ? MESSAGES.FAV_REM : MESSAGES.FAV_ADD
  );
};

exports.addQuizSubmition = async (id) => {
  let findQuery = {
    _id: id,
    isApplied: false,
    // $or: [{ status: "active" }, { status: "running" }],
    isDeleted: null,
  };
  const response = await quizPollModel
    .findOne(findQuery)
    .select("type title isApplied addToFav");

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  await quizPollModel.findOneAndUpdate(findQuery, {
    isApplied: true,
    isApproved: "pending",
    isDated: new Date(),
  });

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.APPLIED);
};

exports.deActivated = async (id, userId) => {
  let findQuery = {
    _id: id,
    status: "running",
    isDeleted: null,
  };

  const response = await quizPollModel
    .findOne(findQuery)
    .select("type code userId title status");

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  await quizPollModel.findOneAndUpdate(findQuery, {
    status: "deactivated",
    isActivated: false,
    isDated: new Date(),
  });

  try {
    await radisPublishAction(
      REDIS.PUB_EVENT.DEACTIVATED,
      response.userId,
      response.code
    );
  } catch (error) {
    console.error(`REDIS ERR : ${error.message}`);
  }

  return serviceResponse(
    true,
    HTTP_CODES.OK,
    response.type === "quiz"
      ? MESSAGES.QUIZDEACTIVATED
      : MESSAGES.POLLDEACTIVATED
  );
};

exports.endQuizAndPoll = async (id, userId) => {
  let findQuery = {
    _id: id,
    status: "running",
    isDeleted: null,
  };
  const response = await quizPollModel
    .findOne(findQuery)
    .select("type userId code title status");

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  await quizPollModel.findOneAndUpdate(findQuery, {
    status: "closed",
    isDated: new Date(),
  });

  try {
    await radisPublishAction(
      REDIS.PUB_EVENT.END,
      response.userId,
      response.code
    );
  } catch (error) {
    console.error(`REDIS ERR : ${error.message}`);
  }

  return serviceResponse(
    true,
    HTTP_CODES.OK,
    response.type === "quiz" ? MESSAGES.QUIZCLOSED : MESSAGES.POLLCLOSED
  );
};

exports.startActiveQuizAndPoll = async (id, payload, userId) => {
  let findQuery = {
    _id: id,
    status: "active",
    isDeleted: null,
  };
  const response = await quizPollModel
    .findOne(findQuery)
    .select("type userId code isAutostart title status duration");

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  const { startISO, endISO, timezon } = generateStartTimeEnd(
    payload.startDateTime,
    response.duration
  );

  await quizPollModel.findOneAndUpdate(
    findQuery,
    {
      startDateTime: startISO,
      endDateTime: endISO,
      timezon: timezon,
      duration: response.duration,
      status: "running",
      isActivated: true,
      isDated: new Date(),
    },
    { new: true }
  );

  try {
    await radisPublishAction(
      REDIS.PUB_EVENT.RUNNING,
      response.userId,
      response.code
    );
  } catch (error) {
    console.error(`REDIS ERR : ${error.message}`);
  }

  return serviceResponse(
    true,
    HTTP_CODES.OK,
    response.type === "quiz" ? MESSAGES.QUIZRUNNING : MESSAGES.POLLRUNNING
  );
};

exports.pendingToActiveQuizAndPoll = async (id, payload, userId) => {
  let findQuery = {
    _id: id,
    $or: [{ status: "pending" }, { status: "order" }],
    isDeleted: null,
  };

  const response = await quizPollModel
    .findOne(findQuery)
    .select("type title status duration");

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  const usesDetail = await usesCountOfModerator(userId);

  if (usesDetail.isActiveCount >= usesDetail.noOfActiveQuizPoll) {
    return serviceResponse(
      false,
      HTTP_CODES.BAD_REQUEST,
      MESSAGES.LIMIT_EXCEEDED
    );
  }

  const { startISO, endISO, timezon } = generateStartTimeEnd(
    payload.startDateTime,
    response.duration
  );

  await quizPollModel.findOneAndUpdate(findQuery, {
    startDateTime: startISO,
    endDateTime: endISO,
    timezon: timezon,
    duration: response.duration,
    status: "active",
    isDated: new Date(),
  });

  try {
    await radisPublishAction(
      REDIS.PUB_EVENT.ACITVATED,
      response.userId,
      response.code
    );
  } catch (error) {
    console.error(`REDIS ERR : ${error.message}`);
  }

  return serviceResponse(
    true,
    HTTP_CODES.OK,
    response.type === "quiz" ? MESSAGES.QUIZACTIVATED : MESSAGES.POLLACTIVATED
  );
};

exports.startClosedDeActivateToActivateQuizAndPoll = async (
  id,
  payload,
  userId
) => {
  let findQuery = {
    _id: id,
    $or: [{ status: "closed" }, { status: "deactivated" }],
    isDeleted: null,
  };
  const response = await quizPollModel
    .findOne(findQuery)
    .select("type userId code title status duration");

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  const usesDetail = await usesCountOfModerator(userId);

  if (usesDetail.isActiveCount >= usesDetail.noOfActiveQuizPoll) {
    return serviceResponse(
      false,
      HTTP_CODES.BAD_REQUEST,
      MESSAGES.UPGRADE_PLAN
    );
  }

  await quizPollModel.findOneAndUpdate(findQuery, {
    duration: response.duration,
    status: "active",
    isDated: new Date(),
  });

  try {
    await radisPublishAction(
      REDIS.PUB_EVENT.ACITVATED,
      response.userId,
      response.code
    );
  } catch (error) {
    console.error(`REDIS ERR : ${error.message}`);
  }

  return serviceResponse(
    true,
    HTTP_CODES.OK,
    response.type === "quiz" ? MESSAGES.QUIZACTIVATED : MESSAGES.POLLACTIVATED
  );
};

exports.activated = async (id, payload) => {
  const isTime = dateMustBeGreater(payload.startDateTime);
  if (!isTime) {
    return serviceResponse(false, HTTP_CODES.BAD_REQUEST, MESSAGES.START_TIME);
  }
  let findQuery = {
    _id: id,
    status: "deactivated",
    isDeleted: null,
  };
  const response = await quizPollModel
    .findOne(findQuery)
    .select("type title status duration");

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  const { startISO, endISO, timezon } = generateStartTimeEnd(
    payload.startDateTime,
    response.duration
  );

  delete payload.startDateTime;
  payload.startDateTime = startISO;
  payload.endDateTime = endISO;
  payload.timezon = timezon;

  await quizPollModel.findOneAndUpdate(
    findQuery,
    {
      startDateTime: payload.startDateTime,
      endDateTime: payload.endDateTime,
      timezon: payload.timezon,
      duration: response.duration,
      status: "active",
      isDated: new Date(),
    },
    { new: true }
  );

  return serviceResponse(
    true,
    HTTP_CODES.OK,
    response.type === "quiz" ? MESSAGES.QUIZACTIVATED : MESSAGES.POLLACTIVATED
  );
};

exports.playerEliminates = async (id) => {
  const response = await PlayerModel.findOneAndUpdate(
    { _id: id, isDeleted: null },
    { isEliminate: true },
    { new: true }
  );

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  const gameData = await quizPollModel
    .findOne({
      code: response.code,
      isDeleted: null,
    })
    .select("type code");

  // // if (global.io) {
  // //   io.to(parseInt(response.code)).emit(
  // //     CONSTANTS.SOCKET.PLAYER.SCOREBOARD,
  // //     successResponseMessage(
  // //       MESSAGES.FETCH,
  // //       await getScoreBoard(parseInt(response.code))
  // //     )
  // //   );

  // //   io.to(parseInt(response.code)).emit(
  // //     CONSTANTS.SOCKET.PLAYER.PARTICIPANTS,
  // //     successResponseMessage(
  // //       "Successfully get participants",
  // //       await listParticipants(parseInt(response.code))
  // //     )
  // //   );

  // //   io.to(response._id.toString()).emit(
  // //     CONSTANTS.SOCKET.PLAYER.PLAYER_ELIMINATED,
  // //     successResponseMessage(
  // //       gameData && gameData.type === "quiz"
  // //         ? "You have been eliminated from the Quiz"
  // //         : "You have been eliminated from the Poll"
  // //     )
  // //   );

  //   await RDS.removeRedisQuesElement(REDIS.REDIS_PLAYERS_GAMES, {
  //     userId: response._id,
  //     roomCode: response.code,
  //   });
  // }

  return serviceResponse(
    true,
    HTTP_CODES.OK,
    gameData && gameData.type === "quiz"
      ? MESSAGES.PLAYER_ELIMINATED_BY_MODERATOR
      : MESSAGES.PLAYER_ELIMINATED_BY_MODERATOR1
  );
};

exports.myActivities = async (userId, query) => {
  let { page, limit, search, type, order, status } = query;
  const findQuery = {};
  let sort = {};
  findQuery["$and"] = [];
  findQuery["$and"].push({
    userId: userId,
    $or: [
      { $and: [{ isPurchased: false }, { createdFrom: null }] },
      { $and: [{ isPurchased: true }, { createdFrom: { $ne: null } }] },
      {
        $and: [
          { isPurchased: false },
          { isDuplicate: true },
          { createdFrom: { $ne: null } },
        ],
      },
    ],
    isDeleted: null,
  });

  if (!page && !limit) {
    page = 1;
    limit = 10;
  } else {
    page = parseInt(page);
    limit = parseInt(limit);
  }

  //new added
  const usesDetail = await usesCountOfModerator(userId);
  if (usesDetail.isActiveCount > usesDetail.noOfActiveQuizPoll) {
    const limit = usesDetail.noOfActiveQuizPoll + 1;
    const activeIds = await quizPollModel
      .find({ status: { $in: ["active", "running"] } })
      .sort({ updatedAt: -1 })
      .limit(limit);
    await quizPollModel.updateMany(
      { _id: { $nin: activeIds } },
      { $set: { status: "closed" } }
    );
  }

  // end here

  if (search) {
    findQuery["$and"].push({
      $or: [
        { title: { $regex: new RegExp(search, "i") } },
        {
          tags: { $elemMatch: { $regex: new RegExp(search, "i") } },
        },
      ],
    });
  }

  if (type) {
    findQuery["$and"].push({ type: type });
  }

  if (status && status === "live") {
    findQuery["$and"].push({ status: { $in: ["active", "running"] } });
  } else if (status && status === "inactive") {
    findQuery["$and"].push({
      status: { $in: ["pending", "closed", "deactivated", "order"] },
    });
  } else if (status && (status === "active" || status === "running")) {
    findQuery["$and"].push({
      status: status,
    });
  }

  if (order === "latest") {
    sort.isDated = "desc";
  } else if (order === "oldest") {
    sort.isDated = "asc";
  } else {
    sort.isDated = "desc";
  }

  const offset = page === 1 ? 0 : limit * (page - 1);

  const response = await quizPollModel
    .find(findQuery)
    .sort(sort)
    .skip(offset)
    .limit(limit)
    .populate({
      path: "coverImage",
      select: "url",
      model: FileModel,
    })
    .select(
      "type title code questions status startDateTime endDateTime coverImage createdAt updatedAt isDeleted isForEver"
    );

  const result = [];
  for (let obj of response) {
    let newObj = {
      type: obj.type,
      questions: obj.questions,
      status: obj.status,
      isDeleted: obj.isDeleted,
      _id: obj._id,
      title: obj.title,
      code: obj.code,
      startDateTime: obj.startDateTime,
      coverImage: obj.coverImage,
      endDateTime: obj.endDateTime,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
      isForEver: obj.isForEver,
    };
    newObj.totalParticipants = await PlayerModel.countDocuments({
      code: obj.code,
      isDeleted: null,
    });
    result.push(newObj);
  }

  return serviceResponse(
    true,
    HTTP_CODES.OK,
    MESSAGES.FETCH,
    pagination.getPagingData(
      {
        count: await quizPollModel.countDocuments(findQuery),
        rows: result,
      },
      page,
      limit
    )
  );
};

exports.updateQuizpollBuy = async () => {
  const updatedQuiz = await quizPollModel.updateMany(
    { createdFrom: { $ne: null } },
    { isPurchased: true }
  );

  if (!updatedQuiz) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.UPDATED, updatedQuiz);
};
