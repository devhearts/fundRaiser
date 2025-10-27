// Load environment variables first
require('dotenv').config();

const app = require('./app');
const config = require('./config/config');
const db = require('./config/db');

const PORT = config.port || 3000;

const startServer = async () => {
  try {
    // Debug: Check if environment variables are loaded
    console.log('🔍 Environment Variables Check:');
    console.log('GOOGLE_SHEETS_ID:', process.env.GOOGLE_SHEETS_ID ? '✅ Set' : '❌ Missing');
    console.log('GOOGLE_CLIENT_EMAIL:', process.env.GOOGLE_CLIENT_EMAIL ? '✅ Set' : '❌ Missing');
    console.log('GOOGLE_PRIVATE_KEY:', process.env.GOOGLE_PRIVATE_KEY ? '✅ Set' : '❌ Missing');

    // Initialize database connection
    await db.connectDatabase();

    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${config.env}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Process terminated');
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received. Shutting down gracefully...');
      server.close(() => {
        console.log('Process terminated');
      });
    });

    return server;
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
