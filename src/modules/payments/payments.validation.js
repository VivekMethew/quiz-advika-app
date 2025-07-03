const Joi = require("joi");

const paymentSchema = {
  customer: {
    body: Joi.object().keys({
      email: Joi.string().trim().required(),
      name: Joi.string().trim().required(),
      description: Joi.string().trim().required(),
    }),
  },
  paymentMethod: {
    body: Joi.object().keys({
      token: Joi.string().trim().required(),
      address: Joi.object().keys({
        line1: Joi.string().trim(),
        line2: Joi.string().trim(),
        country: Joi.string().trim().required(),
        state: Joi.string().trim().required(),
        city: Joi.string().trim().required(),
        postal_code: Joi.string().trim().required(),
      }),
      email: Joi.string().email().trim().required(),
      name: Joi.string().trim().required(),
    }),
  },
};

module.exports = { paymentSchema };
