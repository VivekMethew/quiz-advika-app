const Joi = require("joi");

const SCHEMA = {
  ADD: {
    body: Joi.object().keys({
      discount: Joi.number().max(100).required(),
    }),
  },

  UPDATE: {
    body: Joi.object().keys({
      discount: Joi.number().max(100).required(),
    }),
  },
};

module.exports = { SCHEMA };
