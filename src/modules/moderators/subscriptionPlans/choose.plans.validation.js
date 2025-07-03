const Joi = require("joi");

const SCHEMA = {
  choosePlans: {
    body: Joi.object().keys({
      planDurationType: Joi.string().trim().required(),
      paymentDetails: Joi.object()
        .keys({
          method: Joi.string().trim().required(),
          transactionId: Joi.string().trim(),
          metadata: Joi.string().trim(),
        })
        .optional(),
    }),
  },
  upgradePlan: {
    body: Joi.object().keys({
      name: Joi.string().trim().required(),
    }),
  },
};

module.exports = { SCHEMA };
