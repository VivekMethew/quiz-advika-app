const Joi = require("joi");

const dashboardSchema = {
  activated: {
    body: Joi.object().keys({
      startDateTime: Joi.string().trim().required(),
      duration: Joi.number().integer().required(),
    }),
  },
};

module.exports = { dashboardSchema };
