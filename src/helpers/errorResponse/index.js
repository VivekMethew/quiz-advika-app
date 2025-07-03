const BadRequestException = require('./badRequest');
const NotFoundException = require('./notFound');
const PreconditionException = require('./precondition');
const UnauthorizedException = require('./unauthorized');
const UnHandledException = require('./unhandled');
const ErrorResponse = require('./errorResponse');

module.exports = {
    BadRequestException,
    NotFoundException,
    PreconditionException,
    UnauthorizedException,
    UnHandledException,
    ErrorResponse,
};
