const Joi = require("joi");

const userSchema = {
  register: {
    body: Joi.object()
      .keys({
        fullname: Joi.string().trim(),
        email: Joi.string().trim().email().required(),
        password: Joi.string().trim().min(8).max(20).trim(),
      })
      .messages({
        "string.email": "Please enter valid email address",
      }),
  },

  validateOtp: {
    body: Joi.object().keys({
      code: Joi.string().trim().required(),
      otp: Joi.string().trim().min(4).max(4).trim().required(),
    }),
  },

  resetPassword: {
    body: Joi.object()
      .keys({
        email: Joi.string().trim().email().required(),
        password: Joi.string().trim().required(),
        code: Joi.string().trim().required(),
      })
      .messages({
        "string.email": "Please enter valid email address",
      }),
  },

  forgetPassword: {
    body: Joi.object()
      .keys({
        email: Joi.string().trim().email().required(),
      })
      .messages({
        "string.email": "Please enter valid email address",
      }),
  },

  login: {
    body: Joi.object()
      .keys({
        email: Joi.string().trim().email().required(),
        password: Joi.string().trim().min(8).max(20).trim().required(),
      })
      .messages({
        "string.email": "Please enter valid email address",
      }),
  },

  update: {
    body: Joi.object().keys({
      fullname: Joi.string().trim(),
      email: Joi.string().trim().email(),
      phone: Joi.string().trim(),
      description: Joi.string().trim(),
      avatar: Joi.string().trim(),
    }),
  },

  changePassword: {
    body: Joi.object().keys({
      oldPassword: Joi.string().trim().min(8).max(20).trim().required(),
      password: Joi.string().trim().min(8).max(20).trim().required(),
      confirmPassword: Joi.string().equal(Joi.ref("password")).required(),
    }),
  },
};

module.exports = { userSchema };
