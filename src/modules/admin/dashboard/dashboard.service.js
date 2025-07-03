const { HTTP_CODES, MESSAGES, CONSTANTS } = require("../../../config");
const { serviceResponse } = require("../../../helpers/response");
const { OrderModel } = require("../../../models/orders.model");
const { MySubscriptionModel } = require("../../../models/plans.selected.model");
const { PlayerModel } = require("../../../models/player.model");
const { quizPollModel } = require("../../../models/quiz.poll.model");
const { VrPasscodeModel } = require("../../../models/vr.password");
const {
  ModeratorDeactivationLog,
} = require("../../../models/moderator.deactivation.log");
const { NotificationModel } = require("../../../models/notification.models");
const {
  SubscriptionsModel,
} = require("../../../models/subsription.plans.model");
const { User } = require("../../../models/users.model");
const { donwloadReport } = require("../../../utils/PdfGenerator");
const { QuestionModel } = require("../../../models/questions.model");
const { generateQuizPollCode } = require("../../../utils/generate.utils");
const {
  generateStartTimeEnd,
  calculateTime,
} = require("../../../utils/dateUtils");
const { pagination, RDS } = require("../../../utils");
const { getExiredPlanDateAndTime } = require("../../../utils/plans.utils");
const { FileModel } = require("../../../models/files.model");
const { NotFoundException } = require("../../../helpers/errorResponse");
const { radisPublishAction } = require("../../../utils/radis.action");
const { REDIS } = require("../../../config/constants");

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

/*exports.getModerators = async (query) => {
  let { page, limit, search, startDate, endDate, status, planTypes, validity } =
    query;
  const findQuery = {};
  findQuery["$and"] = [];
  findQuery["$and"].push({
    role: CONSTANTS.USER.ROLES.MODERATOR,
    isDeleted: null,
  });
  let result = [];

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
        { fname: { $regex: new RegExp(search, "i") } },
        { lname: { $regex: new RegExp(search, "i") } },
        { email: { $regex: new RegExp(search, "i") } },
      ],
    });
  }

  if (startDate && endDate) {
    findQuery["$and"].push({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });
  }

  const offset = page === 1 ? 0 : limit * (page - 1);
  var count = 0;
  const response = await User.find(findQuery).skip(offset).limit(limit);

  for (let item of response) {
    let payload = {
      role: item.role,
      isAuth: item.isAuth,
      fname: item.fname,
      lname: item.lname,
      email: item.email,
      phone: item.phone,
      description: item.description,
      avatar: item.avatar,
      isBlock: item.isBlock,
      status: item.status,
      priority: item.priority,
      isDeleted: item.isDeleted,
      _id: item._id,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };

    let findSubsciption = {
      purchasedBy: item._id,
      isDeleted: null,
    };
    if (validity) {
      findSubsciption.planDurationType = validity;
    }

    //active or inactive
    if (status) {
      findSubsciption.status = status;
    }

    
    if (planTypes) {
      findSubsciption["subId"] = {
        $in: await SubscriptionsModel.find({ name: planTypes }).distinct("_id"),
      };
    }

    const subscription = await MySubscriptionModel.findOne(
      findSubsciption
    ).populate({
      path: "subId",
    });

    if (subscription) {
      payload.subscription = subscription;
      result.push(payload);
      count++;
    } else {
      payload.subscription = null;
    }
    //result.push(payload);
  }

  //loop ends here
  const data = pagination.getPagingData(
    {
      count: count,
      rows: result,
    },
    page,
    limit
  );

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.FETCH, data);
};*/

//modified
exports.getModerators = async (query) => {
  let {
    page,
    limit,
    order,
    search,
    startDate,
    endDate,
    status,
    planTypes,
    validity,
    sortFeild,
    isBlock,
  } = query;

  const findQuery = {};

  let sort = {};

  findQuery["$and"] = [];
  findQuery["$and"].push({
    role: CONSTANTS.USER.ROLES.MODERATOR,
    isDeleted: null,
  });
  var result = [];
  var findSubsciption = {
    isDeleted: null,
  };

  if (!page && !limit) {
    page = 1;
    limit = 10;
  } else {
    page = parseInt(page);
    limit = parseInt(limit);
  }

  // changed

  if (sortFeild === "Date") {
    if (order === "descend") {
      sort.createdAt = -1;
    } else if (order === "ascend") {
      sort.createdAt = 1;
    } else {
      sort.createdAt = -1;
    }
  } else if (sortFeild === "Name") {
    if (order === "descend") {
      sort.sortingName = -1;
    } else if (order === "ascend") {
      sort.sortingName = 1;
    } else {
      sort.sortingName = -1;
    }
  } else if (sortFeild === "Email") {
    if (order === "descend") {
      sort.email = -1;
    } else if (order === "ascend") {
      sort.email = 1;
    } else {
      sort.email = -1;
    }
  } else {
    if (order === "descend") {
      sort.name = -1;
    } else if (order === "ascend") {
      sort.name = 1;
    } else {
      sort.name = -1;
    }
  }

  if (search) {
    findQuery["$and"].push({
      $or: [
        {
          $expr: {
            $regexMatch: {
              input: {
                $cond: [
                  { $eq: ["$lname", null] },
                  "$fname",
                  { $concat: ["$fname", " ", "$lname"] },
                ],
              },
              regex: new RegExp(search, "i"),
            },
          },
        },
        { email: { $regex: new RegExp(search, "i") } },
        { idd: search },
      ],
    });
  }

  if (startDate && endDate) {
    const startD = new Date(startDate);
    const endD = new Date(endDate);

    startD.setHours(0, 0, 0, 0);
    endD.setHours(23, 59, 59, 999);

    findQuery["$and"].push({
      createdAt: {
        $gte: startD,
        $lte: endD,
      },
    });
  }

  const totalResults = await User.countDocuments(findQuery);
  const totalPages = Math.ceil(totalResults / limit);
  if (page > totalPages) page = totalPages;

  // const offset = page === 1 ? 0 : limit * (page - 1);
  const offset = Math.max(0, limit * (page - 1));

  if (validity) {
    findSubsciption.planDurationType = validity;
  }

  //active or inactive
  if (status) {
    findSubsciption.status = status;
  }

  /*if (planTypes) {
    findSubsciption["subId"] = {
      $in: await SubscriptionsModel.find({ name: planTypes }).distinct("_id"),
    };
  }*/

  if (planTypes) {
    if (planTypes !== "trial") {
      findSubsciption["subId"] = await SubscriptionsModel.find({
        name: planTypes,
      }).distinct("_id");
    } else {
      findSubsciption["subId"] = await SubscriptionsModel.findOne({
        name: "trial",
      }).distinct("_id");
    }
  }

  if (isBlock) {
    findQuery["$and"].push({
      isBlock: true,
    });
  }

  const userIds =
    await MySubscriptionModel.findOne(findSubsciption).distinct("purchasedBy");
  findQuery["$and"].push({ _id: { $in: userIds } });

  const response = await User.aggregate([
    {
      $match: findQuery,
    },
    {
      $lookup: {
        from: "mysubscriptions",
        localField: "_id",
        foreignField: "purchasedBy",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $lookup: {
        from: "subscriptionplans",
        localField: "user.subId",
        foreignField: "_id",
        as: "subs",
      },
    },
    {
      $unwind: "$subs",
    },
    {
      $addFields: {
        name: {
          $cond: {
            if: { $eq: ["$subs.name", "trial"] },
            then: "freemium",
            else: "$subs.name",
          },
        },
        sortingName: {
          $toLower: { $concat: ["$fname", "", { $ifNull: ["$lname", ""] }] },
        },
      },
    },
    {
      $group: {
        _id: "$_id",
        doc: { $first: "$$ROOT" },
      },
    },
    {
      $replaceRoot: { newRoot: "$doc" },
    },
    {
      $sort: sort,
    },
    {
      $skip: offset,
    },
    {
      $limit: limit,
    },
  ]);

  let payload = {};
  for (let item of response) {
    payload = {
      role: item.role,
      idd: item.idd,
      isAuth: item.isAuth,
      fname: item.fname,
      lname: item.lname,
      email: item.email,
      phone: item.phone,
      description: item.description,
      avatar: item.avatar,
      isBlock: item.isBlock,
      status: item.status,
      priority: item.priority,
      isDeleted: item.isDeleted,
      _id: item._id,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };

    const subscription = await MySubscriptionModel.findOne({
      purchasedBy: item._id,
    }).populate({
      path: "subId",
      model: SubscriptionsModel,
    });

    if (subscription) {
      payload.subscription = subscription;
    } else {
      payload.subscription = null;
    }

    result.push(payload);
  }

  const data = pagination.getPagingData(
    {
      count: await User.countDocuments(findQuery),
      rows: result,
    },
    page,
    limit
  );

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.FETCH, data);
};

exports.getModeratorsDeactivationLog = async (query) => {
  let { page, limit, order } = query;

  if (!page && !limit) {
    page = 1;
    limit = 10;
  } else {
    page = parseInt(page);
    limit = parseInt(limit);
  }

  let sort = {};

  if (order === "latest") {
    sort.createdAt = "desc";
  } else if (order === "oldest") {
    sort.createdAt = "asc";
  } else {
    sort.createdAt = "desc";
  }

  const offset = page === 1 ? 0 : limit * (page - 1);

  const response = await ModeratorDeactivationLog.find({})
    .sort(sort)
    .skip(offset)
    .limit(limit);

  const data = pagination.getPagingData(
    {
      count: await ModeratorDeactivationLog.countDocuments({}),
      rows: response,
    },
    page,
    limit
  );

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.FETCH, data);
};

exports.unablePlatinumTrial = async (id) => {
  const findQuery = {};
  findQuery["$and"] = [];
  findQuery["$and"].push({
    purchasedBy: id,
    isDeleted: null,
  });

  const response = await MySubscriptionModel.findOne(findQuery).populate({
    path: "subId",
    select: "name",
    model: SubscriptionsModel,
  });

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  if (response.subId.name === "platinum") {
    return serviceResponse(
      false,
      HTTP_CODES.FORBIDDEN,
      MESSAGES.EXISTED_PLATUNUM_USER
    );
  }

  if (!response.isPlatinumTrial) {
    await MySubscriptionModel.findOneAndUpdate(
      findQuery,
      { isPlatinumTrial: true },
      { new: true }
    );
  } else {
    await MySubscriptionModel.findOneAndUpdate(
      findQuery,
      { isPlatinumTrial: true },
      { new: false }
    );
  }

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.TRIAL_PLATINUM_ACTIVE);
};

exports.enableUnlimitedUser = async (id) => {
  const findQuery = {};
  findQuery["$and"] = [];
  findQuery["$and"].push({
    purchasedBy: id,
    isDeleted: null,
  });

  const response = await MySubscriptionModel.findOne(findQuery);

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  if (!response.isAddonPurchaseUnlimited) {
    await MySubscriptionModel.findOneAndUpdate(
      findQuery,
      { isAddonPurchaseUnlimited: true },
      { new: true }
    );
  } else {
    await MySubscriptionModel.findOneAndUpdate(
      findQuery,
      { isAddonPurchaseUnlimited: false },
      { new: true }
    );
  }

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.UNLIMITED_USER_UPDATED);
};

exports.disablePlatinumTrial = async (id) => {
  const findQuery = {};
  findQuery["$and"] = [];
  findQuery["$and"].push({
    purchasedBy: id,
    isDeleted: null,
  });

  const response = await MySubscriptionModel.findOne(findQuery);

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  const upgradePlan = await SubscriptionsModel.findOne({
    name: CONSTANTS.PLAN_NAMES.TRIAL,
    isDeleted: null,
  }).select("name monthlyPrice annuallyPrice");

  if (!upgradePlan) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  const payload = this.useTrialPlanChooses(
    response.holdSubId ? response.holdSubId : upgradePlan._id
  );

  await MySubscriptionModel.findOneAndUpdate(findQuery, payload, { new: true });

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.TRIAL_PLATINUM_DEACTIVE);
};

exports.useTrialPlanChooses = (planId) => {
  let payload = {};
  payload.planDurationType = "monthly";
  payload.purchasedDate = new Date();
  payload.expiredOnDate = getExiredPlanDateAndTime(
    payload.planDurationType,
    payload.purchasedDate
  ).expiredOnDate;

  payload.subId = planId;
  payload.isPlatinumTrial = false;
  payload.startTrial = null;

  payload.endTrial = null;

  payload.paymentDetails = {
    method: "UPI",
    transactionId: "ssjdjdii556464464",
    metadata: "metadata",
  };

  return payload;
};

exports.deactivateModeratorAccount = async (id, adminEmail) => {
  const findQuery = {};
  findQuery["$and"] = [];
  findQuery["$and"].push({ _id: id, isDeleted: null });

  const response = await User.findOne(findQuery);

  if (!response)
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);

  if (!response.isBlock) {
    await User.findOneAndUpdate(findQuery, { isBlock: true }, { new: true });
    const response = await MySubscriptionModel.findOneAndUpdate(
      { purchasedBy: id },
      { status: "inactive" },
      { new: true }
    );
    await ModeratorDeactivationLog.create({
      type: "deactivation",
      performedTo: response.email,
      performedBy: adminEmail,
      performedAt: new Date(),
    });
    return serviceResponse(
      true,
      HTTP_CODES.OK,
      MESSAGES.MODERATOR_DEACTIVATED,
      response
    );
  } else {
    await User.findOneAndUpdate(findQuery, { isBlock: false }, { new: true });
    const response = await MySubscriptionModel.findOneAndUpdate(
      { purchasedBy: id },
      { status: "active" },
      { new: true }
    );
    await ModeratorDeactivationLog.create({
      type: "activation",
      performedTo: response.email,
      performedBy: adminEmail,
      performedAt: new Date(),
    });
    return serviceResponse(
      true,
      HTTP_CODES.OK,
      MESSAGES.MODERATOR_ACTIVATED,
      response
    );
  }
};

exports.deleteModerators = async (id) => {
  const findQuery = {};
  findQuery["$and"] = [];
  findQuery["$and"].push({ _id: id, isDeleted: null });

  const response = await User.findOne(findQuery);

  if (!response)
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);

  await User.findOneAndUpdate(
    findQuery,
    { isDeleted: new Date() },
    { new: true }
  );

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.MODERATOR_DELETED);
};

exports.downloarReportModerators = async (id) => {
  const response = await OrderModel.findOne({ _id: id, isDeleted: null })
    .populate({
      path: "userId",
      select: "idd role fname lname email phone",
      model: User,
    })
    .populate({
      path: "planId",
      select: "purchasedDate",
      populate: { path: "subId", select: "name", model: SubscriptionsModel },
      model: MySubscriptionModel,
    })
    .populate({
      path: "quizAndPollId",
      select: "type title coverImage",
      model: quizPollModel,
    })
    .populate({ path: "userId", select: "fname lname email", model: User });

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  //let accountNumber = "10012210011";

  let options = {
    fullName: `${response?.userId.fname} ${response?.userId.lname}`,
    email: response?.userId.email,
    invoiceNumber: response?.transactionId,
    dateIssue: calculateTime(response.createdAt),
    dateDue: calculateTime(response.createdAt),
    fromName: "Thought Bulb Research and Development LLP",
    fromAddress: "C5/88, Keshav Puram, Lawrence Road, Delhi 110035",
    fromEmail: process.env.SUPPORT_EMAIL,
    fromGSTN: "07AANFT3191L1ZL",

    toName: `${response?.userId.fname} ${response?.userId.lname}`,
    //toAddress: "H.No 88, PKT C-5, Keshavpuram Delhi 110035, India",
    toEmail: response?.userId.email,
    //toGSTN: "07AANFT3191L1ZL",
    productType: response.type,
    productName:
      response.type === "subscription"
        ? response.planId.subId.name
        : response.quizAndPollId.title,
    qty: 1,
    amount: response.amount,
    //bankName: "HDFC",
    // accountNumber: accountNumber.substring(
    //   Math.floor((accountNumber.length - 4) / 2),
    //   Math.floor((accountNumber.length - 4) / 2) + 4
    // ),
    AcoountHolder: `${response?.userId.fname} ${response?.userId.lname}`,
  };

  const report = await donwloadReport("invoices.html", options);

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.FETCH, report);
};

exports.downloarReportAdmin = async (id) => {
  const response = await OrderModel.findOne({ _id: id, isDeleted: null })
    .populate({
      path: "userId",
      select: "idd role fname lname email phone",
      model: User,
    })
    .populate({
      path: "quizAndPollId",
      select: "type title coverImage",
      model: quizPollModel,
    });

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  let options = {
    fullName: `${response?.userId.fname} ${response?.userId.lname}`,
    email: response?.userId.email,
    invoiceNumber: response?.transactionId,
    dateIssue: calculateTime(response.createdAt),
    dateDue: calculateTime(response.createdAt),
    fromName: "Thought Bulb Research and Development LLP",
    fromAddress: "C5/88, Keshav Puram, Lawrence Road, Delhi 110035",
    fromEmail: process.env.SUPPORT_EMAIL,
    fromGSTN: "07AANFT3191L1ZL",

    toName: `${response?.userId.fname} ${response?.userId.lname}`,
    toEmail: response?.userId.email,
    productType: response.type,
    productName:
      response.type === "subscription"
        ? response.planId.subId.name
        : response.quizAndPollId.title,
    qty: 1,
    amount: response.amount,
    bankName: "HDFC",
    accountNumber: accountNumber.substring(
      Math.floor((accountNumber.length - 4) / 2),
      Math.floor((accountNumber.length - 4) / 2) + 4
    ),
    AcoountHolder: `${response?.userId.fname} ${response?.userId.lname}`,
  };

  const report = await donwloadReport("invoices.html", options);

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.FETCH, report);
};

exports.updateProfilePriority = async (userId) => {
  let findQuery = { _id: userId, isDeleted: null };
  const response = await User.findOne(findQuery).select("id priority");
  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  if (response.priority === true) {
    await User.findOneAndUpdate(findQuery, { priority: false }, { new: true });
  } else {
    await User.findOneAndUpdate(findQuery, { priority: true }, { new: true });
  }

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.UPDATED);
};

exports.addQuizSubmition = async (id) => {
  let findQuery = {
    _id: id,
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

  //findQuery["$and"].push({ "QuizPollId.isDeleted": null });

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
        count: response.length,
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
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.DELETED);
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

exports.getModeratorView = async (id, query) => {
  let findQuery = { _id: id, isDeleted: null };

  const item = await User.findOne(findQuery);

  let payload = {
    role: item.role,
    idd: item.idd,
    isAuth: item.isAuth,
    fname: item.fname,
    lname: item.lname,
    email: item.email,
    phone: item.phone,
    description: item.description,
    avatar: item.avatar,
    priority: item.priority,
    isBlock: item.isBlock,
    status: item.status,
    isDeleted: item.isDeleted,
    _id: item._id,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };

  const subscription = await MySubscriptionModel.findOne({
    purchasedBy: item._id,
    isDeleted: null,
  }).populate({
    path: "subId",
    select:
      "members cover status isDeleted _id name noOfUsers monthlyPrice annuallyPrice description isPaid createdAt updatedAt",
    model: SubscriptionsModel,
  });

  if (subscription) {
    payload.subscription = subscription;

    if (subscription.isAssignedUser) {
      payload.subscription.subId.noOfUsers += subscription.plusNoOfUsers;
    }

    if (subscription.isAddOnUser) {
      payload.subscription.subId.noOfUsers += subscription.noOfAddOnUsers;
    }
  } else {
    payload.subscription = null;
  }

  const quizAndpoll = await quizPollModel.find({
    userId: item._id,
    isDeleted: null,
  });

  payload.quizAndpoll = quizAndpoll;

  const purchaseHistory = await OrderModel.find({
    userId: item._id,
    type: "product",
    isDeleted: null,
  })
    .sort({ createdAt: "desc" })
    .populate({ path: "quizAndPollId", model: quizPollModel })
    .select(
      "type userId quizAndPollId amount transactionId paymentMethod paymentStatus status createdAt updatedAt isDeleted"
    );

  payload.purchaseHistory = purchaseHistory;

  const invoicesHistory = await OrderModel.find({
    userId: item._id,
    type: "subscription",
    isDeleted: null,
  })
    .populate({ path: "subsId", select: "name", model: SubscriptionsModel })
    .select(
      "type userId planId amount transactionId paymentMethod paymentStatus status createdAt updatedAt isDeleted"
    );

  payload.invoicesHistory = invoicesHistory;

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.FETCH, payload);
};

exports.assignedPlayerToModerator = async (id, payload) => {
  const findQuery = {};
  findQuery["$and"] = [];
  findQuery["$and"].push({
    purchasedBy: id,
    isDeleted: null,
  });

  const response = await MySubscriptionModel.findOne(findQuery);

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  if (response.usesCount >= payload.plusNoOfUsers) {
    return serviceResponse(
      false,
      HTTP_CODES.BAD_REQUEST,
      `Plus should be greater then Current Users ${response.usesCount}`
    );
  }

  await MySubscriptionModel.findOneAndUpdate(findQuery, payload, { new: true });

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.UPDATED);
};

exports.pauseModeratorSubsciption = async (id) => {
  let findQuery = {
    purchasedBy: id,
    isDeleted: null,
  };
  const response =
    await MySubscriptionModel.findOne(findQuery).select("status");

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  if (response.status === CONSTANTS.ADMIN.SUBS_STATUS.PAUSE) {
    await MySubscriptionModel.findOneAndUpdate(findQuery, {
      status: CONSTANTS.ADMIN.SUBS_STATUS.ACTIVE,
    });
  } else {
    await MySubscriptionModel.findOneAndUpdate(findQuery, {
      status: CONSTANTS.ADMIN.SUBS_STATUS.PAUSE,
    });
  }

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.UPDATED);
};

exports.cancelModeratorSubsciption = async (id) => {
  let findQuery = {
    purchasedBy: id,
    isDeleted: null,
  };
  const response =
    await MySubscriptionModel.findOne(findQuery).select("status");

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  await MySubscriptionModel.findOneAndUpdate(findQuery, {
    status: CONSTANTS.ADMIN.SUBS_STATUS.CANCEL,
  });

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.UPDATED);
};

exports.purchaseHistory = async (id, query) => {
  let { type } = query;

  const findQuery = {};
  findQuery["$and"] = [];
  findQuery["$and"].push({ userId: id, type: "product", isDeleted: null });

  const result = await OrderModel.find(findQuery)
    .populate({
      path: "quizAndPollId",
      model: quizPollModel,
    })
    .select(
      "type userId amount transactionId paymentMethod paymentStatus status createdAt updatedAt isDeleted"
    )
    .sort({ updatedAt: -1 });
  let response = [];
  // for (var i = 0; i < result.length; i++) {
  //   if (type) {
  //     if (result[i].quizAndPollId.type == type) {
  //       response.push(result[i]);
  //     }
  //   } else {
  //     response.push(result[i]);
  //   }
  // }
  for (let i = 0; i < result.length; i++) {
    // Check for type condition within the loop
    if (
      !type ||
      (result[i].quizAndPollId && result[i].quizAndPollId.type === type)
    ) {
      response.push(result[i]);
    }
  }
  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.FETCH, response);
};

exports.copyProduct = async (payload) => {
  const response = await quizPollModel
    .findOne({
      _id: payload.productId,
      isDeleted: null,
    })
    .populate({ path: "questions", model: QuestionModel });

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  //  data modification

  const copyCount = response.copyCount + 1;

  let TitlePrefix = "";
  for (let i = 0; i < copyCount; i++) {
    TitlePrefix = TitlePrefix + "Copy - ";
  }

  // data modification

  let copyPayload = {
    title: TitlePrefix + response.title,
    type: response.type,
    catId: response.catId,
    status: response.status,
    description: response.description,
    coverImage: response.coverImage,
    tags: response.tags,
    startDateTime: response.startDateTime,
    endDateTime: response.endDateTime,
    timezon: response.timezon,
    duration: response.duration,
    isDated: new Date(),
  };

  const questions = response.questions.map((obj) => {
    return {
      title: obj.title,
      type: obj.type,
      optionType: obj.optionType,
      duration: obj.duration,
      point: obj.point,
      image: obj.image,
      options: obj.options,
      answers: obj.answers,
      customMessage: obj.customMessage,
      isWallOfFame: obj.isWallOfFame,
    };
  });

  copyPayload.questions = [];

  for (let obj of questions) {
    const created = await QuestionModel.create(obj);
    copyPayload.questions.push(created._id);
  }

  copyPayload.code = await generateQuizPollCode();
  // const { startISO, endISO, timezon } = generateStartTimeEnd(
  //   copyPayload.startDateTime,
  //   copyPayload.duration
  // );
  // delete copyPayload.startDateTime;
  // copyPayload.startDateTime = startISO;
  // copyPayload.endDateTime = endISO;
  // copyPayload.timezon = timezon;
  copyPayload.userId = payload.userId;
  copyPayload.createdFrom = response._id;
  copyPayload.isCreatedFrom = true;

  const quizAndPollCreated = await quizPollModel.create(copyPayload);

  await quizPollModel.findOneAndUpdate(
    {
      _id: payload.productId,
      isDeleted: null,
    },
    { $inc: { copyCount: 1 } }
  );

  return serviceResponse(
    true,
    HTTP_CODES.CREATED,
    MESSAGES.CREATED,
    quizAndPollCreated
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
      { $and: [{ isPurchased: false }, { createdFrom: { $ne: null } }] },
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
    .populate({ path: "coverImage", model: FileModel })
    .select(
      "type title code questions status startDateTime endDateTime coverImage createdAt updatedAt isDeleted"
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

exports.quizAndPollModeratorList = async (userId, query) => {
  let { page, limit, search, type, order, status } = query;

  const moderator = await User.findOne({ _id: userId, isDeleted: null });

  if (!moderator)
    return serviceResponse(false, HTTP_CODES.BAD_REQUEST, MESSAGES.NOT_FOUND);

  const findQuery = {};
  let sort = {};
  findQuery["$and"] = [];
  findQuery["$and"].push({
    userId: userId,
    $or: [
      { $and: [{ isPurchased: false }, { createdFrom: null }] },
      { $and: [{ isPurchased: true }, { createdFrom: { $ne: null } }] },
      { $and: [{ isPurchased: false }, { createdFrom: { $ne: null } }] },
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
    .populate({ path: "coverImage", model: FileModel })
    .select(
      "type title code questions status startDateTime endDateTime coverImage createdAt updatedAt isDeleted"
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

exports.deActivated = async (id) => {
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
    status: "deactivated",
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

exports.endQuizAndPoll = async (id) => {
  let findQuery = {
    _id: id,
    status: "running",
    isDeleted: null,
  };
  const response = await quizPollModel
    .findOne(findQuery)
    .select("type title status");

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  await quizPollModel.findOneAndUpdate(findQuery, {
    status: "closed",
    isDated: new Date(),
  });

  return serviceResponse(
    true,
    HTTP_CODES.OK,
    response.type === "quiz" ? MESSAGES.QUIZCLOSED : MESSAGES.POLLCLOSED
  );
};

exports.startActiveQuizAndPoll = async (id, payload) => {
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

  await quizPollModel.findOneAndUpdate(findQuery, {
    startDateTime: startISO,
    endDateTime: endISO,
    timezon: timezon,
    duration: response.duration,
    status: "running",
    isDated: new Date(),
  });

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

exports.pendingToActiveQuizAndPoll = async (id, payload) => {
  let findQuery = {
    _id: id,
    status: "pending",
    isDeleted: null,
  };
  const response = await quizPollModel
    .findOne(findQuery)
    .select("type title status duration");

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, "Record Not Found!!!");
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

  return serviceResponse(
    true,
    HTTP_CODES.OK,
    response.type === "quiz" ? MESSAGES.QUIZACTIVATED : MESSAGES.POLLACTIVATED
  );
};

exports.startClosedDeActivateToActivateQuizAndPoll = async (id, payload) => {
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

  // const { startISO, endISO, timezon } = generateStartTimeEnd(
  //   payload.startDateTime,
  //   response.duration
  // );

  await quizPollModel.findOneAndUpdate(findQuery, {
    // startDateTime: startISO,
    // endDateTime: endISO,
    // timezon: timezon,
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

  if (!gameData) {
    throw new NotFoundException("Quiz/poll does not exist!");
  }

  return serviceResponse(
    true,
    HTTP_CODES.OK,
    gameData && gameData.type === "quiz"
      ? MESSAGES.PLAYER_ELIMINATED_BY_MODERATOR
      : MESSAGES.PLAYER_ELIMINATED_BY_MODERATOR1
  );
};

exports.unPublish = async (id) => {
  let findQuery = { _id: id, isDeleted: null };
  const response = await quizPollModel
    .findOne(findQuery)
    .select("isPublished status");
  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  if (response.isPublished) {
    await quizPollModel.findOneAndUpdate(
      findQuery,
      { isPublished: false, isApproved: "approved" },
      { new: true }
    );
  } else {
    await quizPollModel.findOneAndUpdate(
      findQuery,
      { isPublished: true },
      { new: true }
    );
  }

  return serviceResponse(
    true,
    HTTP_CODES.OK,
    response.isPublished
      ? "Successfully Published"
      : "Successfully Unpublished",
    response
  );
};

exports.unPublishManual = async (id) => {
  let findQuery = { _id: id, isDeleted: null };

  const response = await quizPollModel.findOneAndUpdate(
    findQuery,
    { isApproved: "pending" },
    { new: true }
  );

  return serviceResponse(
    true,
    HTTP_CODES.OK,
    response.isPublished
      ? "Successfully Published"
      : "Successfully Unpublished",
    response
  );
};
exports.update = async () => {
  const response = await MySubscriptionModel.updateMany(
    { planDurationType: { $in: ["Annually", "annually"] } },
    { $set: { planDurationType: "annually" } },
    { new: true }
  );
  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }
  return serviceResponse(true, HTTP_CODES.OK, "successfully updated", response);
};

exports.updatePrices = async (id, query) => {
  const updatedQuiz = await SubscriptionsModel.findOneAndUpdate(
    { _id: id },
    {
      $set: {
        monthlyPrice: query.monthlyPrice,
        annuallyPrice: query.annuallyPrice,
      },
    },
    { new: true }
  );

  if (!updatedQuiz) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  return serviceResponse(
    true,
    HTTP_CODES.OK,
    "Successfully updated prices",
    updatedQuiz
  );
};

exports.passwordReset = async (body) => {
  const filter = {};
  const update = {
    passcode: body.passcode,
  };

  const options = {
    new: true,
    upsert: true,
  };

  // const currentPassword = await VrPasscodeModel.findOne({});

  // console.log(currentPassword.passcode, body.passcode);

  // if (currentPassword && currentPassword.passcode !== body.passcode) {
  //   return serviceResponse(
  //     false,
  //     HTTP_CODES.BAD_REQUEST,
  //     "Password not matched"
  //   );
  // }

  const updatedPassword = await VrPasscodeModel.findOneAndUpdate(
    filter,
    update,
    options
  );

  if (!updatedPassword) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  return serviceResponse(true, HTTP_CODES.OK, "Successfully updated password");
};

exports.getPassword = async () => {
  const password = await VrPasscodeModel.findOne({});

  if (!password) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  let res = {};
  res.passcode = password.passcode;

  return serviceResponse(true, HTTP_CODES.OK, "Successfully get password", res);
};
