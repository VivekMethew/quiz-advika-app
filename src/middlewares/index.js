const authorisation = require("./authorisation");
const validation = require("./validation");

module.exports = {
  authMiddleware: authorisation,
  validationMiddleware: validation,
};
