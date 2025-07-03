const { responseHelper } = require("../../helpers");
const { generateStartTimeEnd } = require("../../utils/dateUtils");
const { generateQuizPollUniqCode } = require("../../utils/generate.utils");
const quizPollService = require("./quiz.service");

async function getPayload(body) {
  body.code = await generateQuizPollUniqCode();
  const { startISO, endISO, timezon } = generateStartTimeEnd(
    body.startDateTime,
    body.duration
  );
  delete body.startDateTime;
  body.startDateTime = startISO;
  body.endDateTime = endISO;
  body.timezon = timezon;
  return body;
}

function updatePayload(body) {
  const { startISO, endISO, timezon } = generateStartTimeEnd(
    body.startDateTime,
    body.duration
  );

  delete body.startDateTime;
  body.startDateTime = startISO;
  body.endDateTime = endISO;
  body.timezon = timezon;
  return body;
}

exports.addQuizPoll = async (req, res, next) => {
  try {
    const { user, body } = req;
    let payload = await getPayload(body);
    payload.userId = user.id;
    const response = await quizPollService.addQuizPoll(payload);
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

exports.getList = async (req, res, next) => {
  try {
    const { user, query } = req;
    const response = await quizPollService.getList(user.id, query);
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

exports.getSingleRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user, query } = req;
    const response = await quizPollService.getSingleRecord(id, user.id, query);
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

exports.updateSingleRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body } = req;
    let payload = updatePayload(body);
    const response = await quizPollService.updateSingleRecord(id, payload);
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

exports.updatePermission = async (req, res, next) => {
  try {
    const { body, params } = req;
    const response = await quizPollService.updatePermission(params.id, body);
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

exports.updateOrdering = async (req, res, next) => {
  try {
    const { body } = req;
    const response = await quizPollService.updateOrdering(body);
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

exports.bulkQuizPollActivated = async (req, res, next) => {
  try {
    const { body, user } = req;
    const response = await quizPollService.bulkQuizPollActivated(user.id, body);
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

exports.bulkQuizPollDeActivated = async (req, res, next) => {
  try {
    const { body } = req;
    const response = await quizPollService.bulkQuizPollDeActivated(body);
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

exports.bulkQuizPollDelete = async (req, res, next) => {
  try {
    const { body } = req;
    console.log(body, "body");
    const response = await quizPollService.bulkQuizPollDelete(body);
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

exports.quizAndPollActived = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await quizPollService.quizAndPollActived(id);
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

exports.deleteSingleRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await quizPollService.deleteSingleRecord(id);
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

exports.createRatings = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body, user } = req;
    body.userId = user.id;
    const response = await quizPollService.createRatings(id, body);
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

exports.updateRatings = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body, user } = req;
    body.userId = user.id;
    const response = await quizPollService.updateRatings(id, body);
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

exports.deleteRatings = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const response = await quizPollService.deleteRatings(id, user);
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
