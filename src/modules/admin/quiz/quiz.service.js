const { HTTP_CODES, MESSAGES, CONSTANTS, URLS } = require("../../../config");
const { serviceResponse } = require("../../../helpers/response");
const { QuestionModel } = require("../../../models/questions.model");
const { quizPollModel } = require("../../../models/quiz.poll.model");
const { pagination, logger } = require("../../../utils");
const { isQuestionsUsed } = require("../../../utils/array.object.keys");
const { qrCodeGenreate } = require("../../../utils/qrcode");
const { isQuestionsExists } = require("../../../utils/array.object.keys");
const fs = require("fs");
const { generateStartTimeEnd } = require("../../../utils/dateUtils");
const { FileModel } = require("../../../models/files.model");
const { User } = require("../../../models/users.model");
const { Category } = require("../../../models/category.model");
const { DEFAULT_IMAGE } = require("../../../config");

exports.addQuizPoll = async (payload) => {
  payload.isDated = new Date();

  const result = await qrCodeGenreate(payload.code);

  fs.unlink(result.filePath, (err) => {
    if (err) logger.error(err);
    logger.info("file has been deleted");
  });

  fs.unlink(result.outputPath, (err) => {
    if (err) logger.error(err);
    logger.info("file has been deleted");
  });
  payload.qrCodeLink = result.url;

  const isQuess = await QuestionModel.find({
    _id: { $in: payload.questions },
    isDeleted: null,
  });

  if (
    isQuess.length > 0 &&
    isQuess.map((obj) => obj.isWallOfFame).includes(true)
  ) {
    payload.isWallOfFame = true;
  }

  // const isQuestions = await isQuestionsUsed(payload.questions);

  // if (isQuestions) {
  //   return serviceResponse(
  //     false,
  //     HTTP_CODES.BAD_REQUEST,
  //     MESSAGES.QUISTIONS_USED
  //   );
  // }

  payload.qrCodeLink = result.url;
  payload.status = "active";
  payload.ratings = parseFloat((Math.random() * (5 - 3.5) + 3.5).toFixed(2));

  if (payload.type === "quiz") {
    if (!payload.coverImage) {
      payload.coverImage = DEFAULT_IMAGE.QUIZ_DEFAULT_IMAGE;
    }
  } else {
    if (!payload.coverImage) {
      payload.coverImage = DEFAULT_IMAGE.POLL_DEFAULT_IMAGE;
    }
  }

  const response = await quizPollModel.create(payload);
  if (!response) {
    return serviceResponse(false, HTTP_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST);
  }

  for (let i = 0; i < payload.questions.length; i++) {
    await QuestionModel.findOneAndUpdate(
      {
        _id: payload.questions[i],
        isDeleted: null,
      },
      { isUsed: true }
    );
  }

  return serviceResponse(true, HTTP_CODES.CREATED, MESSAGES.CREATED, response);
};

exports.getList = async (userId, query) => {
  let { page, limit, search, type, order, status, ApproveValues, Options } =
    query;
  const findQuery = {};
  let sort = {};
  findQuery["$and"] = [];
  findQuery["$and"].push({
    userId: userId,
    $or: [
      { $and: [{ isPurchased: false }, { createdFrom: null }] },
      {
        $or: [
          {
            $and: [
              { isCreatedFrom: true },
              { isPurchased: false },
              { createdFrom: { $ne: null } },
            ],
          },
          {
            $and: [{ isPurchased: true }, { createdFrom: { $ne: null } }],
          },
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
  // const usesDetail = await usesCountOfModerator(userId);
  // if (usesDetail.isActiveCount >= usesDetail.noOfActiveQuizPoll) {
  //   const activeIds = await quizPollModel.find({ status: "active" }).sort({ updatedAt: -1 }).limit(usesDetail.noOfActiveQuizPoll);
  //   // findQuery["$and"].push({
  //   //   _id: { $in: activeIds.map(doc => doc._id) }
  //   // });
  //   await quizPollModel.updateMany(
  //     { _id: { $nin: activeIds } },
  //     { $set: { status: "closed" } }
  //   );
  // }

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

  /*if (type) {
    findQuery["$and"].push({ type: type });
  }*/
  if (type == "quiz" || type == "poll") {
    findQuery["$and"].push({ type: type });
  }
  if (type == "favourites") {
    findQuery["$and"].push({ addToFav: userId, isDeleted: null });
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

  // Approving conditions

  if (ApproveValues == "Published") {
    findQuery["$and"].push({
      $or: [{ status: "active" }, { status: "running" }],
    });
  } else if (ApproveValues == "ToBeReviewed") {
    findQuery["$and"].push({ isApproved: "pending" });
  } else if (ApproveValues == "CompletedReviews") {
    findQuery["$and"].push({ isApproved: "approved" });
  } else if (ApproveValues == "Rejected") {
    findQuery["$and"].push({ isApproved: "reject" });
  }

  //for highest and lowest rating
  if (Options === "HighestRatings") {
    sort = { "ratings.rating": -1 };
  } else if (Options === "LowestRatings") {
    sort = { "ratings.rating": 1 };
  }

  // for highest price and lowest price
  else if (Options === "HighestPrice") {
    sort.price = "desc";
  } else if (Options === "LowestPrice") {
    sort.price = "asc";
  }

  // for Most Downloads
  else if (Options === "MostDownloads") {
    sort.purchaseCount = "desc";
  }

  // for free
  else if (Options == "Free") {
    findQuery["$and"].push({ isPaid: false });
  }

  const offset = page === 1 ? 0 : limit * (page - 1);

  const response = await quizPollModel
    .find(findQuery, { __v: 0 })
    .sort(sort)
    .skip(offset)
    .limit(limit)
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
      path: "userId",
      select: "_id role fname lname email status",
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

exports.updateOrdering = async (payload) => {
  for (let i = 0; i < payload.questions.length; i++) {
    await QuestionModel.findOneAndUpdate(
      {
        _id: payload.questions[i],
        isDeleted: null,
      },
      { position: i + 1 }
    );
  }
  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.UPDATED);
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
      path: "userId",
      select: "_id role fname lname email status",
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

exports.getListArchives = async (userId, query) => {
  let { page, limit, search, type, order, status } = query;
  const findQuery = {};
  let sort = {};
  findQuery["$and"] = [];
  findQuery["$and"].push({
    userId: userId,
    $or: [
      { $and: [{ isPurchased: false }, { createdFrom: null }] },
      { $and: [{ isPurchased: true }, { createdFrom: { $ne: null } }] },
    ],
    isArchives: true,
    isDeleted: null,
  });

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

  if (order === "latest") {
    sort.isDated = "desc";
  } else if (order === "oldest") {
    sort.isDated = "asc";
  } else {
    sort.isDated = "desc";
  }

  const offset = page === 1 ? 0 : limit * (page - 1);

  const response = await quizPollModel
    .find(findQuery, { __v: 0 })
    .sort(sort)
    .skip(offset)
    .limit(limit)
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
      path: "userId",
      select: "_id role fname lname email status",
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

exports.getSingleRecord = async (id, userId, query) => {
  const { isUsed, isCreatedByChatgpt } = query;
  let matchElem = { isDeleted: null };

  if (isUsed !== undefined && isUsed) {
    matchElem.isUsed = isUsed;
  }

  if (isCreatedByChatgpt !== undefined && isCreatedByChatgpt) {
    matchElem.isCreatedByChatgpt = isCreatedByChatgpt;
  }

  let response = await quizPollModel
    .findOne({ _id: id, isDeleted: null }, { __v: 0 })
    .populate({
      path: "questions",
      match: matchElem,
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
      path: "userId",
      select: "_id role fname lname email status",
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

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  // const isMatched = await QuestionModel.find({
  //   userId: userId,
  //   isUsed: false,
  //   isDeleted: null,
  // });

  // response.questions.push(...isMatched);

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.FETCH, response);
};

exports.addArchivesRecord = async (id) => {
  const response = await quizPollModel.findOneAndUpdate(
    { _id: id, isArchives: false, isDeleted: null },
    { isArchives: true },
    { new: true }
  );
  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.UPDATED);
};

exports.updateSingleRecord = async (id, payload) => {
  let findQuery = {};

  findQuery._id = id;
  findQuery.isDeleted = null;

  const isQuestions = await isQuestionsExists(payload.questions);

  if (!isQuestions) {
    return serviceResponse(
      false,
      HTTP_CODES.BAD_REQUEST,
      MESSAGES.INVALID_QUISTIONS
    );
  }

  for (let i = 0; i < payload.questions.length; i++) {
    await QuestionModel.findOneAndUpdate(
      {
        _id: payload.questions[i],
        isDeleted: null,
      },
      { isUsed: true }
    );
  }

  if (payload.questions) {
    const isQuess = await QuestionModel.find({
      _id: { $in: payload.questions },
      isDeleted: null,
    });

    if (
      isQuess.length > 0 &&
      isQuess.map((obj) => obj.isWallOfFame).includes(true)
    ) {
      payload.isWallOfFame = true;
    } else {
      payload.isWallOfFame = false;
    }
  }

  const response = await quizPollModel.findOneAndUpdate(findQuery, payload);
  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }
  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.UPDATED, response);
};

exports.bulkQuizPollActivated = async (payload) => {
  for (let i = 0; i < payload.ids.length; i++) {
    const response = await quizPollModel.findOne({
      _id: payload.ids[i],
      isDeleted: null,
    });
    const { startISO, endISO, timezon } = generateStartTimeEnd(
      new Date(),
      response.duration
    );
    await quizPollModel.findOneAndUpdate(
      {
        _id: payload.ids[i],
        isDeleted: null,
      },
      {
        startDateTime: startISO,
        endDateTime: endISO,
        timezon: timezon,
        status: "active",
        isDated: new Date(),
      }
    );
  }

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.QUIZPOLLACTIVATED);
};

exports.bulkQuizPollDeActivated = async (payload) => {
  for (let i = 0; i < payload.ids.length; i++) {
    await quizPollModel.findOneAndUpdate(
      {
        _id: payload.ids[i],
        isDeleted: null,
      },
      {
        status: "deactivated",
        isDated: new Date(),
      }
    );
  }

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.QUIZPOLLDEACTIVATED);
};

exports.bulkQuizPollDelete = async (payload) => {
  for (let i = 0; i < payload.ids.length; i++) {
    await quizPollModel.findOneAndUpdate(
      {
        _id: payload.ids[i],
        isDeleted: null,
      },
      { isDeleted: new Date() }
    );
  }

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.DELETED);
};

exports.deleteSingleRecord = async (id) => {
  const response = await quizPollModel.findOneAndUpdate(
    { _id: id, isDeleted: null },
    { isDeleted: new Date() },
    { new: true }
  );
  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }
  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.DELETED, {
    id: response._id,
  });
};

exports.createRatings = async (id, payload) => {
  const response = await quizPollModel.findOneAndUpdate(
    { _id: id, "ratings.userId": { $ne: payload.userId }, isDeleted: null },
    { $addToSet: { ratings: payload } }
  );
  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }
  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.DELETED, response);
};

exports.updateRatings = async (id, payload) => {
  let findQuery = {};
  findQuery._id = id;
  findQuery.isDeleted = null;
  if (payload.rating < 4.5) {
    payload.rating = parseFloat((Math.random() * (5 - 4.5) + 4.5).toFixed(2));
  }
  /*findQuery["ratings.userId"] = payload.userId;
  
  const response = await quizPollModel.updateOne(findQuery, {
    $set: { "ratings.$": payload },
  });
  console.log("res", response);
  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }
  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.UPDATED, response);*/
  const response = await quizPollModel.findOneAndUpdate(findQuery, {
    $set: { ratings: payload.rating },
  });
  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }
  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.UPDATED, response);
};

exports.deleteRatings = async (id, payload) => {
  let findQuery = {};
  findQuery._id = id;
  findQuery.isDeleted = null;
  findQuery["ratings.userId"] = payload.id;
  const response = await quizPollModel.updateOne(findQuery, {
    $pull: { userId: payload.id },
  });
  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }
  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.DELETED, response);
};
