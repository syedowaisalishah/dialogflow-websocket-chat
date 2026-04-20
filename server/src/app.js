const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const webhookRoutes = require('./routes/webhook.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/webhook', webhookRoutes);

// Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Error handling middleware could be added here

module.exports = app;
