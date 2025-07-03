const Joi = require("joi");

const quizAndPollSchema = {
  createQuilPoll: {
    body: Joi.object().keys({
      title: Joi.string().trim().required(),
    }),
  },
};

module.exports = { quizAndPollSchema };
