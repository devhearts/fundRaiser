const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,

  // Frontend URL for email links
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // CORS configuration
  cors: {
    origin: (() => {
      const origin = process.env.CORS_ORIGIN || '*';
      // If comma-separated, convert to array
      if (origin.includes(',')) {
        return origin.split(',').map(o => o.trim());
      }
      return origin;
    })(),
    credentials: true
  },

  // Database configuration (for future use)
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/fundraiser',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },

  // JWT configuration (for future authentication)
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  // Email configuration (for future notifications)
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }
};

module.exports = config;
