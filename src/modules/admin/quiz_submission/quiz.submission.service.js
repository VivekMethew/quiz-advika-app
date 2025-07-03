const { HTTP_CODES, CONSTANTS, MESSAGES } = require("../../../config");
const { quizPollModel } = require("../../../models/quiz.poll.model");
const { NotificationModel } = require("../../../models/notification.models");
const { serviceResponse } = require("../../../helpers/response");
const { pagination, logger } = require("../../../utils");
const { Category } = require("../../../models/category.model");
const { User } = require("../../../models/users.model");
const { QuestionModel } = require("../../../models/questions.model");
const { FileModel } = require("../../../models/files.model");

exports.getSubscriptions = async (query) => {
  let { search, isApproved, type, order, page, limit } = query;

  const findQuery = {};
  findQuery["$and"] = [];
  findQuery["$and"].push({ isDeleted: null });
  let sort = {};
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

  if (isApproved) {
    if (isApproved == "reject") {
      findQuery["$and"].push({ isApplied: false, isApproved: isApproved });
    } else if (isApproved == "pending") {
      findQuery["$and"].push({ isApplied: true, isApproved: isApproved });
    } else {
      findQuery["$and"].push({ isApplied: true, isApproved: isApproved });
    }
  } else {
    findQuery["$and"].push({ isApplied: true });
  }

  // if (isApproved) {
  //   findQuery["$and"].push({ isApproved: isApproved });
  // }

  if (type) {
    findQuery["$and"].push({ type: type });
  }

  if (order === "latest") {
    sort.isDated = "desc";
  } else if (order === "oldest") {
    sort.isDated = "asc";
  } else {
    sort.isDated = "desc";
  }

  if (!page && !limit) {
    page = 1;
    limit = 10;
  } else {
    page = parseInt(page);
    limit = parseInt(limit);
  }
  const offset = page === 1 ? 0 : limit * (page - 1);
  let response = await quizPollModel
    .find(findQuery)
    .sort(sort)
    .skip(offset)
    .limit(limit)
    .populate({ path: "userId", select: "_id fname lname email avatar",model: User })
    .populate({ path: "questions",
      populate: [
        {
          path: "thumbnail",
          select: "url",
          model: FileModel
        },
        {
          path: "image",
          select: "url",
          model: FileModel
        },
        {
          path:"customMessage.file",
          select: "url",
          model: FileModel
        }
      ],
      model: QuestionModel })
    .populate({ path: "catId",model: Category })
    .populate({
      path:"coverImage",
      select:"url",
      model:FileModel
    })
    .select(
      "code userId type title duration coverImage isApplied isApproved isPublished status isDated createdAt updatedAt"
    );

  let result = pagination.getPagingData(
    {
      count: await quizPollModel.countDocuments(findQuery),
      rows: response,
    },
    page,
    limit
  );
  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.SUBMISION_REQ, result);
};

exports.getMySubmissions = async (userId, query) => {
  let { search, isApproved, type, order, page, limit } = query;

  const findQuery = {};
  findQuery["$and"] = [];
  findQuery["$and"].push({ userId: userId, isDeleted: null });
  let sort = {};
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

  // if (isApproved) {
  //   findQuery["$and"].push({ isApproved: isApproved });
  // }
  if (isApproved) {
    if (isApproved == "reject") {
      findQuery["$and"].push({ isApplied: false, isApproved: isApproved });
    } else if (isApproved == "pending") {
      findQuery["$and"].push({ isApplied: true, isApproved: isApproved });
    } else {
      findQuery["$and"].push({ isApplied: true, isApproved: isApproved });
    }
  } else {
    findQuery["$and"].push({ isApplied: true });
  }

  if (type) {
    findQuery["$and"].push({ type: type });
  }

  if (order === "latest") {
    sort.isDated = "desc";
  } else if (order === "oldest") {
    sort.isDated = "asc";
  } else {
    sort.isDated = "desc";
  }

  if (!page && !limit) {
    page = 1;
    limit = 10;
  } else {
    page = parseInt(page);
    limit = parseInt(limit);
  }
  const offset = page === 1 ? 0 : limit * (page - 1);
  let response = await quizPollModel
    .find(findQuery)
    .sort(sort)
    .skip(offset)
    .limit(limit)
    .populate({ path: "userId", select: "_id fname lname email avatar",model: User })
    .populate({ path: "questions",
      populate: [
        {
          path: "thumbnail",
          select: "url",
          model: FileModel
        },
        {
          path: "image",
          select: "url",
          model: FileModel
        },
        {
          path:"customMessage.file",
          select: "url",
          model: FileModel
        }
      ],
      model: QuestionModel })
    .populate({ path: "catId",model: Category })
    .populate({
      path:"coverImage",
      select:"url",
      model:FileModel
    })
    .select(
      "code userId type title duration coverImage isApplied isApproved status isDated createdAt updatedAt"
    );

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

exports.getQuizPollDetail = async (id) => {
  let response = await quizPollModel
    .findOne({ _id: id, isApplied: true, isDeleted: null })
    .populate({ path: "questions",
      populate: [
        {
          path: "thumbnail",
          select: "url",
          model: FileModel
        },
        {
          path: "image",
          select: "url",
          model: FileModel
        },
        {
          path:"customMessage.file",
          select: "url",
          model: FileModel
        }
      ],
      model: QuestionModel })
    .populate({
      path:"coverImage",
      select:"url",
      model:FileModel
    })
    .populate({ path: "userId", select: "_id fname lname avatar" ,model: User})
    .select(
      "code userId type title duration coverImage isApplied isApproved status isDated createdAt updatedAt"
    );

  if (!response)
    return serviceResponse(false, HTTP_CODES.OK, MESSAGES.NOT_FOUND);

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.FETCH, response);
};

exports.replySubmissions = async (id, body) => {
  let findQuery = {
    _id: id,
    isApplied: true,
    isApproved: CONSTANTS.ADMIN.REQS.PENDING,
    isDeleted: null,
  };

  let payload = {};
  let response = await quizPollModel
    .findOne(findQuery)
    .populate({ path: "userId", select: "fname lname role",model: User })
    .select("title");

  if (!response)
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);

  if (body.suggestion && body.isApproved === CONSTANTS.ADMIN.REQS.APPROVED) {
    payload.suggestion = body.suggestion;
  }

  if (body.isRejectReason && body.isApproved === CONSTANTS.ADMIN.REQS.REJECT) {
    //payload.isApplied = false;
    payload.isRejectReason = body.isRejectReason;
  }

  if (response.userId.role === CONSTANTS.USER.ROLES.ADMIN) {
    payload.status = "active";
  }

  payload.price = body.price;
  payload.isApproved = body.isApproved;
  payload.isPaid = body.price > 0 ? true : false;
  payload.isDated = new Date();

  if (body.isApproved) {
    await NotificationModel.create({
      userId: response.userId._id,
      QuizPollId: response._id,
      title: response.title,
      content: response.title,
    });

    const categories = [];
    if (body.category) {
      for (const id of body.category) {
        const category = await Category.findOne({
          _id: id,
          isDeleted: null,
        });

        if (!category) {
          return serviceResponse(
            false,
            HTTP_CODES.NOT_FOUND,
            `Category with ID ${id} does not exist`
          );
        }

        categories.push(category._id);
      }
    }

    payload.categories = categories;
    payload.isSuggested = body.isSuggested;
  }

  if (body.isApproved === CONSTANTS.ADMIN.REQS.REJECT) {
    payload.isApplied = false;
    logger.info(payload);
  }

  // if (!payload.catId)
  //   return serviceResponse(
  //     false,
  //     HTTP_CODES.BAD_REQUEST,
  //     "Category must be required"
  //   );

  await quizPollModel.findOneAndUpdate(findQuery, payload, { new: true });

  return serviceResponse(
    true,
    HTTP_CODES.OK,
    body.isApproved === CONSTANTS.ADMIN.REQS.APPROVED
      ? MESSAGES.SUBMISION_APPROVED
      : MESSAGES.SUBMISION_REJECTED,
    {
      id: response._id,
      title: response.title,
    }
  );
};

exports.replySubmissionsUpdate = async (id, payload) => {
  let findQuery = {
    _id: id,
    isDeleted: null,
  };

  const response = await quizPollModel
    .findOne(findQuery)
    .populate({ path: "userId", select: "fname lname role",model: User })
    .select("title");

  if (!response)
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);

  payload.isPaid = payload.price > 0 ? true : false;

  if (payload.category) {
    for (const id of payload.category) {
      const category = await Category.findOne({
        _id: id,
        isDeleted: null,
      });

      if (!category) {
        return serviceResponse(
          false,
          HTTP_CODES.NOT_FOUND,
          `Category with ID ${id} does not exist`
        );
      }
    }
    payload.categories=payload.category;
  }

  payload.isDated = new Date();

  await quizPollModel.findOneAndUpdate(findQuery, payload);

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.UPDATED, {
    id: response._id,
    title: response.title,
  });
};

exports.addQuizSubmition = async (id, userId) => {
  let findQuery = {
    _id: id,
    userId: userId,
    isApplied: false,
    isDeleted: null,
  };
  const response = await quizPollModel
    .findOne(findQuery)
    .select("title isApplied addToFav");

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  await quizPollModel.findOneAndUpdate(findQuery, {
    isApplied: true,
    isDated: new Date(),
  });

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.APPLIED);
};
