const { CONSTANTS } = require("../config");
const { CustomerModel } = require("../models/customer");
const { OrderModel } = require("../models/orders.model");
const { MySubscriptionModel } = require("../models/plans.selected.model");
const { quizPollModel } = require("../models/quiz.poll.model");
const { SubscriptionsModel } = require("../models/subsription.plans.model");
const {
  getExiredPlanDateAndTime,
  usesClreadedForModerator,
} = require("./plans.utils");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createStripeCustomer = async (payload) => {
  const customer = await stripe.customers.create(payload);
  return customer;
};

exports.getStripeCustomer = async (customerId) => {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    return {
      success: true,
      message: "success",
      data: customer,
    };
  } catch (error) {
    if (error.statusCode === 404) {
      return { success: false, message: "Customer does not exist" };
    }
    return { success: false, message: error.message };
  }
};

exports.setAsDefaultPaymentMethod = async (customerId, paymentMethod) => {
  const update = await stripe.customers.update(customerId, {
    invoice_settings: { default_payment_method: paymentMethod },
  });
  return update;
};

exports.createPaymentMethods = async (payload, customerId) => {
  try {
    delete payload.country;
    delete payload.postal_code;

    payload.country = "US";
    payload.postal_code = "34561";

    const method = await stripe.paymentMethods.create({
      type: "card",
      card: { token: payload.token },
      billing_details: {
        name: payload.name,
        address: payload.address,
      },
    });

    const paymentMethodAttach = await stripe.paymentMethods.attach(method.id, {
      customer: customerId,
    });

    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: method.id,
      },
    });

    return {
      success: true,
      message: "Payment method attached succesully",
      data: paymentMethodAttach,
    };
  } catch (error) {
    throw error;
  }
};

exports.createPaymentIntent = async (customerId, payload) => {
  let options = {
    amount: payload.amount * 100,
    currency: payload.currency,
    customer: customerId,
    payment_method: payload.paymentMethod,
    confirmation_method: "manual", // For 3D Security
    description: "Subscription Purchase",
    metadata: {
      subscription_id: payload.subscriptionId, // Optional: link to subscription
    },
  };

  const paymentIntent = await stripe.paymentIntents.create(options);
  return {
    success: true,
    message: "Payment has been initiate",
    data: paymentIntent,
  };
};

exports.confirmPaymentIntent = async (paymentIntent, paymentMethod) => {
  const intent = await stripe.paymentIntents.confirm(paymentIntent, {
    payment_method: paymentMethod,
  });
  return {
    success: true,
    message: "Success",
    data: intent,
  };
};

exports.getPaymentMethods = async (customerId) => {
  const customer = await stripe.customers.retrieve(customerId);

  const paymentMethods = await stripe.customers.listPaymentMethods(customerId, {
    type: "card",
  });
  return {
    success: true,
    message: "Successfuly get methods",
    data: paymentMethods.data,
    customer,
  };
};

exports.deletePaymentMethod = async (paymentMethodId) => {
  const detachedPaymentMethod =
    await stripe.paymentMethods.detach(paymentMethodId);
  return detachedPaymentMethod;
};

exports.createCustomerPortal = async (customerId) => {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.STRIPE_FROTENT_URL}/profile`,
  });

  return session.url;
};

exports.downloadInvoiceFromStripe = async (invoiceId) => {
  const invoices = await stripe.invoices.retrieve(invoiceId);
  const pdfData = invoices.invoice_pdf;
  return {
    success: true,
    message: "Successfuly get methods",
    data: invoices,
  };
};

exports.createCard = async (payload) => {
  const customer = await this.createStripeCustomer({
    email: payload.email,
    name: payload.email,
    description: payload.description,
  });
  const card = await stripe.customers.createSource(customer.id, {
    source: "tok_visa",
  });
  return card;
};

exports.createCharges = async (payload) => {
  const order = await stripe.charges.create(payload);
  return order;
};

exports.createAddOnPaymentSession = async (payload) => {
  const modfiedItems = payload.items.map((item) => {
    return {
      quantity: 1,
      tax_rates: [process.env.GST_TAX_ID],
      price_data: {
        currency: item.currency,
        unit_amount: item.price * 100,
        product_data: {
          name: item.title,
        },
      },
    };
  });

  const session = await stripe.checkout.sessions.create({
    customer: payload?.custId,
    payment_method_types: ["card"],
    shipping_address_collection: {
      allowed_countries: ["US", "IN"],
    },
    line_items: modfiedItems,
    mode: "payment",
    success_url: `${process.env.STRIPE_FROTENT_URL}/profile`,
    cancel_url: `${process.env.STRIPE_FROTENT_URL}/profile`,
    metadata: {
      orderId: payload.orderId.toString(),
      type: "addOnPack",
      email: payload.email,
      noOfPackages: payload.noOfPackages,
      // mySubscritionId:payload.mySubscritionId.toString(),
    },
  });
  return session;
};

exports.createPaymentSession = async (payload) => {
  const modfiedItems = payload.items.map((item) => {
    return {
      quantity: 1,
      tax_rates: [process.env.GST_TAX_ID],
      price_data: {
        currency: item.currency,
        unit_amount: item.price * 100,
        product_data: {
          name: item.title,
          description: item.description,
        },
      },
    };
  });

  const session = await stripe.checkout.sessions.create({
    customer: payload?.custId,
    payment_method_types: ["card"],
    shipping_address_collection: {
      allowed_countries: ["US", "IN"],
    },
    line_items: modfiedItems,
    mode: "payment",
    success_url: `${process.env.STRIPE_FROTENT_URL}/checkout-success?id=${payload.productID}`,
    cancel_url: `${process.env.STRIPE_FROTENT_URL}/payment-failed`,
    metadata: {
      orderId: payload.orderId.toString(),
      token: payload.productID.toString(),
      copyFrom: payload.copyFrom.toString(),
      email: payload.email,
      images: JSON.stringify(payload.items.map((item) => item.images[0])),
    },
  });
  return session;
};

// subscriptions UTILS
exports.createSubscriptions = async (customerId, payload) => {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: payload.items,
    payment_settings: {
      payment_method_options: {
        card: {
          request_three_d_secure: "any",
        },
      },
      payment_method_types: ["card"],
      save_default_payment_method: "on_subscription",
    },
    expand: ["latest_invoice.payment_intent"],
  });

  return {
    success: true,
    message: "Payment has been initiate",
    data: subscription.latest_invoice.payment_intent,
  };
};

exports.getInvoices = async (customerId) => {
  const result = [];
  const invoices = await stripe.invoices.list({
    customer: customerId,
  });

  for (let obj of invoices.data) {
    const { name } = await stripe.products.retrieve(
      obj.lines.data[0].plan.product
    );

    result.push({
      id: obj.id,
      number: obj.number,
      period_end: obj.period_end,
      period_start: obj.period_start,
      data: {
        priceId: obj.lines.data[0].plan.id,
        product: obj.lines.data[0].plan.product,
      },
      product: name,
      hosted_invoice_url: obj.hosted_invoice_url,
      invoice_pdf: obj.invoice_pdf,
      status: obj.status,
      amount_paid: obj.amount_paid,
      total: obj.total,
    });
  }

  return {
    success: true,
    message: "Successfuly get methods",
    data: result,
  };
};

exports.createCoupons = async (percent_off) => {
  const coupon = await stripe.coupons.create({
    duration: "forever",
    percent_off,
  });
  return coupon;
};

exports.createSubscriptionsCheckout = async (
  customerId,
  priceId,
  metadata = {}
) => {
  console.log({ customerId, priceId });
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    shipping_address_collection: {
      allowed_countries: ["US", "CA", "IN"], // Specify the allowed countries for shipping
    },
    allow_promotion_codes: true,
    payment_method_types: ["card"],
    line_items: [
      {
        quantity: 1,
        price: priceId,
        tax_rates: [process.env.GST_TAX_ID],
      },
    ],
    consent_collection: {
      terms_of_service: "required", // Set the consent to required
    },
    custom_text: {
      terms_of_service_acceptance: {
        message: "I agree to the terms & conditions on this purchase.",
      },
    },
    success_url: `${process.env.STRIPE_FROTENT_URL}/profile`,
    cancel_url: `${process.env.STRIPE_FROTENT_URL}/profile`,
    metadata: metadata,
  });

  return session.url;
};

exports.getSubscriptions = async (customerId) => {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
  });
  return subscriptions?.data.map((item) => {
    return {
      id: item.id,
      status: item.status,
      object: item.object,
      pause_collection: item.pause_collection,
      start_date: item.start_date,
      current_period_end: item.current_period_end,
      current_period_start: item.current_period_start,
      created: item.created,
      billing_cycle_anchor: item.billing_cycle_anchor,
    };
  })[0];
};

exports.pausedSubscriptions = async (customerId) => {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
    });

    const updated = await stripe.subscriptions.update(
      subscriptions?.data[0]?.id,
      {
        pause_collection: { behavior: "void" },
      }
    );

    return {
      id: updated.id,
      status: updated.status,
      object: updated.object,
      pause_collection: updated.pause_collection,
      start_date: updated.start_date,
      current_period_end: updated.current_period_end,
      current_period_start: updated.current_period_start,
      created: updated.created,
      billing_cycle_anchor: updated.billing_cycle_anchor,
    };
  } catch (error) {
    throw error;
  }
};

exports.resumedSubscriptions = async (customerId) => {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
    });

    const updated = await stripe.subscriptions.update(
      subscriptions?.data[0]?.id,
      {
        pause_collection: null,
      }
    );

    return {
      id: updated.id,
      status: updated.status,
      object: updated.object,
      pause_collection: updated.pause_collection,
      start_date: updated.start_date,
      current_period_end: updated.current_period_end,
      current_period_start: updated.current_period_start,
      created: updated.created,
      billing_cycle_anchor: updated.billing_cycle_anchor,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.cancelSubscriptions = async (customerId) => {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
    });

    if (subscriptions?.data.length > 0) {
      const deleted = await stripe.subscriptions.cancel(
        subscriptions?.data[0]?.id,
        {
          cancellation_details: { feedback: "other" },
        }
      );

      return {
        success: true,
        data: {
          id: deleted.id,
          status: deleted.status,
          object: deleted.object,
          cancel_at_period_end: deleted.cancel_at_period_end,
          cancel_at: deleted.cancel_at,
          start_date: deleted.start_date,
          current_period_end: deleted.current_period_end,
          current_period_start: deleted.current_period_start,
          created: deleted.created,
          billing_cycle_anchor: deleted.billing_cycle_anchor,
        },
      };
    }
    return { success: false };
  } catch (error) {
    throw error;
  }
};

exports.addSubscictionProduct = async (payload) => {
  const product = await stripe.products.create({
    name: payload.name,
    description: payload.description,
  });

  return product;
};

exports.deleteSubscictionProduct = async (productId, payload) => {
  const deletedProduct = await stripe.products.update(productId, payload);
  return deletedProduct;
};

exports.addSubscictionPrices = async (payload) => {
  const price = await stripe.prices.create({
    unit_amount: payload.price * 100, // The amount in cents (or equivalent currency)
    currency: payload.currency, // The currency of the price
    recurring: {
      interval: payload.inverval, //"month", // Billing interval (monthly)
    },
    product: payload.id, // The ID of the Product you created
  });

  return price;
};

exports.deleteSubscictionPrices = async (priceId, payload) => {
  const deletedPrice = await stripe.prices.update(priceId, payload);
  return deletedPrice;
};

exports.paymentHook = async (req, res) => {
  const payloadString = JSON.stringify(req.body, null, 2);
  const header = stripe.webhooks.generateTestHeaderString({
    payload: payloadString,
    secret: process.env.WEBHOOK_ENDPOINT_SECRET,
  });

  const event = stripe.webhooks.constructEvent(
    payloadString,
    header,
    process.env.WEBHOOK_ENDPOINT_SECRET
  );
  console.log("payment.type", event.type);
  console.log(event.data.object);

  switch (event.type) {
    case "checkout.session.completed":
      const purchasedOrder = event.data.object;
      console.log(
        purchasedOrder.mode,
        purchasedOrder.mode === "payment",
        purchasedOrder.status,
        purchasedOrder.status === "complete"
      );
      const metadata = event.data.object.metadata;
      if (metadata.type && metadata.type === "addOnPack") {
        if (
          purchasedOrder.mode === "payment" &&
          purchasedOrder.status === "complete"
        ) {
          const orderDetail = await OrderModel.findOne({
            _id: purchasedOrder.metadata.orderId,
            paymentStatus: "pending",
            isDeleted: null,
          });

          if (orderDetail) {
            await OrderModel.findOneAndUpdate(
              {
                _id: purchasedOrder.metadata.orderId,
                paymentStatus: "pending",
                isDeleted: null,
              },
              {
                paymentStatus: "paid",
                transactionId: purchasedOrder.payment_intent,
                paymentResponse: JSON.stringify(purchasedOrder),
              }
            );

            console.log("Order Status has been updated");
            await MySubscriptionModel.findOneAndUpdate(
              {
                purchasedBy: orderDetail.userId,
                isDeleted: null,
              },
              {
                isAddOnUser: true,
                $inc: {
                  noOfAddOnUsers:
                    parseInt(purchasedOrder.metadata.noOfPackages) *
                    CONSTANTS.USER.ADDONPACK.PACK,
                },
              },
              { new: true }
            );

            console.log(
              `${
                parseInt(purchasedOrder.metadata.noOfPackages) *
                CONSTANTS.USER.ADDONPACK.PACK
              } Plays successfully added`
            );
          } else {
            console.log("Order does not exist!!!");
          }
        }
      } else {
        if (
          purchasedOrder.mode === "payment" &&
          purchasedOrder.status === "complete"
        ) {
          await OrderModel.findOneAndUpdate(
            {
              _id: purchasedOrder.metadata.orderId,
              paymentStatus: "pending",
              isDeleted: null,
            },
            {
              paymentStatus: "paid",
              transactionId: purchasedOrder.payment_intent,
              paymentResponse: JSON.stringify(purchasedOrder),
            }
          );

          console.log("Order Status has been updated");
          await quizPollModel.findOneAndUpdate(
            {
              _id: purchasedOrder.metadata.token,
              status: "order",
              isDeleted: null,
            },
            { status: "pending", isPurchased: true, isDated: new Date() }
          );

          console.log("Quiz/Poll has been Updated");
          await quizPollModel.findOneAndUpdate(
            { _id: purchasedOrder.metadata.copyFrom, isDeleted: null },
            { $inc: { purchaseCount: 1 } }
          );
          console.log("Purchase count hasSoccessfully Increamented");
        }
      }

      break;
    case "customer.subscription.deleted":
      const deletedSubscription = event.data.object;
      console.log({ status: deletedSubscription.status });
      break;
    case "customer.subscription.updated":
      const payload = event.data.object;
      if (payload.status === "canceled") {
        await this.updatePlanCancelStatus(
          payload.customer,
          payload.plan.interval,
          payload.plan.id,
          payload.plan.product,
          {
            current_period_end: new Date(
              payload.current_period_end * 1000
            ).toISOString(),
            current_period_start: new Date(
              payload.current_period_start * 1000
            ).toISOString(),
          }
        );
      } else if (payload.status === "active" && !payload.pause_collection) {
        console.log(
          "payload.status === ",
          payload.status === "active",
          !payload.pause_collection
        );
        await this.updatePlanStatus(
          payload.customer,
          payload.plan.interval,
          payload.plan.id,
          payload.plan.product,
          {
            current_period_end: new Date(
              payload.current_period_end * 1000
            ).toISOString(),
            current_period_start: new Date(
              payload.current_period_start * 1000
            ).toISOString(),
          }
        );

        await this.updateOrderPaymentStatus(payload.metadata.orderId, payload);
      } else if (
        payload.status === "active" &&
        payload.pause_collection &&
        payload.pause_collection.behavior === "void"
      ) {
        await this.updatePlanPuaseStatus(
          payload.customer,
          payload.plan.interval,
          payload.plan.id,
          payload.plan.product,
          {
            current_period_end: new Date(
              payload.current_period_end * 1000
            ).toISOString(),
            current_period_start: new Date(
              payload.current_period_start * 1000
            ).toISOString(),
          }
        );
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  res.sendStatus(200);
};

exports.updateOrderPaymentStatus = async (orderId, purchasedOrder) => {
  try {
    await OrderModel.findOneAndUpdate(
      { _id: orderId, isDeleted: null },
      {
        paymentStatus: "paid",
        transactionId: purchasedOrder.payment_intent,
        paymentResponse: JSON.stringify(purchasedOrder),
      }
    );
  } catch (error) {
    console.log(error.message);
  }
};

exports.updatePlanStatus = async (
  customerId,
  interval,
  priceId,
  productId,
  payload
) => {
  console.log("stripe.updatePlanStatus", {
    customerId,
    interval,
    priceId,
    productId,
    payload,
  });
  try {
    const customer = await CustomerModel.findOne({
      custId: customerId,
      isDeleted: null,
    }).select("custId userId");

    if (!customer) return console.log("Customer Does not exist");

    const response = await MySubscriptionModel.findOne({
      purchasedBy: customer.userId,
    }).populate({ path: "subId", model: SubscriptionsModel });

    if (!response) return console.log("Subscription Does not exist");

    if (response.pause_collection) {
      const updatedResumed = await MySubscriptionModel.findOneAndUpdate(
        { _id: response._id, pause_collection: true, isDeleted: null },
        { pause_collection: false },
        { new: true }
      );
      console.log({ pause_collection: updatedResumed.pause_collection });
      console.log("Subscription has been resumed");
    }

    console.log({ interval });

    if (interval === "month") {
      const upgradePlan = await SubscriptionsModel.findOne({
        monthlyPriceId: priceId,
        monthlyProductId: productId,
        isDeleted: null,
      }).select("name monthlyPrice annuallyPrice");

      if (!upgradePlan) return console.log(`${payload.name} Not Found!!!`);

      let update = {
        subId: upgradePlan._id,
        holdSubId: upgradePlan._id,
        planDurationType: interval === "month" ? "monthly" : "annually",
        usesCount: 0,
        purchasedDate: payload.current_period_start,
        expiredOnDate: payload.current_period_end,
      };

      update.isAssignedUser = false;
      update.isAddOnUser = false;
      update.isPlatinumTrial = false;
      update.plusNoOfUsers = 0;
      update.noOfAddOnUsers = 0;
      update.startTrial = null;
      update.endTrial = null;

      update.isResetAt = true;

      console.log({ purchasedDate: update.purchasedDate });

      update.resetAt = getExiredPlanDateAndTime(
        CONSTANTS.PLAN_TYPE.MONTHLY,
        new Date(update.purchasedDate)
      ).expiredOnDate;

      const updateMySub = await MySubscriptionModel.findOneAndUpdate(
        { _id: response._id, isDeleted: null },
        { $set: update },
        { new: true }
      );

      console.log({ resetAt: updateMySub.resetAt });

      if (!updateMySub) return console.log(`Something went wrong`);

      console.log(
        `${
          interval === "month" ? "monthly" : "annually"
        } plan has been update successfully`
      );

      await usesClreadedForModerator(customer.userId);
      console.log(`Uses count has been updated...`);
    } else {
      const upgradePlan = await SubscriptionsModel.findOne({
        annuallyPriceId: priceId,
        annuallyProductId: productId,
        isDeleted: null,
      }).select("name monthlyPrice annuallyPrice");

      if (!upgradePlan) return console.log(`${payload.name} Not Found!!!`);
      let update = {
        subId: upgradePlan._id,
        holdSubId: upgradePlan._id,
        planDurationType: interval === "month" ? "monthly" : "annually",
        usesCount: 0,
        purchasedDate: payload.current_period_start,
        expiredOnDate: payload.current_period_end,
      };

      update.isAssignedUser = false;
      update.isAddOnUser = false;
      update.isPlatinumTrial = false;
      update.plusNoOfUsers = 0;
      update.noOfAddOnUsers = 0;
      update.startTrial = null;
      update.endTrial = null;

      update.isResetAt = true;

      update.resetAt = getExiredPlanDateAndTime(
        CONSTANTS.PLAN_TYPE.MONTHLY,
        new Date(update.purchasedDate)
      ).expiredOnDate;

      const updateMySub = await MySubscriptionModel.findOneAndUpdate(
        { _id: response._id, isDeleted: null },
        { $set: update },
        { new: true }
      );

      if (!updateMySub) return console.log(`Something went wrong`);

      console.log(
        `${
          interval === "month" ? "monthly" : "annually"
        } plan has been update successfully`
      );
      await usesClreadedForModerator(customer.userId);
      console.log(`Uses count has been updated...`);
    }
  } catch (error) {
    console.log(error.message);
  }
};

exports.updatePlanCancelStatus = async (
  customerId,
  interval,
  priceId,
  productId,
  payload
) => {
  console.log({ customerId, interval, priceId, productId });
  try {
    const customer = await CustomerModel.findOne({
      custId: customerId,
      isDeleted: null,
    }).select("custId userId");

    if (!customer) return console.log("Customer Does not exist");

    const response = await MySubscriptionModel.findOne({
      purchasedBy: customer.userId,
    }).populate({ path: "subId", model: SubscriptionsModel });

    if (!response) return console.log("Subscription Does not exist");

    const upgradePlan = await SubscriptionsModel.findOne({
      name: "trial",
      isDeleted: null,
    }).select("name monthlyPrice annuallyPrice");

    if (!upgradePlan) return console.log(`Trial Not Found!!!`);

    let update = {
      subId: upgradePlan._id,
      holdSubId: upgradePlan._id,
      planDurationType: "annually",
      usesCount: 0,
      purchasedDate: payload.current_period_start,
      expiredOnDate: payload.current_period_end,
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
      { _id: response._id, isDeleted: null },
      { $set: update },
      { new: true }
    );

    if (!updateMySub) return console.log(`Something went wrong`);
    console.log(`Plan has been cancel successfully`);
    await usesClreadedForModerator(customer.userId);
    console.log(`Uses count has been updated...`);
  } catch (error) {
    console.log(error.message);
  }
};

exports.updatePlanPuaseStatus = async (
  customerId,
  interval,
  priceId,
  productId,
  payload
) => {
  console.log({ customerId, interval, priceId, productId });
  try {
    const customer = await CustomerModel.findOne({
      custId: customerId,
      isDeleted: null,
    }).select("custId userId");

    if (!customer) return console.log("Customer Does not exist");

    const response = await MySubscriptionModel.findOne({
      purchasedBy: customer.userId,
    }).populate({ path: "subId", model: SubscriptionsModel });

    if (!response) return console.log("Subscription Does not exist");

    const upgradePlan = await SubscriptionsModel.findOne({
      name: "trial",
      isDeleted: null,
    }).select("name monthlyPrice annuallyPrice");

    if (!upgradePlan) return console.log(`Trial Not Found!!!`);

    let update = {
      subId: upgradePlan._id,
      holdSubId: upgradePlan._id,
      planDurationType: "annually",
      pause_collection: true,
      purchasedDate: payload.current_period_start,
      expiredOnDate: payload.current_period_end,
    };

    // update.expiredOnDate = getExiredPlanDateAndTime(
    //   update.planDurationType,
    //   update.purchasedDate
    // ).expiredOnDate;

    const updateMySub = await MySubscriptionModel.findOneAndUpdate(
      { _id: response._id, isDeleted: null },
      { $set: update },
      { new: true }
    );

    if (!updateMySub) return console.log(`Something went wrong`);
    console.log(`Plan has been paused successfully`);
    await usesClreadedForModerator(customer.userId);
    console.log(`Uses count has been updated...`);
  } catch (error) {
    console.log(error.message);
  }
};

// exports.webhookCallback = async (req, res) => {
//   const sig = req.headers["stripe-signature"];
//   const payload = req.body;

//   switch (payload.type) {
//     case "checkout.session.completed":
//       const metadata = payload.data.object.metadata;
//       console.log(metadata);
//       await OrderModel.findOneAndUpdate(
//         { _id: metadata.orderId, paymentStatus: "pending", isDeleted: null },
//         {
//           paymentStatus: "paid",
//           transactionId: payload.data.object.payment_intent,
//           paymentResponse: JSON.stringify(payload.data.object),
//         }
//       );
//       console.log("Order Status has been updated");
//       await quizPollModel.findOneAndUpdate(
//         { _id: metadata.token, status: "order", isDeleted: null },
//         { status: "pending" }
//       );

//       console.log("Soccessfully Updated");

//       await quizPollModel.findOneAndUpdate(
//         { _id: metadata.copyFrom, isDeleted: null },
//         { $inc: { purchaseCount: 1 } }
//       );

//       console.log("Soccessfully Increamented");

//       break;
//   }

//   res.sendStatus(200);
// };
