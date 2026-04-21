const errorMiddleware = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    console.error(`[Error] ${req.method} ${req.url} - Status: ${status} - ${message}`);
    if (err.stack) {
        console.error(err.stack);
    }

    res.status(status).json({
        error: {
            message,
            status,
            timestamp: new Date().toISOString()
        }
    });
};

module.exports = errorMiddleware;
