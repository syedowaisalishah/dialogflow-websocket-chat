const loggerMiddleware = (req, res, next) => {
    const start = Date.now();
    const { method, url } = req;
    
    // Once the response is finished, log the details
    res.on('finish', () => {
        const duration = Date.now() - start;
        const status = res.statusCode;
        console.log(`[HTTP] ${method} ${url} - Status: ${status} - ${duration}ms`);
    });

    next();
};

module.exports = loggerMiddleware;
