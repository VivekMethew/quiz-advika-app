const Joi = require("joi");

const categorySchema = {
  category: {
    body: Joi.object().keys({
      name: Joi.string().trim().required(),
      description: Joi.string().trim(),
    }),
  },
  update: {
    body: Joi.object().keys({
      name: Joi.string().trim().optional(),
      description: Joi.string().trim(),
    }),
  },
  updateTrending: {
    body: Joi.object().keys({
      isTrending: Joi.bool().required(),
    }),
  },
};

module.exports = { categorySchema };
