const { responseHelper } = require("../../../helpers");
const dashboardService = require("./dashboard.service");

exports.getList = async (req, res, next) => {
  try {
    const { user, query } = req;

    const response = await dashboardService.getList(user, query);
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

exports.yourPastWeek = async (req, res, next) => {
  try {
    const { user, query } = req;
    const response = await dashboardService.yourPastWeek(user, query);
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

exports.getNotifications = async (req, res, next) => {
  try {
    const { query, user } = req;

    const response = await dashboardService.getNotifications(query, user);
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

exports.updateNotification = async (req, res, next) => {
  try {
    const { params } = req;
    const response = await dashboardService.updateNotification(params.id);
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

exports.deleteNotification = async (req, res, next) => {
  try {
    const { params } = req;
    const response = await dashboardService.deleteNotification(params.id);
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

exports.addToFav = async (req, res, next) => {
  try {
    const { user, params } = req;
    const response = await dashboardService.addToFav(params.id, user.id);
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

exports.addToDeActivated = async (req, res, next) => {
  try {
    const { user, params } = req;
    const response = await dashboardService.addToDeActivated(
      params.id,
      user.id
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

exports.addQuizSubmition = async (req, res, next) => {
  try {
    const { user, params } = req;
    const response = await dashboardService.addQuizSubmition(
      params.id,
      user.id
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

exports.deActivated = async (req, res, next) => {
  try {
    const { user, params } = req;
    const response = await dashboardService.deActivated(params.id, user.id);
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

exports.endQuizAndPoll = async (req, res, next) => {
  try {
    const { user, params } = req;
    const response = await dashboardService.endQuizAndPoll(params.id, user.id);
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

exports.startActiveQuizAndPoll = async (req, res, next) => {
  try {
    const { body, params, user } = req;
    const response = await dashboardService.startActiveQuizAndPoll(
      params.id,
      body,
      user.id
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

exports.pendingToActiveQuizAndPoll = async (req, res, next) => {
  try {
    const { body, params, user } = req;
    const response = await dashboardService.pendingToActiveQuizAndPoll(
      params.id,
      body,
      user.id
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

exports.startClosedDeActivateToActivateQuizAndPoll = async (req, res, next) => {
  try {
    const { body, params, user } = req;
    const response =
      await dashboardService.startClosedDeActivateToActivateQuizAndPoll(
        params.id,
        body,
        user.id
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

exports.activated = async (req, res, next) => {
  try {
    const { user, params, body } = req;
    body.userId = user.id;
    const response = await dashboardService.activated(params.id, body);
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

exports.playerEliminates = async (req, res, next) => {
  try {
    const { params } = req;
    const response = await dashboardService.playerEliminates(params.id);
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

exports.myActivities = async (req, res, next) => {
  try {
    const { query, user } = req;
    const response = await dashboardService.myActivities(user.id, query);
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

exports.unPublish = async (req, res, next) => {
  try {
    const { params } = req;

    const response = await dashboardService.unPublish(params.id);
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

exports.updateQuizpollBuy = async (req, res, next) => {
  try {
    const response = await dashboardService.updateQuizpollBuy();
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
