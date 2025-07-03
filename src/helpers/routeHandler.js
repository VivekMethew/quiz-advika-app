const { HTTP_CODES } = require('../config');

const routeHandler = async (req, res) => {
    res.status(HTTP_CODES.NOT_FOUND || 500).json({
        success: false,
        code: HTTP_CODES.NOT_FOUND || 500,
        message: 'Route Not Found',
        data: {},
    });
};

module.exports = routeHandler;
