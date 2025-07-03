const Joi = require("joi");

const subscriptionSchema = {
  add: {
    body: Joi.object().keys({
      name: Joi.string().trim().required(),
      description: Joi.string().trim(),
      cover: Joi.string().trim(),
    }),
  },

  update: {
    body: Joi.object().keys({
      name: Joi.string().trim(),
      price: Joi.number(),
      description: Joi.string().trim(),
      members: Joi.number(),
      planDurationType: Joi.string().trim(),
      cover: Joi.string().trim(),
      monthlyProductId: Joi.string().trim().allow(null),
      annuallyProductId: Joi.string().trim().allow(null),
      monthlyPriceId: Joi.string().trim().allow(null),
      annuallyPriceId: Joi.string().trim().allow(null),
    }),
  },
};

module.exports = { subscriptionSchema };
