const {
  UnHandledException,
  PreconditionException,
} = require("../helpers/errorResponse");
const { logger } = require("../utils");

const options = {
  basic: {
    abortEarly: false,
    convert: true,
  },
  array: {
    abortEarly: false,
    convert: true,
  },
};

module.exports = (schema) => (req, res, next) => {
  Object.keys(schema).forEach((key) => {
    const { error } = schema[key].validate(req[key], options);
    logger.error(error);
    if (error) {
      logger.error(error);
      const message = error.details[0].message || "Invalid Inputs";
      throw new PreconditionException(message);
    }
  });
  next();
};
