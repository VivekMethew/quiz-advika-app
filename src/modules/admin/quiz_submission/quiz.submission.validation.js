const Joi = require("joi");

const quizSubmissionSchema = {
  reply: {
    body: Joi.object().keys({
      price: Joi.number().required(),
      isApproved: Joi.string().trim().required(),
      isRejectReason: Joi.string().trim(),
      suggestion: Joi.string().trim(),
      isSuggested: Joi.bool().optional(),
      category: Joi.array().items(Joi.string().trim()).optional(),
    }),
  },

  replyUpdate: {
    body: Joi.object().keys({
      price: Joi.number().optional(),
      isSuggested: Joi.bool().optional(),
      category: Joi.array().items(Joi.string().trim()).optional(),
    }),
  },
};

module.exports = { quizSubmissionSchema };
