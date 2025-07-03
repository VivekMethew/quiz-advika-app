const { HTTP_CODES } = require('../config');

const formatResponse = (res, success, statusCode, message = 'Success', data) =>
    res.status(statusCode).json({
        success,
        code: statusCode || 500,
        message,
        data,
    });

exports.success = (res, message, data) => formatResponse(res, true, HTTP_CODES.OK, message, data);
exports.created = (res, message, data) => formatResponse(res, true, HTTP_CODES.CREATED, message, data);
exports.noContent = (res) => res.status(HTTP_CODES.NO_CONTENT).send();

exports.serviceResponse = (success, code, message, data = {}) => {
    return { success, code, message, data };
};

// Success Response
exports.successResponse = (res, code, message, data) => formatResponse(res, true, code, message, data);

// Error Response
exports.errorResponse = (res, code, message, data) => formatResponse(res, false, code, message, data);
