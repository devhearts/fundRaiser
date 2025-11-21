// Phone verification JWT middleware
// This middleware verifies phone verification tokens (5 minute expiry)
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const logger = require('../utils/logger');

const phoneAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      req.phoneToken = null;
      return next();
    }

    // Verify and decode the token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        logger.debug('Phone auth: Expired token provided');
      } else if (error.name === 'JsonWebTokenError') {
        logger.debug('Phone auth: Invalid token format provided');
      } else {
        logger.debug(`Phone auth: Token verification failed (${error.name})`);
      }
      req.phoneToken = null;
      return next();
    }

    // Check if this is a phone verification token
    if (decoded.type !== 'phone_verification') {
      req.phoneToken = null;
      return next();
    }

    // Token is valid, attach to request
    req.phoneToken = {
      phone: decoded.phone,
      eventId: decoded.eventId
    };

    next();
  } catch (error) {
    logger.debug('Phone auth middleware error:', error.message);
    req.phoneToken = null;
    next();
  }
};

module.exports = { phoneAuth };

