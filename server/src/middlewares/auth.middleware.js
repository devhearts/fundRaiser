// Authentication middleware
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const sheetsService = require('../services/sheets.service');
const logger = require('../utils/logger');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'No token provided' 
      });
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Check if token is marked as valid
    if (!decoded.isValid) {
      logger.warn(`Invalid token used by user: ${decoded.email}`);
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'Token has been invalidated' 
      });
    }

    // Check if user session is still active
    const sessions = await sheetsService.getAllRows('UserSessions');
    const activeSession = sessions.find(session => 
      session.sessionToken === token && 
      session.isActive === true &&
      session.userId === decoded.id
    );

    if (!activeSession) {
      logger.warn(`Inactive session token used by user: ${decoded.email}`);
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'Session has expired or been terminated' 
      });
    }

    // Check if session has expired
    if (new Date(activeSession.expiresAt) < new Date()) {
      logger.warn(`Expired session token used by user: ${decoded.email}`);
      // Mark session as inactive
      await sheetsService.updateUserSession(activeSession.id, {
        isActive: false,
        updatedAt: new Date().toISOString()
      });
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'Session has expired' 
      });
    }

    req.user = decoded;
    req.sessionId = activeSession.id;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error.message);
    res.status(401).json({ 
      error: 'Access denied', 
      message: 'Invalid token' 
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized for this action' });
    }

    next();
  };
};

module.exports = {
  auth,
  authorize
};
