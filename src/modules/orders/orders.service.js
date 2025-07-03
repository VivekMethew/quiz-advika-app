const { HTTP_CODES, CONSTANTS, MESSAGES } = require("../../config");
const { serviceResponse } = require("../../helpers/response");
const { quizPollModel } = require("../../models/quiz.poll.model");
const { QuestionModel } = require("../../models/questions.model");
const {
  createPaymentSession,
  createStripeCustomer,
  getStripeCustomer,
  createAddOnPaymentSession,
} = require("../../utils/stripe.utils");
const { generateStartTimeEnd } = require("../../utils/dateUtils");
const { generateQuizPollCode } = require("../../utils/generate.utils");
const { OrderModel } = require("../../models/orders.model");
const { pagination, logger } = require("../../utils");
const { CustomerModel } = require("../../models/customer");
const { MySubscriptionModel } = require("../../models/plans.selected.model");
const { User } = require("../../models/users.model");
const ExchangeRateModel = require("../../models/exchangeRate");
const { SubscriptionsModel } = require("../../models/subsription.plans.model");
const { FileModel } = require("../../models/files.model");

exports.addOnCheckout = async (query, payload) => {
  // payload= userId, noOfpackages
  //const price=payload.noOfPackages*1000;

  const response = await MySubscriptionModel.findOne({
    purchasedBy: payload.userId,
    isDeleted: null,
  });
  // error handling
  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  if (query.customPurchase === "free") {
    if (!response.isAddonPurchaseUnlimited) {
      return serviceResponse(
        false,
        HTTP_CODES.BAD_REQUEST,
        MESSAGES.UNLIMITED_USER_NOT_ALLOWED
      );
    }

    await MySubscriptionModel.findOneAndUpdate(
      {
        purchasedBy: payload.userId,
        isDeleted: null,
      },
      {
        isAddOnUser: true,
        $inc: {
          noOfAddOnUsers:
            parseInt(payload.noOfPackages) * CONSTANTS.USER.ADDONPACK.PACK,
        },
      },
      { new: true }
    );

    return serviceResponse(
      true,
      HTTP_CODES.OK,
      `${
        parseInt(payload.noOfPackages) * CONSTANTS.USER.ADDONPACK.PACK
      } Players successfully added`
    );

    console.log(
      `${
        parseInt(purchasedOrder.metadata.noOfPackages) *
        CONSTANTS.USER.ADDONPACK.PACK
      } Plays successfully added`
    );
  } else {
    const price = payload.noOfPackages * 1000;

    const created = await OrderModel.create({
      type: "addOnPack",
      userId: payload.userId,
      amount: price,
      paymentMethod: "card",
    });

    if (!created) {
      return serviceResponse(
        false,
        HTTP_CODES.BAD_REQUEST,
        MESSAGES.BAD_REQUEST
      );
    }

    const user = await User.findOne({
      _id: payload.userId,
      isDeleted: null,
    }).select("id email");

    if (user && !user.email) {
      return serviceResponse(
        false,
        HTTP_CODES.NOT_FOUND,
        "Update Your Email Address"
      );
    }

    const customer = await CustomerModel.findOne({
      userId: payload.userId,
      isDeleted: null,
    }).select("custId");

    if (!customer) {
      const createdCustomer = await createStripeCustomer({
        email: user.email,
      });
      payload.custId = createdCustomer.id;
      await CustomerModel.create({
        userId: user._id,
        custId: createdCustomer.id,
      });
    } else {
      const newCustomer = await getStripeCustomer(customer.custId);
      if (newCustomer.success) {
        payload.custId = customer.custId;
      } else {
        const createdCustomer = await createStripeCustomer({
          email: user.email,
        });
        payload.custId = createdCustomer.id;
        await CustomerModel.findOneAndUpdate(
          {
            userId: payload.userId,
            isDeleted: null,
          },
          {
            custId: createdCustomer.id,
          },
          { new: true }
        );
      }
    }

    payload.orderId = created._id;
    payload.items = [];

    payload.items.push({
      price: price,
      currency: "inr",
      title: "addOnUsers",
      noOfPacks: payload.noOfPackages,
    });

    const paymentResponse = await createAddOnPaymentSession(payload);
    console.log(paymentResponse);

    return serviceResponse(
      true,
      HTTP_CODES.CREATED,
      MESSAGES.CREATED,
      paymentResponse
    );
  }
  //payload.mySubscritionId=response._id;
};

exports.checkout = async (payload) => {
  const response = await quizPollModel
    .findOne({
      _id: payload.productId,
      isDeleted: null,
    })
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
    });

  let copyPayload = {
    title: response.title,
    type: response.type,
    catId: response.catId,
    description: response.description,
    coverImage: response.coverImage,
    tags: response.tags,
    startDateTime: new Date(),
    duration: response.duration,
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
    };
  });

  copyPayload.questions = [];

  for (let obj of questions) {
    const created = await QuestionModel.create(obj);
    copyPayload.questions.push(created._id);
  }

  copyPayload.code = await generateQuizPollCode();
  const { startISO, endISO, timezon } = generateStartTimeEnd(
    copyPayload.startDateTime,
    copyPayload.duration
  );
  delete copyPayload.startDateTime;
  copyPayload.startDateTime = startISO;
  copyPayload.endDateTime = endISO;
  copyPayload.timezon = timezon;
  copyPayload.userId = payload.userId;
  copyPayload.createdFrom = response._id;
  copyPayload.isCreatedFrom = true;
  copyPayload.isDated = new Date();
  copyPayload.status = response.isPaid ? "order" : "pending";

  const quizAndPollCreated = await quizPollModel.create(copyPayload);

  if (response.isPaid) {
    // const currency = await ExchangeRateModel.findOne({ isDeleted: null }).sort({ createdAt: -1 }).select('amount toCurrency')
    // console.log({ currency })

    const created = await OrderModel.create({
      type: "product",
      userId: copyPayload.userId,
      quizAndPollId: copyPayload.createdFrom,
      amount: response.price,
      paymentMethod: "card",
    });
    console.log("created", created);

    if (!created) {
      return serviceResponse(
        false,
        HTTP_CODES.BAD_REQUEST,
        MESSAGES.BAD_REQUEST
      );
    }

    const user = await User.findOne({
      _id: payload.userId,
      isDeleted: null,
    }).select("id email");

    if (user && !user.email) {
      return serviceResponse(
        false,
        HTTP_CODES.NOT_FOUND,
        "Update Your Email Address"
      );
    }

    const customer = await CustomerModel.findOne({
      userId: payload.userId,
      isDeleted: null,
    }).select("custId");

    if (!customer) {
      const createdCustomer = await createStripeCustomer({
        email: user.email,
      });
      payload.custId = createdCustomer.id;
    } else {
      const newCustomer = await getStripeCustomer(customer.custId);
      if (newCustomer.success) {
        payload.custId = customer.custId;
      } else {
        const createdCustomer = await createStripeCustomer({
          email: user.email,
        });
        payload.custId = createdCustomer.id;
        await CustomerModel.findOneAndUpdate(
          {
            userId: payload.userId,
            isDeleted: null,
          },
          {
            custId: createdCustomer.id,
          },
          { new: true }
        );
      }
    }

    payload.orderId = created._id;
    payload.copyFrom = response._id;
    payload.productID = quizAndPollCreated._id;
    payload.items = [];

    payload.items.push({
      price: response.price,
      currency: "inr",
      title: response.title,
      images: [response.coverImage],
      description: response.description,
    });

    const paymentResponse = await createPaymentSession(payload);

    console.log("paymentResponse", paymentResponse);

    return serviceResponse(
      true,
      HTTP_CODES.CREATED,
      MESSAGES.CREATED,
      paymentResponse
    );
  } else {
    await quizPollModel.findOneAndUpdate(
      { _id: copyPayload.createdFrom, isDeleted: null },
      { $inc: { purchaseCount: 1 } }
    );

    logger.info(`ID : ${quizAndPollCreated._id}`);

    await quizPollModel.findOneAndUpdate(
      { _id: quizAndPollCreated._id, isDeleted: null },
      { isPurchased: true }
    );

    console.log("Soccessfully Increamented");
    return serviceResponse(true, HTTP_CODES.CREATED, MESSAGES.CREATED);
  }
};

exports.getMyOrders = async (userId, query) => {
  let { page, limit, order, type } = query;
  const findQuery = {};
  let sort = {};
  findQuery["$and"] = [];
  findQuery["$and"].push({
    userId: userId,
    paymentStatus: "paid",
    isDeleted: null,
  });

  // if (type) {
  //   findQuery["$and"].push({ $or: [{ type: type }, { type: "addOnPack" }] });
  // }

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

  const response = await OrderModel.find(findQuery)
    .sort(sort)
    .skip(offset)
    .limit(limit)
    .populate({
      path: "userId",
      select: "role fname lname email phone",
      model: User,
    })
    .populate({
      path: "planId",
      select: "purchasedDate expiredOnDate",
      populate: { path: "subId", select: "name", model: SubscriptionsModel },
      model: MySubscriptionModel,
    })
    .populate({
      path: "quizAndPollId",
      select: "type title coverImage",
      model: FileModel,
    })
    .select("-paymentResponse");

  return serviceResponse(
    true,
    HTTP_CODES.OK,
    MESSAGES.OK,
    pagination.getPagingData(
      {
        count: await OrderModel.countDocuments(findQuery),
        rows: response,
      },
      page,
      limit
    )
  );
};

exports.deleteMyOrders = async (id) => {
  const response = await OrderModel.findOneAndUpdate(
    { _id: id, isDeleted: null },
    { isDeleted: new Date() },
    { new: true }
  );
  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }
  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.DELETED);
};

exports.copyProduct = async (payload) => {
  const response = await quizPollModel
    .findOne({
      _id: payload.productId,
      isDeleted: null,
    })
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
    });

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  const copyCount = response.copyCount;

  let copyPayload = {
    title:
      copyCount === 0
        ? response.title + " - Copy "
        : response.title + " - Copy " + "(" + copyCount + ")",
    type: response.type,
    catId: response.catId,
    description: response.description,
    coverImage: response.coverImage,
    tags: response.tags,
    startDateTime: response.startDateTime,
    endDateTime: response.endDateTime,
    timezon: response.timezon,
    isDated: new Date(),
    duration: response.duration,
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
  copyPayload.isDuplicate = true;

  const quizAndPollCreated = await quizPollModel.create(copyPayload);

  await quizPollModel.findOneAndUpdate(
    { _id: payload.productId, isDeleted: null },
    {
      $inc: { copyCount: 1 },
    }
  );

  return serviceResponse(
    true,
    HTTP_CODES.CREATED,
    MESSAGES.CREATED,
    quizAndPollCreated
  );
};

exports.getAllOrders = async (userId, query) => {
  const response = await OrderModel.find({
    type: "product",
    userId: userId,
    isDeleted: null,
  }).select("-paymentResponse");
  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.FETCH, response);
};
