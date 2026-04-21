const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const loggerMiddleware = require('./middleware/logger.middleware');
const errorMiddleware = require('./middleware/error.middleware');

dotenv.config();

const webhookRoutes = require('./routes/webhook.routes');

const app = express();

// Global Middlewares
app.use(loggerMiddleware);
app.use(cors());
app.use(express.json());

// Routes
app.use('/webhook', webhookRoutes);

// Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

module.exports = app;
