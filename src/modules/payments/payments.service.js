const { HTTP_CODES, MESSAGES, CONSTANTS, URLS } = require("../../config");
const { serviceResponse } = require("../../helpers/response");
const { CardModel } = require("../../models/card.model");
const { CustomerModel } = require("../../models/customer");
const { MySubscriptionModel } = require("../../models/plans.selected.model");
const { SubscriptionsModel } = require("../../models/subsription.plans.model");
const { OrderModel } = require("../../models/orders.model");
const { User } = require("../../models/users.model");
const { STP, logger } = require("../../utils");
const {
  getExiredPlanDateAndTime,
  usesClreadedForModerator,
} = require("../../utils/plans.utils");
const { BadRequestException } = require("../../helpers/errorResponse");

exports.createCustomer = async (userId, payload) => {
  const isCustomer = await CustomerModel.findOne({
    userId: userId,
    isDeleted: null,
  });

  if (isCustomer) {
    return serviceResponse(
      false,
      HTTP_CODES.BAD_REQUEST,
      "You have already created customers"
    );
  }

  const options = {
    email: payload.email,
    name: payload.email,
    description: payload.description,
  };

  const customer = await STP.createStripeCustomer(options);

  if (!customer) {
    return serviceResponse(false, HTTP_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST);
  }

  payload.type = customer.object;
  payload.userId = userId;
  payload.custId = customer.id;
  const response = await CustomerModel.create(payload);

  if (!response) {
    return serviceResponse(false, HTTP_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST);
  }

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.CREATED);
};

exports.getMyCustomer = async (userId) => {
  const response = await CustomerModel.findOne({
    userId: userId,
    isDeleted: null,
  }).select("custId");

  //console.log({ response });

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  const costomer = await STP.getStripeCustomer(response?.custId);

  if (!costomer.success) {
    return serviceResponse(
      false,
      HTTP_CODES.BAD_REQUEST,
      "Customer not yet created"
    );
  }

  if (costomer.success && costomer.deleted) {
    return serviceResponse(
      false,
      HTTP_CODES.BAD_REQUEST,
      "Custer Has been Deleted"
    );
  }

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.FETCH, response);
};

exports.deleteMyCustomer = async (userId) => {
  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.DELETED);
};

exports.paymentMethod = async (userId, payload) => {
  const findQuery = {
    userId: userId,
    isDeleted: null,
  };
  const customer = await CustomerModel.findOne(findQuery).select("custId");

  if (!customer) {
    const options = {
      email: payload.email,
      name: payload.name,
      description: "Eskoops Subscription Customer",
      address: {
        line1: payload.address.line1,
        line2: payload.address.line2,
        city: payload.address.city,
        state: payload.address.state,
        postal_code: "45003",
        country: "US",
      },
    };

    const result = await STP.createStripeCustomer(options);
    if (!result) {
      return serviceResponse(
        false,
        HTTP_CODES.BAD_REQUEST,
        MESSAGES.BAD_REQUEST
      );
    }

    const data = {
      email: payload.email,
      name: payload.name,
      description: "Eskoops Subscription Customer",
      type: result.object,
      userId: userId,
      custId: result.id,
    };

    const createdCustomer = await CustomerModel.create(data);

    if (!createdCustomer) {
      return serviceResponse(
        false,
        HTTP_CODES.BAD_REQUEST,
        MESSAGES.BAD_REQUEST
      );
    }

    const response = await STP.createPaymentMethods(payload, result?.id);
    return serviceResponse(
      true,
      HTTP_CODES.OK,
      response.message,
      response.data
    );
  } else {
    const costomerStripe = await STP.getStripeCustomer(customer?.custId);

    if (
      !costomerStripe.success ||
      (costomerStripe.success && costomerStripe.deleted)
    ) {
      const options = {
        email: payload.email,
        name: payload.name,
        description: "Eskoops Subscription Customer",
        address: {
          line1: payload.address.line1,
          line2: payload.address.line2,
          city: payload.address.city,
          state: payload.address.state,
          postal_code: "45003",
          country: "US",
        },
      };

      const result = await STP.createStripeCustomer(options);
      if (!result) {
        return serviceResponse(
          false,
          HTTP_CODES.BAD_REQUEST,
          MESSAGES.BAD_REQUEST
        );
      }

      await CustomerModel.findOneAndUpdate(
        findQuery,
        {
          custId: result?.id,
        },
        { new: true }
      );

      const response = await STP.createPaymentMethods(payload, result.id);
      return serviceResponse(
        true,
        HTTP_CODES.OK,
        response.message,
        response.data
      );
    } else {
      const response = await STP.createPaymentMethods(
        payload,
        costomerStripe?.data?.custId
      );
      return serviceResponse(
        true,
        HTTP_CODES.OK,
        response.message,
        response.data
      );
    }
  }
};

exports.createCustomerPortal = async (userId, query) => {
  const { upgradeType } = query;
  const myPlan = await MySubscriptionModel.findOne({
    purchasedBy: userId,
    isDeleted: null,
  }).select(
    "planDurationType status pause_collection cancel_collection_by_admin"
  );

  if (!myPlan) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  if (myPlan.cancel_collection_by_admin) {
    return serviceResponse(
      false,
      HTTP_CODES.BAD_REQUEST,
      "Your plan is currently cancelled.Contact our Support team for assistance!"
    );
  }

  if (myPlan.pause_collection) {
    return serviceResponse(
      false,
      HTTP_CODES.BAD_REQUEST,
      "Your plan is currently paused. Contact our Support team for assistance!"
    );
  }

  if (upgradeType && upgradeType === "trial") {
    const upgradePlan = await SubscriptionsModel.findOne({
      name: "trial",
      isDeleted: null,
    }).select("name monthlyPrice annuallyPrice");

    if (!upgradePlan)
      return serviceResponse(false, HTTP_CODES.NOT_FOUND, `Trial Not Found!!!`);

    let update = {
      subId: upgradePlan._id,
      holdSubId: upgradePlan._id,
      planDurationType: "annually",
      usesCount: 0,
      purchasedDate: new Date(),
      expiredOnDate: new Date(),
    };

    update.isAssignedUser = false;
    update.isAddOnUser = false;
    update.isPlatinumTrial = false;
    update.plusNoOfUsers = 0;
    update.noOfAddOnUsers = 0;
    update.startTrial = null;
    update.endTrial = null;
    update.isResetAt = false;

    update.resetAt = getExiredPlanDateAndTime(
      CONSTANTS.PLAN_TYPE.MONTHLY,
      new Date(update.purchasedDate)
    ).expiredOnDate;

    const updateMySub = await MySubscriptionModel.findOneAndUpdate(
      { _id: myPlan._id, isDeleted: null },
      { $set: update },
      { new: true }
    );

    if (!updateMySub)
      return serviceResponse(
        false,
        HTTP_CODES.BAD_REQUEST,
        "Something went wrong"
      );

    logger.info(`Plan has been cancel successfully`);
    await usesClreadedForModerator(userId);
    logger.info(`Uses count has been updated...`);
    return serviceResponse(true, HTTP_CODES.OK, "Success");
  } else {
    const customer = await CustomerModel.findOne({
      userId: userId,
      isDeleted: null,
    }).select("custId");

    if (!customer) {
      return serviceResponse(
        false,
        HTTP_CODES.NOT_FOUND,
        "You have create customer"
      );
    }

    const response = await STP.createCustomerPortal(customer.custId);
    return serviceResponse(true, HTTP_CODES.OK, response.message, response);
  }
};

exports.getPaymentMethods = async (userId) => {
  const customer = await CustomerModel.findOne({
    userId: userId,
    isDeleted: null,
  }).select("custId");

  if (!customer) {
    return serviceResponse(
      false,
      HTTP_CODES.NOT_FOUND,
      "Customer does not exist"
    );
  }

  const response = await STP.getPaymentMethods(customer.custId);
  return serviceResponse(true, HTTP_CODES.OK, response.message, {
    default_payment_method:
      response.customer.invoice_settings.default_payment_method,
    data: response.data,
  });
};

exports.deletePaymentMethods = async (paymentMethodId) => {
  const response = await STP.deletePaymentMethod(paymentMethodId);
  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.DELETED, response);
};

exports.setAsDefaultPaymentMethod = async (userId, payload) => {
  const customer = await CustomerModel.findOne({
    userId: userId,
    isDeleted: null,
  }).select("custId");

  if (!customer) {
    return serviceResponse(
      false,
      HTTP_CODES.NOT_FOUND,
      "Customer does not exist"
    );
  }

  const response = await STP.setAsDefaultPaymentMethod(
    customer.custId,
    payload.paymentMethod
  );
  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.UPDATED, response);
};

exports.downloadInvoiceFromStripe = async (payload) => {
  const response = await STP.downloadInvoiceFromStripe(payload.invoiceId);
  return serviceResponse(true, HTTP_CODES.OK, response.message, response.data);
};

exports.getInvoices = async (userId) => {
  const customer = await CustomerModel.findOne({
    userId: userId,
    isDeleted: null,
  }).select("custId");

  if (!customer) {
    return serviceResponse(
      false,
      HTTP_CODES.NOT_FOUND,
      "Customer does not exist"
    );
  }

  const response = await STP.getInvoices(customer.custId);
  return serviceResponse(true, HTTP_CODES.OK, response.message, response.data);
};

exports.confirmPaymentIntent = async (payload) => {
  const { paymentIntent, paymentMethod } = payload;
  const response = await STP.confirmPaymentIntent(paymentIntent, paymentMethod);
  return serviceResponse(true, HTTP_CODES.OK, response.message, response.data);
};

exports.subscriptionPayout = async (userId, payload) => {
  const customer = await CustomerModel.findOne({
    userId: userId,
    isDeleted: null,
  }).select("custId");

  if (!customer) {
    return serviceResponse(
      false,
      HTTP_CODES.NOT_FOUND,
      "Customer does not exist"
    );
  }

  payload.currency = "INR";
  const response = await STP.createPaymentIntent(customer.custId, payload);
  return serviceResponse(true, HTTP_CODES.OK, response.message, response.data);
};

exports.createCard = async (userId, payload) => {
  let cardLast4 = payload.cardDetail.cardNumber;
  cardLast4 = cardLast4.substring(cardLast4.length - 4);
  const isMatch = await CardModel.findOne({
    userId: userId,
    last4: cardLast4,
    isDeleted: null,
  });

  if (!isMatch) {
    const card = await STP.createCard(payload);
    const response = await CardModel.create({
      userId: userId,
      custorerId: card.customer,
      cardId: card.id,
      last4: card.last4,
    });
    if (!response) {
      return serviceResponse(
        false,
        HTTP_CODES.BAD_REQUEST,
        MESSAGES.BAD_REQUEST
      );
    }
    return serviceResponse(
      true,
      HTTP_CODES.CREATED,
      MESSAGES.CREATED,
      response
    );
  } else {
    return serviceResponse(true, HTTP_CODES.OK, MESSAGES.OK, isMatch);
  }
};

exports.createPayment = async (payload) => {
  const response = await CardModel.findOne({
    _id: payload.cardId,
    userId: payload.userId,
    isDeleted: null,
  });

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  const paymentPayload = {
    amount: payload.amount * 100,
    currency: "inr",
    customer: response.custorerId,
    card: response.cardId,
    receipt_email: payload.email,
  };

  const paymentResponse = await STP.createCharges(paymentPayload);
  return serviceResponse(
    true,
    HTTP_CODES.CREATED,
    MESSAGES.CREATED,
    paymentResponse
  );
};
exports.createPaymentIntent = async () => {
  const { paymentIntent } = await STP.createPaymentIntent();
  return serviceResponse(true, HTTP_CODES.CREATED, MESSAGES.CREATED, {
    clientSecret: paymentIntent.client_secret,
  });
};

exports.createSubscriptions = async (userId, id, query) => {
  console.log("inside create subscription");
  const customer = await CustomerModel.findOne({
    userId: userId,
    isDeleted: null,
  }).select("custId");

  if (!customer) {
    return serviceResponse(
      false,
      HTTP_CODES.NOT_FOUND,
      "Customer does not exist"
    );
  }

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

  let subscription;
  if (query.interval === "month") {
    subscription = await STP.createSubscriptions(customer?.custId, {
      items: [{ price: response.monthlyPriceId }],
    });
  }

  if (query.interval === "year") {
    subscription = await STP.createSubscriptions(customer?.custId, {
      items: [{ price: response.monthlyPriceId }],
    });
  }

  return serviceResponse(
    true,
    HTTP_CODES.CREATED,
    MESSAGES.CREATED,
    subscription.data
  );
};

exports.createSubscriptionsCheckout = async (user, id, query) => {
  const myPlan = await MySubscriptionModel.findOne({
    purchasedBy: user.id,
    isDeleted: null,
  }).select(
    "planDurationType status pause_collection cancel_collection_by_admin"
  );

  if (!myPlan) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  if (myPlan.cancel_collection_by_admin) {
    return serviceResponse(
      false,
      HTTP_CODES.BAD_REQUEST,
      "You plan has been cancel by admin. Contact to support!"
    );
  }

  if (myPlan.pause_collection) {
    return serviceResponse(
      false,
      HTTP_CODES.BAD_REQUEST,
      "Your plan is currently paused. Contact our Support team for assistance!"
    );
  }

  let customerId;
  const customer = await CustomerModel.findOne({
    userId: user.id,
    isDeleted: null,
  }).select("custId");

  if (!customer) {
    const userDetail = await User.findOne({
      _id: user.id,
      isDeleted: null,
    }).select("fname lname email");

    if (userDetail && !userDetail.email) {
      return serviceResponse(
        false,
        HTTP_CODES.BAD_REQUEST,
        "Please update your profile by including your email address"
      );
    }

    const options = {
      email: userDetail?.email,
    };

    const customer = await STP.createStripeCustomer(options);

    const payload = {
      email: userDetail?.email,
      type: customer.object,
      userId: user?.id,
      custId: customer.id,
    };

    const response = await CustomerModel.create(payload);

    if (!response) {
      return serviceResponse(
        false,
        HTTP_CODES.BAD_REQUEST,
        MESSAGES.BAD_REQUEST
      );
    }
    customerId = response?.custId;
  } else {
    const isCustomer = await STP.getStripeCustomer(customer?.custId);
    if (isCustomer.success && isCustomer?.data?.deleted) {
      const userDetail = await User.findOne({
        _id: user.id,
        isDeleted: null,
      }).select("fname lname email");

      if (userDetail && !userDetail.email) {
        return serviceResponse(
          false,
          HTTP_CODES.BAD_REQUEST,
          "Please update your profile by including your email address"
        );
      }

      // console.log({ userDetail });

      const options = {
        email: userDetail?.email,
      };

      const created = await STP.createStripeCustomer(options);
      customerId = created?.id;

      await CustomerModel.findOneAndUpdate(
        { _id: customer.id, isDeleted: null },
        {
          custId: created?.id,
        }
      );
    } else {
      customerId = customer?.custId;
    }
  }

  let findQuery = {
    _id: id,
    isDeleted: null,
  };

  const response = await SubscriptionsModel.findOne(findQuery).select(
    " name monthlyProductId annuallyProductId monthlyPriceId annuallyPriceId monthlyPrice annuallyPrice description"
  );

  if (!response) {
    return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
  }

  logger.info(`Name : ${response.name}`);

  let subscription;
  let created;
  try {
    if (query.interval) {
      if (query.interval === "month") {
        created = await OrderModel.create({
          type: "subscription",
          userId: user.id,
          paymentMethod: "card",
          amount: response.monthlyPrice,
          subsId: id,
        });

        if (!created) {
          return serviceResponse(
            false,
            HTTP_CODES.BAD_REQUEST,
            MESSAGES.BAD_REQUEST
          );
        }

        subscription = await STP.createSubscriptionsCheckout(
          customerId,
          response.monthlyPriceId,
          {
            name: response.name,
            description: response.description,
            price: response.monthlyPrice,
            orderId: created._id.toString(),
          }
        );
      }

      if (query.interval === "year") {
        created = await OrderModel.create({
          type: "subscription",
          userId: user.id,
          paymentMethod: "card",
          amount: response.annuallyPrice,
          subsId: id,
        });

        if (!created) {
          return serviceResponse(
            false,
            HTTP_CODES.BAD_REQUEST,
            MESSAGES.BAD_REQUEST
          );
        }

        subscription = await STP.createSubscriptionsCheckout(
          customerId,
          response.annuallyPriceId,
          {
            name: response.name,
            description: response.description,
            price: response.annuallyPrice,
            orderId: created._id.toString(),
          }
        );
      }
    } else {
      created = await OrderModel.create({
        type: "subscription",
        userId: user.id,
        paymentMethod: "card",
        amount: response.monthlyPrice,
        subsId: id,
      });

      if (!created) {
        return serviceResponse(
          false,
          HTTP_CODES.BAD_REQUEST,
          MESSAGES.BAD_REQUEST
        );
      }

      subscription = await STP.createSubscriptionsCheckout(
        customerId,
        response.monthlyPriceId,
        {
          name: response.name,
          description: response.description,
          price: response.monthlyPrice,
          orderId: created._id.toString(),
        }
      );
    }
  } catch (error) {
    await OrderModel.findOneAndUpdate(
      {
        _id: created._id,
        isDeleted: null,
      },
      {
        isDeleted: new Date(),
      }
    );
    throw new BadRequestException("Unable to create checkout session");
  }

  return serviceResponse(
    true,
    HTTP_CODES.CREATED,
    MESSAGES.CREATED,
    subscription
  );
};

exports.updatePlanStatus = async (user) => {
  const customer = await CustomerModel.findOne({
    userId: user.id,
    isDeleted: null,
  }).select("custId");

  if (!customer) {
    console.log("customer not found");
    if (!response) {
      return serviceResponse(false, HTTP_CODES.NOT_FOUND, MESSAGES.NOT_FOUND);
    }
  }

  const subscription = await STP.updatePlanStatus(customer.custId);

  return serviceResponse(
    true,
    HTTP_CODES.CREATED,
    MESSAGES.CREATED,
    subscription
  );
};

exports.getSubscriptions = async (userId) => {
  const customer = await CustomerModel.findOne({
    userId: userId,
    isDeleted: null,
  }).select("custId");

  if (!customer) {
    return serviceResponse(
      false,
      HTTP_CODES.NOT_FOUND,
      "Customer does not exist"
    );
  }

  const subscription = await STP.getSubscriptions(customer?.custId);

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.OK, subscription);
};

exports.pausedSubscriptions = async (userId) => {
  const customer = await CustomerModel.findOne({
    userId: userId,
    isDeleted: null,
  }).select("custId");

  if (!customer) {
    return serviceResponse(
      false,
      HTTP_CODES.NOT_FOUND,
      "Customer does not exist"
    );
  }

  const subscription = await STP.pausedSubscriptions(customer?.custId);

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.OK, subscription);
};

exports.resumedSubscriptions = async (userId) => {
  const customer = await CustomerModel.findOne({
    userId: userId,
    isDeleted: null,
  }).select("custId");

  if (!customer) {
    return serviceResponse(
      false,
      HTTP_CODES.NOT_FOUND,
      "Customer does not exist"
    );
  }

  const subscription = await STP.resumedSubscriptions(customer?.custId);

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.OK, subscription);
};

exports.cancelSubscriptions = async (userId) => {
  const customer = await CustomerModel.findOne({
    userId: userId,
    isDeleted: null,
  }).select("custId");

  if (!customer) {
    return serviceResponse(
      false,
      HTTP_CODES.NOT_FOUND,
      "Customer does not exist"
    );
  }

  const subscription = await STP.cancelSubscriptions(customer?.custId);

  if (!subscription?.success) {
    return serviceResponse(
      false,
      HTTP_CODES.BAD_REQUEST,
      "Subscription already cancel"
    );
  }

  const response = await MySubscriptionModel.findOne({
    purchasedBy: userId,
  }).populate({ path: "subId", model: SubscriptionsModel });

  if (!response) logger.error("Subscription Does not exist");

  if (response) {
    const upgradePlan = await SubscriptionsModel.findOne({
      name: "trial",
      isDeleted: null,
    }).select("name monthlyPrice annuallyPrice");

    if (!upgradePlan) logger.error(`Trial Not Found!!!`);

    if (upgradePlan) {
      let update = {
        subId: upgradePlan._id,
        planDurationType: "annually",
        purchasedDate: new Date(),
        cancel_collection_by_admin: true,
      };

      update.expiredOnDate = getExiredPlanDateAndTime(
        update.planDurationType,
        update.purchasedDate
      ).expiredOnDate;

      await MySubscriptionModel.findOneAndUpdate(
        { _id: response._id, isDeleted: null },
        { $set: update },
        { new: true }
      );

      logger.info(`Plan has been cancel successfully`);
    }
  }

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.OK, subscription.data);
};

exports.cancelModeratorAllowToPurchaseSubs = async (userId) => {
  const response = await MySubscriptionModel.findOne({
    purchasedBy: userId,
  });

  if (!response)
    return serviceResponse(
      false,
      HTTP_CODES.NOT_FOUND,
      "Subscription Does not exist"
    );

  let update = {
    pause_collection: false,
    cancel_collection_by_admin: false,
  };

  await MySubscriptionModel.findOneAndUpdate(
    { _id: response._id, isDeleted: null },
    { $set: update },
    { new: true }
  );

  return serviceResponse(true, HTTP_CODES.OK, MESSAGES.UPDATED);
};
