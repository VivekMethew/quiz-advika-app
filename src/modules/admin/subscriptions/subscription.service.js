const { HTTP_CODES, MESSAGES, CONSTANTS, URLS } = require("../../../config");
const {
  SubscriptionsModel,
} = require("../../../models/subsription.plans.model");
const { MySubscriptionModel } = require("../../../models/plans.selected.model");
const { serviceResponse } = require("../../../helpers/response");
const { User } = require("../../../models/users.model");
const { OrderModel } = require("../../../models/orders.model");
const { pagination, STP, logger } = require("../../../utils");

exports.AddSubscriptions = async (payload) => {
  const isMatch = await SubscriptionsModel.findOne({
    name: payload.name,
    isDeleted: null,
  });
  if (isMatch) {
    return serviceResponse(false, HTTP_CODES.BAD_REQUEST, MESSAGES.SUB_EXIST);
  }

  if (payload.name === CONSTANTS.PLAN_NAMES.TRIAL) {
    payload.isPredefinedUsers = false;
    payload.isDashboardAccess = false;
    payload.isQuestionTimes = false;
    payload.isImageGifQuestions = false;
    payload.isCustomNotifyPopUp = false;
    payload.isAddonUsers = false;
  }

  if (payload.name === CONSTANTS.PLAN_NAMES.SILVER) {
    payload.noOfUsers = 200;
    payload.isActiveQuizPoll = 5;
    payload.monthlyPrice = 2999;
    payload.annuallyPrice = 29999;
    payload.isPlayerLiveLobby = true;
    payload.isShared = true;
    payload.isCustomizeTime = true;
    payload.isLiveScoreBoard = true;
    payload.isSharedSocialMedia = true;
    payload.isPredefinedUsers = false;
    payload.isDashboardAccess = false;
    payload.isQuestionTimes = false;
    payload.isImageGifQuestions = false;
    payload.isCustomNotifyPopUp = false;
    payload.isAddonUsers = false;
  }

  if (payload.name === CONSTANTS.PLAN_NAMES.GOLD) {
    payload.noOfUsers = 350;
    payload.isActiveQuizPoll = 10;
    payload.monthlyPrice = 3999;
    payload.annuallyPrice = 39999;
    payload.isDownloadSummary = true;
    payload.isPlayerLiveLobby = true;
    payload.isShared = true;
    payload.isCustomizeTime = true;
    payload.isLiveScoreBoard = true;
    payload.isQuizChatGPT = true;
    payload.isPollChatGPT = true;
    payload.isSharedSocialMedia = true;
    payload.isPredefinedUsers = false;
    payload.isDashboardAccess = false;
    payload.isQuestionTimes = false;
    payload.isImageGifQuestions = false;
    payload.isCustomNotifyPopUp = false;
    payload.isAddonUsers = false;
  }

  if (payload.name === CONSTANTS.PLAN_NAMES.PLATINUM) {
    payload.noOfUsers = 500;
    payload.isActiveQuizPoll = 15;
    payload.monthlyPrice = 7999;
    payload.annuallyPrice = 79999;
    payload.isQuizChatGPT = true;
    payload.isPollChatGPT = true;
    payload.isDownloadSummary = true;
    payload.isPlayerLiveLobby = true;
    payload.isShared = true;
    payload.isCustomizeTime = true;
    payload.isLiveScoreBoard = true;
    payload.isSharedSocialMedia = true;
    payload.isMediaAnswers = true;
    payload.isGallery = true;
    payload.isPredefinedUsers = false;
    payload.isDashboardAccess = false;
    payload.isQuestionTimes = false;
    payload.isImageGifQuestions = false;
    payload.isCustomNotifyPopUp = false;
    payload.isAddonUsers = false;
  }

  const response = await SubscriptionsModel.create(payload);
  return serviceResponse(true, HTTP_CODES.CREATED, MESSAGES.UPDATED, response);
};

exports.getSubscriptions = async () => {
  let response = await SubscriptionsModel.find({ isDeleted: null });
  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.FETCH, response);
};

exports.getSubscriptionsByModerator = async (id) => {
  let response = await SubscriptionsModel.find({
    choosePlans: {
      $elemMatch: { purchasedBy: id },
    },
  });

  return serviceResponse(true, HTTP_CODES.CREATED, MESSAGES.CREATED, response);
};

exports.viewSubscriptions = async (id) => {
  const response = await SubscriptionsModel.findOne({
    _id: id,
    isDeleted: null,
  });
  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }
  return serviceResponse(true, HTTP_CODES.CREATED, MESSAGES.FETCH, response);
};

exports.updateSubscriptions = async (id, payload) => {
  let findQuery = {
    _id: id,
    isDeleted: null,
  };

  const response = await SubscriptionsModel.findOneAndUpdate(
    findQuery,
    payload
  );
  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  return serviceResponse(true, HTTP_CODES.CREATED, MESSAGES.UPDATED);
};

exports.updateGoldPlanSubscriptions = async (id, payload) => {
  let findQuery = {
    _id: id,
    isDeleted: null,
  };

  const response = await SubscriptionsModel.findOneAndUpdate(findQuery, {
    isQuizChatGPT: true,
    isPollChatGPT: true,
  });

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  return serviceResponse(true, HTTP_CODES.CREATED, MESSAGES.UPDATED);
};

exports.addProductOnStripe = async (id) => {
  let findQuery = {
    _id: id,
    isDeleted: null,
  };
  const response = await SubscriptionsModel.findOne(findQuery).select(
    "name monthlyProductId annuallyProductId monthlyPriceId annuallyPriceId monthlyPrice annuallyPrice description"
  );

  logger.info(`Name : ${response.name}`);

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  if (
    // response.name !== "trial" &&
    !response.monthlyProductId &&
    !response.monthlyPriceId
  ) {
    const product = await STP.addSubscictionProduct({
      name: response.name,
      description: response.description,
    });

    const prices = await STP.addSubscictionPrices({
      price: response.monthlyPrice,
      currency: "inr",
      inverval: "month",
      id: product?.id,
    });

    await SubscriptionsModel.findOneAndUpdate(findQuery, {
      monthlyProductId: product?.id,
      monthlyPriceId: prices.id,
    });

    logger.info("monthlyPrice Has been created");
  }

  if (
    // response.name !== "trial" &&
    !response.annuallyProductId &&
    !response.annuallyPriceId
  ) {
    const product = await STP.addSubscictionProduct({
      name: response.name,
      description: response.description,
    });

    const prices = await STP.addSubscictionPrices({
      price: response.annuallyPrice,
      currency: "inr",
      inverval: "year",
      id: product?.id,
    });

    await SubscriptionsModel.findOneAndUpdate(findQuery, {
      annuallyProductId: product?.id,
      annuallyPriceId: prices.id,
    });

    logger.info("annuallyPrice Has been created");
  }

  return serviceResponse(true, HTTP_CODES.CREATED, MESSAGES.CREATED);
};

exports.deleteProductOnStripe = async (id) => {
  let findQuery = {
    _id: id,
    isDeleted: null,
  };
  const response = await SubscriptionsModel.findOne(findQuery).select(
    "name monthlyProductId annuallyProductId monthlyPriceId annuallyPriceId monthlyPrice annuallyPrice description"
  );

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  logger.info(`Name : ${response.name}`);

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  if (response.monthlyProductId && response.monthlyPriceId) {
    await STP.deleteSubscictionProduct(response.monthlyProductId, {
      name: response.name,
      description: response.description,
    });

    await STP.deleteSubscictionPrices(response.monthlyPriceId, {
      unit_amount: response.monthlyPrice,
      currency: "inr",
      recurring: { inverval: "month" },
    });

    logger.info("monthlyPrice Has been updated");
  }

  if (response.annuallyProductId && response.annuallyPriceId) {
    await STP.deleteSubscictionProduct(response.annuallyProductId, {
      name: response.name,
      description: response.description,
    });

    await STP.deleteSubscictionPrices(response.annuallyPriceId, {
      price: response.annuallyPrice,
      currency: "inr",
      inverval: "year",
    });

    logger.info("annuallyPrice Has been updated");
  }

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.DELETED);
};

exports.deleteSubscriptions = async (id) => {
  let findQuery = {
    _id: id,
    isDeleted: null,
  };
  const response = await SubscriptionsModel.findOneAndUpdate(findQuery, {
    isDeleted: new Date(),
  });
  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }
  return serviceResponse(true, HTTP_CODES.CREATED, MESSAGES.DELETED);
};
exports.subsAnalytics = async (query) => {
  let {
    page,
    limit,
    search,
    planTypes,
    order,
    startDate,
    endDate,
    validity,
    minPrice,
    maxPrice,
  } = query;

  let sort = {};

  const findQuery = {};
  findQuery["$and"] = [];
  findQuery["$and"].push({
    role: CONSTANTS.USER.ROLES.MODERATOR,
    isDeleted: null,
  });
  var result = [];
  var findSubsciption = {
    isDeleted: null,
    $and: [],
  };

  if (order === "latest") {
    sort.createdAt = -1;
  } else if (order === "oldest") {
    sort.createdAt = 1;
  } else {
    sort.createdAt = -1;
  }

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
              input: { $concat: ["$fname", " ", "$lname"] },
              regex: new RegExp(search, "i"),
            },
          },
        },
        { email: { $regex: new RegExp(search, "i") } },
        { idd: search },
      ],
    });
  }
  console.log("find", findQuery);

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

  //const offset = page === 1 ? 0 : limit * (page - 1);
  const totalResults = await User.countDocuments(findQuery);
  const totalPages = Math.ceil(totalResults / limit);
  if (page > totalPages) page = totalPages;

  const offset = Math.max(0, limit * (page - 1));

  if (validity) {
    findSubsciption.planDurationType = validity;
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
  // var subscriptionIds;
  // if (minPrice && maxPrice) {

  //   const subscriptionDocs = await SubscriptionsModel.find({
  //     $or: [
  //       { monthlyPrice: { $gte: minPrice, $lte: maxPrice } },
  //       { annuallyPrice: { $gte: minPrice, $lte: maxPrice } }
  //     ]
  //   });

  //   if (subscriptionDocs && subscriptionDocs.length > 0) {
  //     subscriptionIds = subscriptionDocs.map((doc) => doc._id);
  //     console.log("subscriptionIds", subscriptionIds);
  //     findSubsciption["$and"].push({ subId: { $in: subscriptionIds } });
  //   }
  // }
  //new
  var ids = [];
  if (minPrice && maxPrice) {
    const rr = await MySubscriptionModel.find();
    for (var i = 0; i < rr.length; i++) {
      if (rr[i].planDurationType == "monthly") {
        const f = await SubscriptionsModel.findOne({ _id: rr[i].subId });

        if (f.monthlyPrice >= minPrice && f.monthlyPrice <= maxPrice) {
          console.log("subId1");
          ids.push(rr[i]._id);
        }
      } else if (rr[i].planDurationType == "annually") {
        const f = await SubscriptionsModel.findOne({ _id: rr[i].subId });

        if (f.annuallyPrice >= minPrice && f.annuallyPrice <= maxPrice) {
          console.log("subId2");
          ids.push(rr[i]._id);
        }
      }
    }
    findSubsciption["$and"].push({ _id: { $in: ids } });
  }
  //console.log("ids", ids);
  //console.log("ids", ids);
  //end
  // console.log("hjk", findSubsciption);

  if (findSubsciption["$and"].length === 0) {
    delete findSubsciption["$and"];
  }

  const userIds =
    await MySubscriptionModel.findOne(findSubsciption).distinct("purchasedBy");

  findQuery["$and"].push({ _id: { $in: userIds } });
  //old
  const response = await User.find(findQuery)
    .sort(sort)
    .skip(offset)
    .limit(limit);

  let payload = {};
  var amount;
  var c = 0;
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

    var subscription = await MySubscriptionModel.findOne({
      purchasedBy: item._id,
    }).populate({
      path: "subId",
      model: SubscriptionsModel,
    });

    if (subscription.planDurationType == "monthly") {
      amount = subscription.subId.monthlyPrice;
    } else if (subscription.planDurationType == "annually") {
      amount = subscription.subId.annuallyPrice;
    } else {
      amount = 0;
    }

    if (subscription && subscription.subId.name != "trial") {
      payload.subscription = subscription;
      payload.amount = amount;
      //result.push(payload);
      c++;
    }
    result.push(payload);

    amount = 0;
  }

  const data = pagination.getPagingData(
    {
      count: await User.countDocuments(findQuery),
      rows: result,
    },
    page,
    limit
  );
  // const data = pagination.getPagingData(
  //   {
  //     count: await User.countDocuments(findQuery),
  //     rows: result,
  //   },
  //   page,
  //   limit
  // );
  // const data = pagination.getPagingData(
  //   {
  //     count: c,
  //     rows: result,
  //   },
  //   page,
  //   limit
  // );

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.FETCH, data);
};
/*exports.subsAnalytics = async (query) => {
  let {
    page,
    limit,
    search,
    planTypes,
    order,
    startDate,
    endDate,
    validity,
    minPrice,
    maxPrice,
  } = query;

  // Initialize the main query object and sorting object
  const findQuery = {};
  let sort = {};
  findQuery["$and"] = [];

  // Add default conditions to the query
  findQuery["$and"].push({
    type: "subscription",
    isDeleted: null,
  });

  // Set default values for page and limit if not provided
  if (!page && !limit) {
    page = 1;
    limit = 10;
  } else {
    page = parseInt(page);
    limit = parseInt(limit);
  }

  // Handle search functionality
  if (search) {
    const regexSearch = new RegExp(search, "i");

    // Define nameQuery and emailQuery
    const nameQuery = {
      $or: [
        { fname: regexSearch },
        { lname: regexSearch },
        {
          $expr: {
            $regexMatch: {
              input: {
                $concat: ["$fname", " ", "$lname"],
              },
              regex: regexSearch,
            },
          },
        },
        {
          $expr: {
            $regexMatch: {
              input: {
                $concat: ["$fname", "$lname"],
              },
              regex: regexSearch,
            },
          },
        },
      ],
    };

    const emailQuery = { email: regexSearch };
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(search);

    if (isValidObjectId) {
      findQuery["$and"].push({ _id: search });
    }

    // Find users based on name or email matching the search
    const subscriptionDocs = await User.find({ $or: [nameQuery, emailQuery] });

    // If users are found, extract their IDs and add to the main query
    if (subscriptionDocs && subscriptionDocs.length > 0) {
      const subscriptionIds = subscriptionDocs.map((doc) => doc._id);
      findQuery["$and"].push({ userId: { $in: subscriptionIds } });
    }
    else {
      // If no users are found, return an empty result
      return serviceResponse(
        true,
        HTTP_CODES.CREATED,
        MESSAGES.FETCH,
        pagination.getPagingData({ count: 0, rows: [] }, page, limit)
      );
    }
  }

  // Handle planTypes
  if (planTypes) {
    const subscriptionDocs = await SubscriptionsModel.find({ name: planTypes });
    if (subscriptionDocs && subscriptionDocs.length > 0) {
      const subscriptionIds = subscriptionDocs.map((doc) => doc._id);
      findQuery["$and"].push({ subsId: { $in: subscriptionIds } });
    }
  }
  // Handle sorting
  if (order === "latest") {
    sort.createdAt = "desc";
  } else if (order === "oldest") {
    sort.createdAt = "asc";
  } else {
    sort.createdAt = "desc";
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

  // Handle validity
  if (validity) {
    const subscriptionDocs = await MySubscriptionModel.find({
      planDurationType: validity,
    });
    if (subscriptionDocs && subscriptionDocs.length > 0) {
      const subscriptionIds = subscriptionDocs.map((doc) => doc._id);
      findQuery["$and"].push({ planId: { $in: subscriptionIds } });
    }
  }
  
  // Handle minPrice and maxPrice
  if (minPrice && maxPrice) {
    findQuery["$and"].push({
      amount: {
        $gte: minPrice,
        $lte: maxPrice,
      },
    });
  }

  // Implement pagination
  const totalResults = await OrderModel.countDocuments(findQuery);
  const totalPages = Math.ceil(totalResults / limit);
  if (page > totalPages) page = totalPages;

  // const offset = page === 1 ? 0 : limit * (page - 1);
  const offset = Math.max(0, limit * (page - 1));


  // Fetch documents with pagination and populate related data
  const response = await OrderModel.find(findQuery)
    .sort(sort)
    .skip(offset)
    .limit(limit)
    .populate({ path: "userId", select: "role fname lname email" })
    .populate({ path: "subsId", select: "name" })
    .populate({
      path: "planId",
      select: "planDurationType purchasedDate expiredOnDate subId",
      populate: {
        path: "subId",
        select: "name monthlyPrice annuallyPrice",
      },
    })
    .select("type amount createdAt updatedAt status");

  if (!response) {
    return serviceResponse(false, HTTP_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST);
  }

  // Return service response with pagination data
  return serviceResponse(
    true,
    HTTP_CODES.CREATED,
    MESSAGES.FETCH,
    pagination.getPagingData(
      {
        count: await OrderModel.countDocuments(findQuery),
        rows: response,
      },
      page,
      limit
    )
  );
};*/
// old code
// exports.subsAnalytics = async (query) => {
//   let {
//     page,
//     limit,
//     search,
//     planTypes,
//     order,
//     startDate,
//     endDate,
//     validity,
//     minPrice,
//     maxPrice,
//   } = query;
//   const findQuery = {};
//   let sort = {};
//   findQuery["$and"] = [];
//   findQuery["$and"].push({
//     type: "subscription",
//     isDeleted: null,
//   });

//   if (!page && !limit) {
//     page = 1;
//     limit = 10;
//   } else {
//     page = parseInt(page);
//     limit = parseInt(limit);
//   }

//   /*if (search) {
//     const regexSearch = new RegExp(search, "i");

//     const nameQuery = {
//       $or: [
//         { fname: regexSearch },
//         { lname: regexSearch },
//         {
//           $expr: {
//             $regexMatch: {
//               input: {
//                 $concat: ["$fname", " ", "$lname"]
//               },
//               regex: regexSearch.source,
//             }
//           }
//         }
//       ],
//     };

//     const emailQuery = { email: regexSearch };
//     const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(search);

//     if (isValidObjectId) {
//       findQuery["$and"].push({ _id: search });
//     }

//     const subscriptionDocs = await User.find({ $or: [nameQuery, emailQuery] });

//     if (subscriptionDocs && subscriptionDocs.length > 0) {
//       const subscriptionIds = subscriptionDocs.map((doc) => doc._id);
//       findQuery["$and"].push({ userId: { $in: subscriptionIds } });
//     }
//   }*/
//   /*if (search) {
//     const regexSearch = new RegExp(search, "i");

//     const nameQuery = {
//       $or: [
//         { fname: regexSearch },
//         { lname: regexSearch },
//         {
//           $expr: {
//             $regexMatch: {
//               input: {
//                 $concat: ["$fname", " ", "$lname"],
//               },
//               regex: regexSearch.source,
//             },
//           },
//         },
//         {
//           $expr: {
//             $regexMatch: {
//               input: {
//                 $concat: ["$fname", "$lname"],
//               },
//               regex: regexSearch.source,
//             },
//           },
//         },
//       ],
//     };

//     const emailQuery = { email: regexSearch };
//     const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(search);

//     if (isValidObjectId) {
//       findQuery["$and"].push({ _id: search });
//     }

//     const subscriptionDocs = await User.find({ $or: [nameQuery, emailQuery] });

//     if (subscriptionDocs && subscriptionDocs.length > 0) {
//       const subscriptionIds = subscriptionDocs.map((doc) => doc._id);
//       findQuery["$and"].push({ userId: { $in: subscriptionIds } });
//     }
//   }*/
//   if (search) {
//     const regexSearch = new RegExp(search, "i");

//     const nameQuery = {
//       $or: [
//         { fname: regexSearch },
//         { lname: regexSearch },
//         {
//           $expr: {
//             $regexMatch: {
//               input: {
//                 $concat: ["$fname", " ", "$lname"],
//               },
//               regex: regexSearch,
//             },
//           },
//         },
//         {
//           $expr: {
//             $regexMatch: {
//               input: {
//                 $concat: ["$fname", "$lname"],
//               },
//               regex: regexSearch,
//             },
//           },
//         },
//       ],
//     };

//     const emailQuery = { email: regexSearch };
//     const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(search);

//     if (isValidObjectId) {
//       findQuery["$and"].push({ _id: search });
//     }

//     const subscriptionDocs = await User.find({ $or: [nameQuery, emailQuery] });

//     if (subscriptionDocs && subscriptionDocs.length > 0) {
//       const subscriptionIds = subscriptionDocs.map((doc) => doc._id);
//       findQuery["$and"].push({ userId: { $in: subscriptionIds } });
//     }
//   }

//   /*if (planTypes) {
//     const subscriptionDocs = await SubscriptionsModel.find({ name: planTypes });

//     if (subscriptionDocs && subscriptionDocs.length > 0) {
//       const subscriptionIds = subscriptionDocs.map((doc) => doc._id);

//       const mySubscriptionDocs = await MySubscriptionModel.find({
//         subId: { $in: subscriptionIds },
//       });

//       if (mySubscriptionDocs && mySubscriptionDocs.length > 0) {
//         const mySubscriptionplanIds = mySubscriptionDocs.map((doc) => doc._id);
//         console.log("ids", mySubscriptionplanIds);

//         const mySubscription = await OrderModel.find({
//           planId: { $in: mySubscriptionplanIds },
//         });
//         console.log("my docs", mySubscription);

//         findQuery["$and"].push({ planId: { $in: mySubscriptionplanIds } });
//       }

//     }
//     else {
//       findQuery["$and"].push({ _id:null});
//     }
//   }*/
//   if (planTypes) {
//     const subscriptionDocs = await SubscriptionsModel.find({ name: planTypes });
//     if (subscriptionDocs && subscriptionDocs.length > 0) {
//       const subscriptionIds = subscriptionDocs.map((doc) => doc._id);
//       findQuery["$and"].push({ subsId: { $in: subscriptionIds } });
//     }
//   }

//   if (order === "latest") {
//     sort.createdAt = "desc";
//   } else if (order === "oldest") {
//     sort.createdAt = "asc";
//   } else {
//     sort.createdAt = "asc";
//   }
//   // for start and end date
//   /*if (startDate && endDate) {
//     const startD = new Date(startDate);
//     const endD = new Date(endDate);

//     startD.setHours(0, 0, 0, 0);
//     endD.setHours(23, 59, 59, 999);

//     findQuery["$and"].push({
//       createdAt: { $gte: startD },
//       updatedAt: { $lte: endD },
//     });
//   }*/
//   if (startDate && endDate) {
//     const startD = new Date(startDate);
//     const endD = new Date(endDate);

//     startD.setHours(0, 0, 0, 0);
//     endD.setHours(23, 59, 59, 999);

//     findQuery["$and"].push({
//       createdAt: {
//         $gte: startD,
//         $lte: endD,
//       },
//     });
//   }
//   //for subscription intervals
//   /*if (validity) {
//     findQuery["$and"].push({ "planId.planDurationType": validity });
//   }*/

//   if (validity) {
//     const subscriptionDocs = await MySubscriptionModel.find({
//       planDurationType: validity,
//     });
//     if (subscriptionDocs && subscriptionDocs.length > 0) {
//       const subscriptionIds = subscriptionDocs.map((doc) => doc._id);
//       findQuery["$and"].push({ planId: { $in: subscriptionIds } });
//     }
//   }

//   //amount less than or equal to price
//   /*if (price && price > 0) {
//     findQuery["$and"].push({ amount: price });
//   }*/
//   if (minPrice && maxPrice) {
//     findQuery["$and"].push({
//       amount: {
//         $gte: minPrice,
//         $lte: maxPrice,
//       },
//     });
//   }

//   const offset = page === 1 ? 0 : limit * (page - 1);

//   const response = await OrderModel.find(findQuery)
//     .sort(sort)
//     .skip(offset)
//     .limit(limit)
//     .populate({ path: "userId", select: "role fname lname email" })
//     .populate({ path: "subsId", select: "name" })
//     .populate({
//       path: "planId",
//       select: "planDurationType purchasedDate expiredOnDate subId",
//       populate: {
//         path: "subId",
//         select: "name monthlyPrice annuallyPrice",
//       },
//     })
//     .select("type amount createdAt updatedAt status");

//   if (!response) {
//     return serviceResponse(false, HTTP_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST);
//   }
//   return serviceResponse(
//     true,
//     HTTP_CODES.CREATED,
//     MESSAGES.FETCH,
//     pagination.getPagingData(
//       {
//         count: await OrderModel.countDocuments(findQuery),
//         rows: response,
//       },
//       page,
//       limit
//     )
//   );
// };

exports.subsDownloadExcelAnalytics = async (query) => {
  let {
    page,
    limit,
    search,
    planTypes,
    order,
    startDate,
    endDate,
    validity,
    minPrice,
    maxPrice,
  } = query;

  const findQuery = {};
  findQuery["$and"] = [];
  findQuery["$and"].push({
    role: CONSTANTS.USER.ROLES.MODERATOR,
    isDeleted: null,
  });
  var result = [];
  var findSubsciption = {
    isDeleted: null,
    $and: [],
  };
  if (!page && !limit) {
    page = 1;
    limit = 10;
  } else {
    page = parseInt(page);
    limit = parseInt(limit);
  }

  /*if (search) {
    console.log("search", search);
    findQuery["$and"].push({
      $or: [
        { fname: { $regex: new RegExp(search, "i") } },
        { lname: { $regex: new RegExp(search, "i") } },
        { email: { $regex: new RegExp(search, "i") } },
        { idd: search },
      ],
    });
  }*/
  if (search) {
    console.log("search", search);
    findQuery["$and"].push({
      $or: [
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ["$fname", " ", "$lname"] },
              regex: new RegExp(search, "i"),
            },
          },
        },
        { email: { $regex: new RegExp(search, "i") } },
        { idd: search },
      ],
    });
  }
  console.log("find", findQuery);

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
  var subscriptionIds;
  if (minPrice && maxPrice) {
    const subscriptionDocs = await SubscriptionsModel.find({
      $or: [
        { monthlyPrice: { $gte: minPrice, $lte: maxPrice } },
        { annuallyPrice: { $gte: minPrice, $lte: maxPrice } },
      ],
    });

    if (subscriptionDocs && subscriptionDocs.length > 0) {
      subscriptionIds = subscriptionDocs.map((doc) => doc._id);
      console.log("subscriptionIds", subscriptionIds);
      findSubsciption["$and"].push({ subId: { $in: subscriptionIds } });
    }
  }
  if (findSubsciption["$and"].length === 0) {
    delete findSubsciption["$and"];
  }

  const userIds =
    await MySubscriptionModel.findOne(findSubsciption).distinct("purchasedBy");

  findQuery["$and"].push({ _id: { $in: userIds } });

  //const response = await User.find(findQuery).skip(offset).limit(limit);
  const response = await User.find(findQuery);
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
  // const data = pagination.getPagingData(
  //   {
  //     count: await User.countDocuments(findQuery),
  //     rows: result,
  //   },
  //   page,
  //   limit
  // );

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.FETCH, result);
};

// exports.subsDownloadExcelAnalytics = async (query) => {
//   let {
//     page,
//     limit,
//     search,
//     planTypes,
//     order,
//     startDate,
//     endDate,
//     validity,
//     minPrice,
//     maxPrice,
//   } = query;
//   const findQuery = {};
//   let sort = {};
//   findQuery["$and"] = [];
//   findQuery["$and"].push({
//     type: "subscription",
//     isDeleted: null,
//   });

//   if (!page && !limit) {
//     page = 1;
//     limit = 10;
//   } else {
//     page = parseInt(page);
//     limit = parseInt(limit);
//   }

//   /*if (search) {
//     const regexSearch = new RegExp(search, "i");

//     const nameQuery = {
//       $or: [
//         { fname: regexSearch },
//         { lname: regexSearch },
//         {
//           $expr: {
//             $regexMatch: {
//               input: {
//                 $concat: ["$fname", " ", "$lname"]
//               },
//               regex: regexSearch.source,
//             }
//           }
//         }
//       ],
//     };

//     const emailQuery = { email: regexSearch };
//     const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(search);

//     if (isValidObjectId) {
//       findQuery["$and"].push({ _id: search });
//     }

//     const subscriptionDocs = await User.find({ $or: [nameQuery, emailQuery] });

//     if (subscriptionDocs && subscriptionDocs.length > 0) {
//       const subscriptionIds = subscriptionDocs.map((doc) => doc._id);
//       findQuery["$and"].push({ userId: { $in: subscriptionIds } });
//     }
//   }*/
//   if (search) {
//     const regexSearch = new RegExp(search, "i");

//     const nameQuery = {
//       $or: [
//         { fname: regexSearch },
//         { lname: regexSearch },
//         {
//           $expr: {
//             $regexMatch: {
//               input: {
//                 $concat: ["$fname", " ", "$lname"],
//               },
//               regex: regexSearch.source,
//             },
//           },
//         },
//         {
//           $expr: {
//             $regexMatch: {
//               input: {
//                 $concat: ["$fname", "$lname"],
//               },
//               regex: regexSearch.source,
//             },
//           },
//         },
//       ],
//     };

//     const emailQuery = { email: regexSearch };
//     const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(search);

//     if (isValidObjectId) {
//       findQuery["$and"].push({ _id: search });
//     }

//     const subscriptionDocs = await User.find({ $or: [nameQuery, emailQuery] });

//     if (subscriptionDocs && subscriptionDocs.length > 0) {
//       const subscriptionIds = subscriptionDocs.map((doc) => doc._id);
//       findQuery["$and"].push({ userId: { $in: subscriptionIds } });
//     }
//   }

//   /*if (planTypes) {
//     const subscriptionDocs = await SubscriptionsModel.find({ name: planTypes });

//     if (subscriptionDocs && subscriptionDocs.length > 0) {
//       const subscriptionIds = subscriptionDocs.map((doc) => doc._id);

//       const mySubscriptionDocs = await MySubscriptionModel.find({
//         subId: { $in: subscriptionIds },
//       });

//       if (mySubscriptionDocs && mySubscriptionDocs.length > 0) {
//         const mySubscriptionplanIds = mySubscriptionDocs.map((doc) => doc._id);
//         console.log("ids", mySubscriptionplanIds);

//         const mySubscription = await OrderModel.find({
//           planId: { $in: mySubscriptionplanIds },
//         });
//         console.log("my docs", mySubscription);

//         findQuery["$and"].push({ planId: { $in: mySubscriptionplanIds } });
//       }

//     }
//     else {
//       findQuery["$and"].push({ _id:null});
//     }
//   }*/
//   if (planTypes) {
//     const subscriptionDocs = await SubscriptionsModel.find({ name: planTypes });
//     if (subscriptionDocs && subscriptionDocs.length > 0) {
//       const subscriptionIds = subscriptionDocs.map((doc) => doc._id);
//       findQuery["$and"].push({ subsId: { $in: subscriptionIds } });
//     }
//   }

//   if (order === "latest") {
//     sort.createdAt = "desc";
//   } else if (order === "oldest") {
//     sort.createdAt = "asc";
//   } else {
//     sort.createdAt = "desc";
//   }
//   // for start and end date
//   if (startDate && endDate) {
//     const startD = new Date(startDate);
//     const endD = new Date(endDate);

//     startD.setHours(0, 0, 0, 0);
//     endD.setHours(23, 59, 59, 999);
//     findQuery["$and"].push({
//       createdAt: { $gte: startD },
//       updatedAt: { $lte: endD },
//     });
//   }
//   //for subscription intervals
//   /*if (validity) {
//     findQuery["$and"].push({ "planId.planDurationType": validity });
//   }*/

//   if (validity) {
//     const subscriptionDocs = await MySubscriptionModel.find({
//       planDurationType: validity,
//     });
//     if (subscriptionDocs && subscriptionDocs.length > 0) {
//       const subscriptionIds = subscriptionDocs.map((doc) => doc._id);
//       findQuery["$and"].push({ planId: { $in: subscriptionIds } });
//     }
//   }

//   //amount less than or equal to price
//   /*if (price && price > 0) {
//     findQuery["$and"].push({ amount: price });
//   }*/
//   if (minPrice && maxPrice) {
//     findQuery["$and"].push({
//       amount: {
//         $gte: minPrice,
//         $lte: maxPrice,
//       },
//     });
//   }

//   const offset = page === 1 ? 0 : limit * (page - 1);

//   const response = await OrderModel.find(findQuery)
//     .sort(sort)
//     // .skip(offset)
//     // .limit(limit)
//     .populate({ path: "userId", select: "role fname lname email" })
//     .populate({ path: "subsId", select: "name" })
//     .populate({
//       path: "planId",
//       select: "planDurationType purchasedDate expiredOnDate subId",
//       populate: {
//         path: "subId",
//         select: "name monthlyPrice annuallyPrice",
//       },
//     })
//     .select("type amount createdAt updatedAt status");

//   if (!response) {
//     return serviceResponse(false, HTTP_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST);
//   }
//   return serviceResponse(
//     true,
//     HTTP_CODES.CREATED,
//     MESSAGES.FETCH,
//     response
//     // pagination.getPagingData(
//     //   {
//     //     count: await OrderModel.countDocuments(findQuery),
//     //     rows: response,
//     //   },
//     //   page,
//     //   limit
//     // )
//   );
// };

exports.test = async () => {
  const findQuery = {};

  findQuery["$and"] = [];
  findQuery["$and"].push({
    type: "subscription",
    isDeleted: null,
  });

  const pipeline = [
    {
      $match: { type: "subscription", isDeleted: null },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $limit: 20,
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $limit: 5,
    },
    {
      $lookup: {
        from: "users", // Replace with the actual name of the "users" collection
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $lookup: {
        from: "subscriptionplans",
        localField: "subsId",
        foreignField: "_id",
        as: "subscription",
      },
    },
    {
      $lookup: {
        from: "mysubscriptions",
        localField: "planId",
        foreignField: "_id",
        as: "plan",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $unwind: "$subscription",
    },
    {
      $unwind: "$plan",
    },
    {
      $lookup: {
        from: "subscriptionplans",
        localField: "plan.subId",
        foreignField: "_id",
        as: "plan.subscription",
      },
    },
    {
      $project: {
        _id: 1,
        type: 1,
        amount: 1,
        createdAt: 1,
        updatedAt: 1,
        status: 1,
        user: {
          _id: "$user._id",
          idd: "$user.idd",
          role: "$user.role",
          fname: "$user.fname",
          lname: "$user.lname",
          email: "$user.email",
        },
        subscription: {
          _id: "$subscription._id",
          name: "$subscription.name",
        },
        plan: {
          _id: 1,
          planDurationType: 1,
          purchasedDate: 1,
          expiredOnDate: 1,
          subscription: {
            _id: 1,
            name: 1,
            monthlyPrice: 1,
            annuallyPrice: 1,
          },
        },
      },
    },
  ];

  const response = await OrderModel.aggregate(pipeline);
  return serviceResponse(true, HTTP_CODES.CREATED, MESSAGES.FETCH, response);
};

exports.deleteOrder = async (id) => {
  let findQuery = {
    _id: id,
    isDeleted: null,
  };
  const response = await OrderModel.findOneAndUpdate(findQuery, {
    isDeleted: new Date(),
  });
  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }
  return serviceResponse(true, HTTP_CODES.CREATED, MESSAGES.DELETED);
};
