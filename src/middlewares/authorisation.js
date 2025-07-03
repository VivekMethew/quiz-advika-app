const {
  UnauthorizedException,
  NotFoundException,
} = require("../helpers/errorResponse");
const { jwt, logger } = require("../utils");
const { User } = require("../models/users.model");
const { PlayerModel } = require("../models/player.model");
const { CONSTANTS } = require("../config");

module.exports = {
  validateAccessToken:
    (allowedRoles = []) =>
    async (req, res, next) => {
      try {
        if (!req.headers.authorization)
          throw new UnauthorizedException("Token header not found");

        const token = req.headers.authorization.split(" ")[1]; // Extracting Bearer token from header.

        if (!token) throw new UnauthorizedException("Token not found");

        const decoded = await jwt.verifyToken(token);

        if (decoded.role === CONSTANTS.USER.ROLES.PLAYER) {
          const response = await PlayerModel.findById(decoded.id).select(
            "id email isBlock"
          );

          if (!response) {
            throw new NotFoundException("Oops! Invalid Token");
          }
        } else {
          logger.info(decoded.id);
          const response = await User.findOne({
            _id: decoded.id,
            isDeleted: null,
          }).select("id role email isBlock");

          if (!response) {
            throw new UnauthorizedException("Oops! Invalid User");
          }

          if (response.isBlock) {
            throw new UnauthorizedException(
              "Oops! Your account has been deactivated. Please contact to Admin"
            );
          }
        }

        if (allowedRoles.includes(decoded.role)) {
          req.user = decoded;
          next();
        } else {
          throw new UnauthorizedException("Oops! Unauthorised access");
        }
      } catch (error) {
        next(error);
      }
    },
  validateRefreshToken:
    (allowedRoles = []) =>
    async (req, res, next) => {
      try {
        if (!req.headers.authorization)
          throw new UnauthorizedException("Token header not found");

        const token = req.headers.authorization.split(" ")[1]; // Extracting Bearer token from header.

        if (!token) throw new UnauthorizedException("Token not found");

        const decoded = await jwt.verifyRefreshToken(token);

        if (allowedRoles.includes(decoded.role)) {
          req.user = decoded;
          next();
        } else {
          throw new UnauthorizedException("Oops! Unauthorised access");
        }
      } catch (error) {
        next(error);
      }
    },

  isAuthenticated: (req, res, next) => {
    if (req.user) {
      next();
    } else {
      throw new UnauthorizedException("Oops! Unauthorised access");
    }
  },
};
