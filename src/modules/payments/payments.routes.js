const express = require("express");
const paymentController = require("./payments.controller");
const { validationMiddleware } = require("../../middlewares");
const { paymentSchema } = require("./payments.validation");
const router = express.Router();

router.post(
  "/createCustomer",
  validationMiddleware(paymentSchema.customer),
  paymentController.createCustomer
);

router.get("/customer", paymentController.getMyCustomer);
router.delete("/customer", paymentController.deleteMyCustomer);

router.post(
  "/createPaymentMethod",
  validationMiddleware(paymentSchema.paymentMethod),
  paymentController.paymentMethod
);

router.post("/createCustomerPortal", paymentController.createCustomerPortal);

router.get("/getPaymentMethods", paymentController.getPaymentMethods);

router.delete(
  "/deletePaymentMethods/:paymentMethodId",
  paymentController.deletePaymentMethods
);

router.patch(
  "/setAsDefaultPaymentMethod",
  validationMiddleware(paymentSchema.defaultPaymentMethod),
  paymentController.setAsDefaultPaymentMethod
);

router.get("/getInvoices", paymentController.getInvoices);

router.post(
  "/downloadInvoiceFromStripe",
  paymentController.downloadInvoiceFromStripe
);

router.post("/createPaymentIntent", paymentController.subscriptionPayout);
router.post("/confirmPaymentIntent", paymentController.confirmPaymentIntent);

router.post("/createCard", paymentController.createCard);
router.post("/createPayment", paymentController.createPayment);
router.post("/create-payment-intent", paymentController.createPaymentIntent);

// subscriptions APIS
router.get("/subscription", paymentController.getSubscriptions);

router.patch("/subscription/:id/paused", paymentController.pausedSubscriptions);

router.patch(
  "/subscription/:id/resumed",
  paymentController.resumedSubscriptions
);

router.patch("/subscription/:id/cancel", paymentController.cancelSubscriptions);

router.patch(
  "/subscription/:id/allowToPurchaseSubs",
  paymentController.cancelSubscriptions
);

router.post("/create-subscription/:id", paymentController.createSubscriptions);

router.post(
  "/create-subscription-checkout/:id",
  paymentController.createSubscriptionsCheckout
);

router.post("/updatePlanStatus", paymentController.updatePlanStatus);

// End
router.get("/config", (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

module.exports = router;
