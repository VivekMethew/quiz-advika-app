const Joi = require("joi");

const palyersSchema = {
  invites: {
    body: Joi.object().keys({
      emails: Joi.array()
        .items(Joi.string().trim().email().required())
        .required(),
    }),
  },
};

module.exports = { palyersSchema };
