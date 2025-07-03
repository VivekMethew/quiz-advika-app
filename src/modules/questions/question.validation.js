const Joi = require("joi");

const questionSchema = {
  question: {
    body: Joi.object().keys({
      title: Joi.string().trim(),
      type: Joi.string().trim().required(),
      optionType: Joi.string().trim().required(),
      duration: Joi.number().required(),
      point: Joi.number().optional(),
      image: Joi.string().trim().allow("", null),
      thumbnail: Joi.string().trim().allow("", null),
      isTextFree: Joi.bool(),
      isWallOfFame: Joi.bool(),
      answerText: Joi.string().trim(),
      options: Joi.array(),
      answers: Joi.array(),
      customMessage: Joi.object().keys({
        file: Joi.string().trim().allow("", null),
        text: Joi.string().trim().allow("", null),
      }),
    }),
  },

  update: {
    body: Joi.object().keys({
      title: Joi.string().trim(),
      type: Joi.string().trim(),
      optionType: Joi.string().trim(),
      duration: Joi.number(),
      point: Joi.number(),
      image: Joi.string().trim().allow("", null),
      thumbnail: Joi.string().trim().allow("", null),
      isTextFree: Joi.bool(),
      answerText: Joi.string().trim(),
      options: Joi.array(),
      answers: Joi.array(),
      isWallOfFame: Joi.bool(),
      customMessage: Joi.object().keys({
        file: Joi.string().trim().allow("", null),
        text: Joi.string().trim().allow("", null),
      }),
    }),
  },

  bulkUpdate: {
    body: Joi.object().keys({
      ids: Joi.array().required(),
      duration: Joi.number(),
      point: Joi.number(),
    }),
  },

  chatGPT: {
    body: Joi.object().keys({
      ids: Joi.array().required(),
    }),
  },
};

module.exports = { questionSchema };
