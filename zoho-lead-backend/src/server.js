/**
 * Main Server File
 * Express application entry point
 */

const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const logger = require('./utils/logger');
const requestLogger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const leadsRoutes = require('./routes/leads');
const exotelRoutes = require('./routes/exotel');
const twilioRoutes = require('./routes/twilio');

// Create Express app
const app = express();

// Middleware
app.use(cors());  // Enable CORS for all origins
app.use(express.json());  // Parse JSON bodies
app.use(requestLogger);  // Log all requests

// Health check endpoint
app.get('/health', (req, res) => {
    const tokenManager = require('./services/tokenManager');
    const tokenInfo = tokenManager.getTokenInfo();

    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        nodejs: process.version,
        token: {
            isValid: tokenInfo.isValid,
            expiresAt: tokenInfo.expiresAt
        }
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: 'Zoho Lead Ingestion Backend',
        version: '1.0.0',
        endpoints: {
            'POST /leads': 'Create or update lead',
            'GET /leads/sources': 'Get valid source values',
            'GET /health': 'Health check'
        }
    });
});

// API Routes
app.use('/leads', leadsRoutes);
app.use('/exotel', exotelRoutes);
app.use('/twilio', twilioRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl
    });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
    logger.info(`🚀 Server started on port ${PORT}`);
    logger.info(`Environment: ${config.nodeEnv}`);
    logger.info(`Zoho API Domain: ${config.zoho.apiDomain}`);
    logger.info('');
    logger.info('Available endpoints:');
    logger.info(`  POST   http://localhost:${PORT}/leads`);
    logger.info(`  GET    http://localhost:${PORT}/leads/sources`);
    logger.info(`  GET    http://localhost:${PORT}/health`);
    logger.info(`  POST   http://localhost:${PORT}/exotel/status-callback`);
    logger.info(`  GET    http://localhost:${PORT}/exotel/stats`);
    logger.info('');
    logger.info('Ready to accept lead ingestion requests! 🎉');

    if (config.exotel.enabled) {
        logger.info('📞 Exotel IVR calling is ENABLED');
        logger.info(`   Call delay: ${config.exotel.callDelayMs}ms (${config.exotel.callDelayMs / 1000}s)`);
    } else {
        logger.info('📞 Exotel IVR calling is DISABLED');
    }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    const callScheduler = require('./services/callScheduler');
    await callScheduler.shutdown();
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully...');
    const callScheduler = require('./services/callScheduler');
    await callScheduler.shutdown();
    process.exit(0);
});

module.exports = app;
