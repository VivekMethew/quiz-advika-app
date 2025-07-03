const Joi = require("joi");

const topicSchema = {
  search: {
    body: Joi.object().keys({
      prompt: Joi.string().trim().required(),
      noOfQues: Joi.number().integer().required(),
    }),
  },
};

module.exports = { topicSchema };
