const Joi = require("joi");

const quizAndPollSchema = {
  createQuilPoll: {
    body: Joi.object().keys({
      title: Joi.string().trim().required(),
      type: Joi.string().trim().required(),
      isAccess: Joi.string().trim().required(),
      catId: Joi.string().trim().required(),
      questions: Joi.array(),
      description: Joi.string().trim(),
      coverImage: Joi.string().trim(),
      isForEver: Joi.bool().optional(),
      isShuffle: Joi.bool().optional(),
      tags: Joi.array(),
      startDateTime: Joi.string().trim(), // "04/29/2023 4:00 PM",
      duration: Joi.number(), //Time in hours
      isAutostart: Joi.boolean(),
    }),
  },

  updateQuilPoll: {
    body: Joi.object().keys({
      title: Joi.string().trim().optional(),
      isAccess: Joi.string().trim().optional(),
      questions: Joi.array().required(),
      description: Joi.string().trim(),
      coverImage: Joi.string().trim(),
      isForEver: Joi.bool().optional(),
      isShuffle: Joi.bool().optional(),
      tags: Joi.array(),
      startDateTime: Joi.string().trim(), // "04/29/2023 4:00 PM",
      duration: Joi.number(), //Time in hours
      isAutostart: Joi.boolean(),
    }),
  },
  updateQuilPollQustion: {
    body: Joi.object().keys({
      new: Joi.bool().required(),
      questionId: Joi.string().trim(),
      question: Joi.string().trim().required(),
      type: Joi.string().trim().required(),
      duration: Joi.number().required(),
      point: Joi.number(),
      image: Joi.string().trim(),
      options: Joi.array(),
      answers: Joi.array(),
    }),
  },

  ordering: {
    body: Joi.object().keys({
      questions: Joi.array().required(),
    }),
  },
  bulkUpload: {
    body: Joi.object().keys({
      questions: Joi.array().required(),
    }),
  },

  ratings: {
    body: Joi.object().keys({
      rating: Joi.number().min(1).max(5).required(),
    }),
  },

  bulkDelete: {
    body: Joi.object().keys({
      ids: Joi.array().required(),
    }),
  },
};

module.exports = { quizAndPollSchema };
