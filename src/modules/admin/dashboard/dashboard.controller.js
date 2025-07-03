const { responseHelper } = require("../../../helpers");
const { logger } = require("../../../utils");
const {
  pausedSubscriptions,
  resumedSubscriptions,
  getSubscriptions,
  cancelSubscriptions,
  cancelModeratorAllowToPurchaseSubs,
  getInvoices,
} = require("../../payments/payments.service");
const dashboardService = require("./dashboard.service");
const fs = require("fs");

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

exports.getModerators = async (req, res, next) => {
  try {
    const { query } = req;
    const response = await dashboardService.getModerators(query);
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

exports.getModeratorsDeactivationLog = async (req, res, next) => {
  try {
    const { query } = req;
    const response = await dashboardService.getModeratorsDeactivationLog(query);
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

exports.deleteModerators = async (req, res, next) => {
  try {
    const { params } = req;
    const response = await dashboardService.deleteModerators(params.id);
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }

    // res.download(response.data.outputPath, (err) => {
    //   if (err) {
    //     res.status(404).send("File not found");
    //   }
    //   fs.unlink(response.data.outputPath, (err) => {
    //     if (err) logger.error(err);
    //     logger.info("file has been deleted");
    //   });
    // });

    // response.data.outputPath

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

exports.deactivateModeratorAccount = async (req, res, next) => {
  try {
    const { params, user } = req;
    const response = await dashboardService.deactivateModeratorAccount(
      params.id,
      user.email
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

exports.downloarReportModerators = async (req, res, next) => {
  try {
    const { params, query } = req;
    const response = await dashboardService.downloarReportModerators(params.id);
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }

    // res.download(response.data.outputPath, (err) => {
    //   if (err) {
    //     res.status(404).send("File not found");
    //   }
    //   fs.unlink(response.data.outputPath, (err) => {
    //     if (err) logger.error(err);
    //     logger.info("file has been deleted");
    //   });
    // });

    // response.data.outputPath

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

exports.downloarReportAdmin = async (req, res, next) => {
  try {
    const { params, query } = req;
    const response = await dashboardService.downloarReportAdmin(params.id);
    if (!response.success) {
      return responseHelper.errorResponse(
        res,
        response.code,
        response.message,
        response.data
      );
    }

    // res.download(response.data.outputPath, (err) => {
    //   if (err) {
    //     res.status(404).send("File not found");
    //   }
    //   fs.unlink(response.data.outputPath, (err) => {
    //     if (err) logger.error(err);
    //     logger.info("file has been deleted");
    //   });
    // });

    // response.data.outputPath

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

exports.copyProduct = async (req, res, next) => {
  try {
    const { body, user } = req;
    body.userId = user.id;
    const response = await dashboardService.copyProduct(body);
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

exports.getModeratorView = async (req, res, next) => {
  try {
    const { params, query } = req;
    const response = await dashboardService.getModeratorView(params.id, query);
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

exports.assignedPlayerToModerator = async (req, res, next) => {
  try {
    const { params, body } = req;
    const response = await dashboardService.assignedPlayerToModerator(
      params.id,
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

exports.unablePlatinumTrial = async (req, res, next) => {
  try {
    const { params } = req;
    const response = await dashboardService.unablePlatinumTrial(params.id);
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

exports.enableUnlimitedUser = async (req, res, next) => {
  try {
    const { params } = req;
    const response = await dashboardService.enableUnlimitedUser(params.id);
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

exports.disablePlatinumTrial = async (req, res, next) => {
  try {
    const { params } = req;
    const response = await dashboardService.disablePlatinumTrial(params.id);
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

exports.pauseModeratorSubsciption = async (req, res, next) => {
  try {
    const { params } = req;
    const response = await pausedSubscriptions(params.id);
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

exports.resumedModeratorSubsciption = async (req, res, next) => {
  try {
    const { params } = req;
    const response = await resumedSubscriptions(params.id);
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

exports.getModeratorSubsciption = async (req, res, next) => {
  try {
    const { params } = req;
    const response = await getSubscriptions(params.id);
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

exports.cancelModeratorSubsciption = async (req, res, next) => {
  try {
    const { params } = req;
    const response = await cancelSubscriptions(params.id);
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

exports.cancelModeratorAllowToPurchaseSubs = async (req, res, next) => {
  try {
    const { params } = req;
    const response = await cancelModeratorAllowToPurchaseSubs(params.id);
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

exports.invoicesModeratorAllPurchaseSubs = async (req, res, next) => {
  try {
    const { params } = req;
    const response = await getInvoices(params.id);
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

exports.purchaseHistory = async (req, res, next) => {
  try {
    const { params, query } = req;

    const response = await dashboardService.purchaseHistory(params.id, query);
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

exports.updateProfilePriority = async (req, res, next) => {
  try {
    let { params } = req;
    const response = await dashboardService.updateProfilePriority(
      params.userId
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

exports.quizAndPollModeratorList = async (req, res, next) => {
  try {
    const { query, params } = req;

    const response = await dashboardService.quizAndPollModeratorList(
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
    const { body, params } = req;
    const response = await dashboardService.startActiveQuizAndPoll(
      params.id,
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

exports.pendingToActiveQuizAndPoll = async (req, res, next) => {
  try {
    const { body, params } = req;
    const response = await dashboardService.pendingToActiveQuizAndPoll(
      params.id,
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

exports.startClosedDeActivateToActivateQuizAndPoll = async (req, res, next) => {
  try {
    const { body, params } = req;
    const response =
      await dashboardService.startClosedDeActivateToActivateQuizAndPoll(
        params.id,
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

exports.unPublishManual = async (req, res, next) => {
  try {
    const { params } = req;

    const response = await dashboardService.unPublishManual(params.id);
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
exports.update = async (req, res, next) => {
  try {
    const response = await dashboardService.update();
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

exports.updatePrices = async (req, res, next) => {
  try {
    const { params, query } = req;

    const response = await dashboardService.updatePrices(params.id, query);
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

exports.passwordReset = async (req, res, next) => {
  try {
    const { body } = req;

    const response = await dashboardService.passwordReset(body);
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

exports.getPassword = async (req, res, next) => {
  try {
    const response = await dashboardService.getPassword();
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
