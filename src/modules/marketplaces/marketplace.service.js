const { HTTP_CODES, MESSAGES, CONSTANTS } = require("../../config");
const { serviceResponse } = require("../../helpers/response");
const { quizPollModel } = require("../../models/quiz.poll.model");
const { pagination } = require("../../utils");
const { OrderModel } = require("../../models/orders.model");
const { User } = require("../../models/users.model");
const { Category } = require("../../models/category.model");
const { QuestionModel } = require("../../models/questions.model");
const { FileModel } = require("../../models/files.model");

exports.getList = async (query) => {
  let { page, limit, search, type, order, catId, Options } = query;

  const findQuery = {};
  findQuery["$and"] = [];
  findQuery["$and"].push({
    isApplied: true,
    isPublished: false,
    isApproved: CONSTANTS.ADMIN.REQS.APPROVED,
    isDeleted: null,
  });

  let sort = {};
  if (!page && !limit) {
    page = 1;
    limit = 10;
  } else if (!page && limit) {
    page = 1;
    limit = parseInt(limit);
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

  if (order === "latest") {
    sort.isDated = -1;
  } else if (order === "oldest") {
    sort.isDated = 1;
  } else {
    sort.isDated = -1;
  }

  if (catId) {
    findQuery["$and"].push({ catId: catId });
  }

  //Both or Price or Free
  if (Options == "Both") {
    findQuery["$and"].push({
      $or: [{ isPaid: true }, { isPaid: false }],
    });
  } else if (Options == "Free") {
    findQuery["$and"].push({ isPaid: false });
  } else if (Options == "Price") {
    findQuery["$and"].push({ isPaid: true });
  }

  const offset = page === 1 ? 0 : limit * (page - 1);

  const pipeline = [
    {
      $match: findQuery,
    },
    {
      $sort: sort,
    },
    {
      $limit: limit,
    },
    {
      $skip: offset,
    },
    {
      $lookup: {
        from: "questions",
        localField: "questions",
        foreignField: "_id",
        as: "questions",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "User",
      },
    },
    {
      $lookup: {
        from: "categories",
        let: { categoryId: "$catId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$categoryId"],
              },
            },
          },
        ],
        as: "catId",
      },
    },
    {
      $unwind: {
        path: "$catId",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        catId: {
          $cond: {
            if: { $eq: ["$catId", null] },
            then: null,
            else: "$catId", // change this to "category"
          },
        },
      },
    },
    {
      $lookup: {
        from: "quizpolls",
        localField: "_id",
        foreignField: "createdFrom",
        as: "quizss",
      },
    },
    {
      $lookup: {
        from: "orders",
        localField: "_id",
        foreignField: "quizAndPollId",
        as: "order",
      },
    },
    {
      $unwind: "$User",
    },
    {
      $project: {
        type: 1,
        questions: 1,
        description: 1,
        coverImage: 1,
        tags: 1,
        timezon: 1,
        qrCodeLink: 1,
        ratings: 1,
        addToFav: 1,
        price: 1,
        isPublished: 1,
        isPaid: 1,
        isApplied: 1,
        isApproved: 1,
        isRejectReason: 1,
        suggestion: 1,
        status: 1,
        createdFrom: 1,
        isArchives: 1,
        isCreatedFrom: 1,
        purchaseCount: 1,
        isDated: 1,
        isDeleted: 1,
        isAutostart: 1,
        _id: 1,
        title: 1,
        catId: 1,
        isSuggested: 1,
        startDateTime: 1,
        endDateTime: 1,
        duration: 1,
        code: 1,
        user: {
          _id: "$User._id",
          role: "$User.role",
          fname: "$User.fname",
          lname: "$User.lname",
          email: "$User.email",
          status: "$User.status",
        },
        quizss: "$quizss._id",
        order: "$order",
        // orderDetails: "$orderDetails",
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ];

  const response = await quizPollModel.aggregate(pipeline);

  const filteredResponse = await Promise.all(
    response.map(async (item) => {
      const order = item.order
        .filter((order) => order.paymentStatus === "paid")
        .map((order) => order.userId);

      const response = await quizPollModel
        .find({
          _id: { $in: item.quizss },
          isDeleted: null,
        })
        .select("userId isDeleted");

      const freeOrder = response
        .map((obj) => obj.userId)
        .filter(
          (quiz) =>
            !item.order
              .map((order) => order.userId)
              .some((o) => o.isCreatedFrom === quiz.userId)
        );

      return {
        ...item,
        order: [...order, ...freeOrder],
      };
    })
  );

  return serviceResponse(
    true,
    HTTP_CODES.OK,
    MESSAGES.FETCH,
    pagination.getPagingData(
      {
        count: await quizPollModel.countDocuments(findQuery),
        rows:
          sort.isDated === -1
            ? filteredResponse.sort((a, b) => b.isDated - a.isDated)
            : filteredResponse.sort((a, b) => a.isDated - b.isDated),
      },
      page,
      limit
    )
  );
};

exports.getTestList = async (query) => {
  let { page, limit, search, type, order, catId, Options } = query;

  const findQuery = {};
  findQuery["$and"] = [];
  findQuery["$and"].push({
    isApplied: true,
    isPublished: false,
    isApproved: CONSTANTS.ADMIN.REQS.APPROVED,
    isDeleted: null,
  });

  let sort = {};
  if (!page && !limit) {
    page = 1;
    limit = 10;
  } else if (!page && limit) {
    page = 1;
    limit = parseInt(limit);
  } else {
    page = 1;
    limit = parseInt(limit);
  }

  // search = "xcbcxb";

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

  if (order === "latest") {
    sort.isDated = -1;
  } else if (order === "oldest") {
    sort.isDated = 1;
  } else {
    sort.isDated = -1;
  }

  // for category
  if (catId) {
    if (Array.isArray(catId)) {
      findQuery["$and"].push({ categories: { $in: catId } });
    } else {
      const categories = catId.map((obj) => obj._id);
      findQuery["$and"].push({ categories: categories });
    }
  }

  //Both or Price or Free
  if (Options == "Both") {
    findQuery["$and"].push({
      $or: [{ isPaid: true }, { isPaid: false }],
    });
  } else if (Options == "Free") {
    findQuery["$and"].push({ isPaid: false });
  } else if (Options == "Price") {
    findQuery["$and"].push({ isPaid: true });
  }

  const offset = page === 1 ? 0 : limit * (page - 1);

  let response = await quizPollModel
    .find(findQuery)
    .sort(sort)
    .skip(offset)
    .limit(limit)
    .populate({
      path: "userId",
      select: "role fname lname email status",
      model: User,
    })
    .populate({
      path: "catId",
      select: "isTrending status name color",
      model: Category,
    })
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

  const filteredResponse = await Promise.all(
    response.map(async (item) => {
      const response = await quizPollModel.find({
        createdFrom: item._id,
        isDeleted: null,
      });

      const orders = await OrderModel.find({
        quizAndPollId: item._id,
        isDeleted: null,
      });

      const order = orders
        .filter((item) => item.paymentStatus === "paid")
        .map((order) => order.userId);

      const freeOrder = response
        .map((obj) => obj.userId)
        .filter(
          (quiz) =>
            !orders
              .map((order) => order.userId)
              .some((o) => o.isCreatedFrom === quiz.userId)
        );

      return {
        _id: item._id,
        type: item.type,
        questions: item.questions,
        description: item.description,
        coverImage: item.coverImage,
        tags: item.tags,
        timezon: item.timezon,
        qrCodeLink: item.qrCodeLink,
        isSuggested: item.isSuggested,
        ratings: item.ratings,
        addToFav: item.addToFav,
        price: item.price,
        isPaid: item.isPaid,
        isApplied: item.isApplied,
        isApproved: item.isApproved,
        isRejectReason: item.isRejectReason,
        suggestion: item.suggestion,
        status: item.status,
        createdFrom: item.createdFrom,
        isArchives: item.isArchives,
        isCreatedFrom: item.isCreatedFrom,
        purchaseCount: item.purchaseCount,
        isDated: item.isDated,
        isDeleted: item.isDeleted,
        isAutostart: item.isAutostart,
        isPublished: item.isPublished,
        title: item.title,
        catId: item.catId,
        startDateTime: item.startDateTime,
        endDateTime: item.endDateTime,
        duration: item.duration,
        code: item.code,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        user: item.userId,
        quizss: order.map((item) => item.userId),
        order: [...order, ...freeOrder],
      };
    })
  );

  return serviceResponse(
    true,
    HTTP_CODES.OK,
    MESSAGES.FETCH,
    pagination.getPagingData(
      {
        count: await quizPollModel.countDocuments(findQuery),
        rows: filteredResponse,
      },
      page,
      limit
    )
  );
};

exports.getWebsiteList = async (query) => {
  let { page, limit, search, type, order, catId, Options } = query;

  const findQuery = {};
  findQuery["$and"] = [];
  findQuery["$and"].push({
    isApplied: true,
    isPublished: false,
    isApproved: CONSTANTS.ADMIN.REQS.APPROVED,
    isDeleted: null,
  });

  let sort = {};
  if (!page && !limit) {
    page = 1;
    limit = 10;
  } else if (!page && limit) {
    page = 1;
    limit = parseInt(limit);
  } else {
    page = 1;
    limit = parseInt(limit);
  }

  // search = "xcbcxb";

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

  if (order === "latest") {
    sort.isDated = -1;
  } else if (order === "oldest") {
    sort.isDated = 1;
  } else {
    sort.isDated = -1;
  }

  // for category
  if (catId) {
    if (Array.isArray(catId)) {
      findQuery["$and"].push({ catId: { $in: catId } });
    } else {
      findQuery["$and"].push({ catId: catId });
    }
  }

  //Both or Price or Free
  if (Options == "Both") {
    findQuery["$and"].push({
      $or: [{ isPaid: true }, { isPaid: false }],
    });
  } else if (Options == "Free") {
    findQuery["$and"].push({ isPaid: false });
  } else if (Options == "Price") {
    findQuery["$and"].push({ isPaid: true });
  }

  const offset = page === 1 ? 0 : limit * (page - 1);

  const response = await quizPollModel
    .find(findQuery)
    .sort(sort)
    .skip(offset)
    .limit(limit)
    .populate({
      path: "userId",
      select: "role fname lname email status",
      model: User,
    })
    .populate({
      path: "catId",
      select: "isTrending status name color",
      model: Category,
    })
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

  const filteredResponse = await Promise.all(
    response.map(async (item) => {
      return {
        _id: item._id,
        type: item.type,
        questions: item.questions.length,
        description: item.description,
        coverImage: item.coverImage,
        tags: item.tags,
        isForEver: item.isForEver,
        isSuggested: item.isSuggested,
        ratings: item.ratings,
        price: item.price,
        isPaid: item.isPaid,
        status: item.status,
        createdFrom: item.createdFrom,
        isCreatedFrom: item.isCreatedFrom,
        isDeleted: item.isDeleted,
        title: item.title,
        catId: item.catId,
        duration: item.duration,
        code: item.code,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        user: item.userId,
      };
    })
  );

  return serviceResponse(
    true,
    HTTP_CODES.OK,
    MESSAGES.FETCH,
    pagination.getPagingData(
      {
        count: await quizPollModel.countDocuments(findQuery),
        rows: filteredResponse,
      },
      page,
      limit
    )
  );
};

exports.getPreview = async (id) => {
  let response = await quizPollModel
    .findOne({ _id: id, isDeleted: null }, { __v: 0 })
    .populate({
      path: "questions",
      match: { isDeleted: null },
      populate: [
        {
          path: "image",
          model: FileModel,
        },
        {
          path: "thumbnail",
          model: FileModel,
        },
        {
          path: "customMessage.file",
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
      select: "name status isTrending",
      model: Category,
    })
    .populate({
      path: "coverImage",
      model: FileModel,
    });

  if (!response)
    return serviceResponse(true, HTTP_CODES.OK, MESSAGES.NOT_FOUND);

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.FETCH, response);
};

exports.getByQuizCode = async (code) => {
  let response = await quizPollModel
    .findOne({ code: code, isDeleted: null }, { __v: 0 })
    .populate({
      path: "questions",
      match: { isDeleted: null },
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
      select: "_id role fname lname email status",
      model: User,
    })
    .populate({
      path: "catId",
      select: "name status isTrending",
      model: Category,
    })
    .populate({
      path: "coverImage",
      select: "url",
      model: FileModel,
    });

  if (!response)
    return serviceResponse(true, HTTP_CODES.OK, MESSAGES.NOT_FOUND);

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.FETCH, response);
};

exports.getAdminList = async (query) => {
  let { page, limit, search, type, order, catId, Options, published } = query;

  const findQuery = {};
  findQuery["$and"] = [];

  findQuery["$and"].push({
    isApplied: true,
    isApproved: CONSTANTS.ADMIN.REQS.APPROVED,
    isDeleted: null,
  });

  let sort = {};
  if (!page && !limit) {
    page = 1;
    limit = 10;
  } else if (!page && limit) {
    page = 1;
    limit = parseInt(limit);
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

  if (catId) {
    findQuery["$and"].push({ catId: catId });
  }

  if (type) {
    findQuery["$and"].push({ type: type });
  }

  if (order === "latest") {
    sort.isDated = -1;
  } else if (order === "oldest") {
    sort.isDated = 1;
  } else {
    sort.isDated = -1;
  }

  //Both or Price or Free
  if (Options == "Both") {
    findQuery["$and"].push({
      $or: [{ isPaid: true }, { isPaid: false }],
    });
  } else if (Options == "Free") {
    findQuery["$and"].push({ isPaid: false });
  } else if (Options == "Price") {
    findQuery["$and"].push({ isPaid: true });
  }

  if (published && JSON.parse(published) === true) {
    findQuery["$and"].push({ isPublished: true });
  } else if (published && JSON.parse(published) == false) {
    findQuery["$and"].push({ isPublished: false });
  }

  const offset = page === 1 ? 0 : limit * (page - 1);

  const pipeline = [
    {
      $match: findQuery,
    },
    {
      $sort: sort,
    },
    {
      $limit: limit,
    },
    {
      $skip: offset,
    },
    {
      $lookup: {
        from: "questions",
        localField: "questions",
        foreignField: "_id",
        as: "questions",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "User",
      },
    },
    {
      $lookup: {
        from: "categories",
        let: { categoryId: "$catId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$categoryId"],
              },
            },
          },
        ],
        as: "catId",
      },
    },
    {
      $unwind: {
        path: "$catId",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        catId: {
          $cond: {
            if: { $eq: ["$catId", null] },
            then: null,
            else: "$catId", // change this to "category"
          },
        },
      },
    },
    {
      $lookup: {
        from: "quizpolls",
        localField: "_id",
        foreignField: "createdFrom",
        as: "quizss",
      },
    },
    {
      $lookup: {
        from: "orders",
        localField: "_id",
        foreignField: "quizAndPollId",
        as: "order",
      },
    },
    {
      $unwind: "$User",
    },
    {
      $project: {
        type: 1,
        questions: 1,
        description: 1,
        coverImage: 1,
        tags: 1,
        timezon: 1,
        qrCodeLink: 1,
        ratings: 1,
        addToFav: 1,
        price: 1,
        isPaid: 1,
        isPublished: 1,
        isApplied: 1,
        isApproved: 1,
        isRejectReason: 1,
        suggestion: 1,
        status: 1,
        createdFrom: 1,
        isArchives: 1,
        isCreatedFrom: 1,
        purchaseCount: 1,
        isDated: 1,
        isDeleted: 1,
        isAutostart: 1,
        _id: 1,
        title: 1,
        catId: 1,
        isSuggested: 1,
        startDateTime: 1,
        endDateTime: 1,
        duration: 1,
        code: 1,
        user: {
          _id: "$User._id",
          role: "$User.role",
          fname: "$User.fname",
          lname: "$User.lname",
          email: "$User.email",
          status: "$User.status",
        },
        quizss: "$quizss.userId",
        order: "$order",
        // orderDetails: "$orderDetails",
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ];

  const response = await quizPollModel.aggregate(pipeline);

  const filteredResponse = response.map((item) => {
    const order = item.order
      .filter((order) => order.paymentStatus === "paid")
      .map((order) => order.userId);

    const freeOrder = item.quizss.filter(
      (quiz) =>
        !item.order
          // .filter((order) => order.status === "success")
          .map((order) => order.userId)
          .some((o) => o.isCreatedFrom === quiz.userId)
    );

    return {
      ...item,
      order: [...order, ...freeOrder],
    };
  });

  return serviceResponse(
    true,
    HTTP_CODES.OK,
    MESSAGES.FETCH,
    pagination.getPagingData(
      {
        count: await quizPollModel.countDocuments(findQuery),
        rows:
          sort.isDated === -1
            ? filteredResponse.sort((a, b) => b.isDated - a.isDated)
            : filteredResponse.sort((a, b) => a.isDated - b.isDated),
      },
      page,
      limit
    )
  );
};
