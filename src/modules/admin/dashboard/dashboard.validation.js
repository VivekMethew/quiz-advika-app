const Joi = require("joi");

const quizAndPollSchema = {
  createQuilPoll: {
    body: Joi.object().keys({
      title: Joi.string().trim().required(),
    }),
  },
  activated: {
    body: Joi.object().keys({
      startDateTime: Joi.string().trim().required(),
      duration: Joi.number().integer().required(),
    }),
  },
  updateVRPASS: {
    body: Joi.object().keys({
      passcode: Joi.string().trim().min(6).max(6).required(),
    }),
  },
  allowUsers: {
    body: Joi.object().keys({
      isAssignedUser: Joi.bool().required(),
      plusNoOfUsers: Joi.number().integer().required(),
    }),
  },
};

module.exports = { quizAndPollSchema };
