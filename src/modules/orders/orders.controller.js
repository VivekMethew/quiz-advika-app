const { query } = require("express");
const { responseHelper } = require("../../helpers");
const analyticsService = require("./orders.service");

exports.addOnCheckout = async (req, res, next) => {
  try {
    const { body, user ,query} = req;
    body.userId = user.id;
    const response = await analyticsService.addOnCheckout(query,body);
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


exports.checkout = async (req, res, next) => {
  try {
    const { body, user } = req;
    body.userId = user.id;
    const response = await analyticsService.checkout(body);
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

exports.getMyOrders = async (req, res, next) => {
  try {
    const { query, user } = req;
    const response = await analyticsService.getMyOrders(user.id, query);
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

exports.deleteMyOrders = async (req, res, next) => {
  try {
    const { params } = req;
    const response = await analyticsService.deleteMyOrders(params.id);
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

exports.copyProduct = async (req, res, next) => {
  try {
    const { body, user } = req;
    body.userId = user.id;
    const response = await analyticsService.copyProduct(body);
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

exports.getAllOrders = async (req, res, next) => {
  try {
    const { user, query } = req;

    const response = await analyticsService.getAllOrders(user.id, query);
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
