const { responseHelper } = require("../../helpers");
const paymentService = require("./payments.service");

exports.createCustomer = async (req, res, next) => {
  try {
    const { body, user } = req;
    const response = await paymentService.createCustomer(user.id, body);
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }

    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.getMyCustomer = async (req, res, next) => {
  try {
    const { user } = req;
    const response = await paymentService.getMyCustomer(user.id);

    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }

    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.deleteMyCustomer = async (req, res, next) => {
  try {
    const { user } = req;
    const response = await paymentService.deleteMyCustomer(user.id);

    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }

    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.paymentMethod = async (req, res, next) => {
  try {
    const { body, user } = req;
    const response = await paymentService.paymentMethod(user.id, body);
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }

    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.createCustomerPortal = async (req, res, next) => {
  try {
    const { user, query } = req;
    const response = await paymentService.createCustomerPortal(user.id, query);
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }

    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.getPaymentMethods = async (req, res, next) => {
  try {
    const { user } = req;
    const response = await paymentService.getPaymentMethods(user.id);
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }

    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.deletePaymentMethods = async (req, res, next) => {
  try {
    const { paymentMethodId } = req.params;
    const response = await paymentService.deletePaymentMethods(paymentMethodId);
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }

    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.setAsDefaultPaymentMethod = async (req, res, next) => {
  try {
    const { user, body } = req;
    const response = await paymentService.setAsDefaultPaymentMethod(
      user.id,
      body
    );
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }

    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.getInvoices = async (req, res, next) => {
  try {
    const { user } = req;
    const response = await paymentService.getInvoices(user.id);
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }

    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.downloadInvoiceFromStripe = async (req, res, next) => {
  try {
    const { body } = req;
    const response = await paymentService.downloadInvoiceFromStripe(body);
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }

    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.subscriptionPayout = async (req, res, next) => {
  try {
    const { user, body } = req;
    const response = await paymentService.subscriptionPayout(user.id, body);
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }

    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.confirmPaymentIntent = async (req, res, next) => {
  try {
    const { body } = req;
    const response = await paymentService.confirmPaymentIntent(body);
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }

    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.createCard = async (req, res, next) => {
  try {
    const { body, user } = req;
    const response = await paymentService.createCard(user.id, body);
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }

    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.createPayment = async (req, res, next) => {
  try {
    const { user, body } = req;
    body.userId = user.id;
    const response = await paymentService.createPayment(body);
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }

    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.createPaymentIntent = async (req, res, next) => {
  try {
    const response = await paymentService.createPaymentIntent();
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }

    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.createSubscriptions = async (req, res, next) => {
  try {
    const { user, params, query } = req;
    const response = await paymentService.createSubscriptions(
      user.id,
      params.id,
      query
    );
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }

    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.createSubscriptionsCheckout = async (req, res, next) => {
  try {
    const { user, params, query } = req;
    const response = await paymentService.createSubscriptionsCheckout(
      user,
      params.id,
      query
    );
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }

    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.updatePlanStatus = async (req, res, next) => {
  try {
    const { user } = req;
    const response = await paymentService.updatePlanStatus(user);
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }

    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.getSubscriptions = async (req, res, next) => {
  try {
    const { user } = req;
    const response = await paymentService.getSubscriptions(user.id);
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }

    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.pausedSubscriptions = async (req, res, next) => {
  try {
    const { params } = req;
    const response = await paymentService.pausedSubscriptions(params.id);
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }

    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.resumedSubscriptions = async (req, res, next) => {
  try {
    const { params } = req;
    const response = await paymentService.resumedSubscriptions(params.id);
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }

    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};

exports.cancelSubscriptions = async (req, res, next) => {
  try {
    const { params } = req;
    const response = await paymentService.cancelSubscriptions(params.id);
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }

    return responseHelper.successResponse(
      res,
      response.code,
      response.message,
      response.data
    );
  } catch (error) {
    next(error);
  }
};
