const express = require('express');
const { 
  register, 
  login, 
  logout, 
  getProfile, 
  updateProfile, 
  invalidateAllSessions,
  refresh,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification
} = require('../controllers/auth.controller');
const { auth } = require('../middlewares/auth.middleware');
const { 
  registerSchema, 
  loginSchema, 
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  validate 
} = require('../validations/auth.validation');

const router = express.Router();

// Authentication routes
router.post('/auth/register', validate(registerSchema), register);
router.post('/auth/login', validate(loginSchema), login);
router.post('/auth/logout', auth, logout);
router.post('/auth/refresh', refresh);
router.post('/auth/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/auth/reset-password', validate(resetPasswordSchema), resetPassword);
router.post('/auth/verify-email', validate(verifyEmailSchema), verifyEmail);
router.post('/auth/resend-verification', validate(resendVerificationSchema), resendVerification);

// User profile routes (protected)
router.get('/users/profile', auth, getProfile);
router.put('/users/profile', auth, validate(updateProfileSchema), updateProfile);

// Security routes (protected)
router.post('/auth/invalidate-all-sessions', auth, invalidateAllSessions);

module.exports = router;
