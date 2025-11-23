// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const sheetsService = require('./services/sheets.service');
const routes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

// Function to initialize services (extracted for reuse)
const initializeServices = async () => {
  const results = {
    timestamp: new Date().toISOString(),
    services: {},
    initialized: false,
    errors: []
  };

  try {
    // Check Google Sheets service
    const isSheetsInitialized = sheetsService.isInitialized();

    if (!isSheetsInitialized) {
      try {
        await sheetsService.initialize();
        results.services.googleSheets = {
          status: 'initialized',
          message: 'Google Sheets service initialized successfully'
        };
        results.initialized = true;
        console.log('✅ [Auto-init] Google Sheets service initialized successfully');
      } catch (error) {
        results.services.googleSheets = {
          status: 'failed',
          message: `Failed to initialize: ${error.message}`
        };
        results.errors.push({
          service: 'googleSheets',
          error: error.message
        });
        console.error('⚠️  [Auto-init] Failed to initialize Google Sheets service:', error.message);
      }
    } else {
      results.services.googleSheets = {
        status: 'already_initialized',
        message: 'Google Sheets service was already initialized'
      };
      results.initialized = true;
      console.log('✅ [Auto-init] Google Sheets service already initialized - no action needed');
    }

    return results;
  } catch (error) {
    console.error('⚠️  [Auto-init] Error during service initialization:', error.message);
    results.errors.push({
      service: 'general',
      error: error.message
    });
    return results;
  }
};

// Initialize Google Sheets service on app startup
// This ensures the service is ready for serverless environments (Vercel)
// Uses simple initialization (lazy initialization will handle failures)
(async () => {
  try {
    await sheetsService.initialize();
    console.log('✅ Google Sheets service initialized successfully');
  } catch (error) {
    console.error('⚠️  Failed to initialize Google Sheets service on startup:', error.message);
    console.error('⚠️  Service will attempt lazy initialization on first use');
    // Don't throw - allow lazy initialization on first use
  }
})();

// Note: Service methods have lazy initialization built-in
// Any API call will automatically initialize the service if needed
// This eliminates the need for a scheduled task

// Middleware - CORS with configuration
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const servicesStatus = {
    googleSheets: sheetsService.isInitialized() ? 'initialized' : 'not_initialized'
  };

  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: servicesStatus,
    message: servicesStatus.googleSheets === 'initialized'
      ? 'All services are ready'
      : 'Some services are not initialized. Call /api/init to initialize them.'
  });
});

// Initialize services endpoint
// This endpoint checks if services are initialized and initializes them if needed
app.get('/api/init', async (req, res) => {
  try {
    const results = await initializeServices();

    // Check environment variables
    results.services.environment = {
      GOOGLE_SHEETS_ID: process.env.GOOGLE_SHEETS_ID ? 'set' : 'missing',
      GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL ? 'set' : 'missing',
      GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY ? 'set' : 'missing',
      NODE_ENV: process.env.NODE_ENV || 'not set',
      CORS_ORIGIN: process.env.CORS_ORIGIN || 'not set'
    };

    // Determine overall status
    const allServicesReady = results.services.googleSheets.status === 'initialized' ||
                            results.services.googleSheets.status === 'already_initialized';

    res.status(allServicesReady ? 200 : 503).json({
      ...results,
      status: allServicesReady ? 'ready' : 'partial',
      message: allServicesReady
        ? 'All services are ready'
        : 'Some services failed to initialize'
    });

  } catch (error) {
    res.status(500).json({
      timestamp: new Date().toISOString(),
      status: 'error',
      message: 'Failed to check/initialize services',
      error: error.message
    });
  }
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
