const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const sheetsService = require('../services/sheets.service');
const emailService = require('../services/email.service');
const config = require('../config/config');
const logger = require('../utils/logger');

class AuthController {
  // Generate JWT token
  generateToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  // Register new user
  async register(req, res) {
    try {
      const { name, email, password, phone, address, role } = req.body;

      logger.info(`Registration attempt for email: ${email}`);

      // Check if user already exists by email
      const existingUserByEmail = await sheetsService.getUserByEmail(email);
      if (existingUserByEmail) {
        logger.info(`User already exists with email: ${email}`);
        return res.status(409).json({
          error: 'User already exists',
          message: 'An account with this email already exists'
        });
      }

      // Check if user already exists by phone
      const existingUserByPhone = await sheetsService.getUserByPhone(phone);
      if (existingUserByPhone) {
        logger.info(`User already exists with phone: ${phone}`);
        return res.status(409).json({
          error: 'Phone number already exists',
          message: 'An account with this phone number already exists'
        });
      }

      logger.info(`Creating new user: ${email}`);

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Generate email verification token
      const verificationToken = uuidv4();
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create user data
      const userData = {
        id: uuidv4(),
        name,
        email,
        password: hashedPassword,
        role: role || 'user',
        profileImage: null,
        phone: phone || null,
        address: address || null,
        isVerified: false,
        isActive: true,
        lastLogin: null,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires.toISOString(),
        passwordResetToken: null,
        passwordResetExpires: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      logger.info(`User data prepared for: ${email}`);

      // Save user to Google Sheets
      logger.info(`Attempting to save user to Google Sheets: ${email}`);
      const createdUser = await sheetsService.createUser(userData);
      logger.info(`User created successfully in sheets: ${email}`, { userId: createdUser.id });

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: userData.id, 
          email: userData.email, 
          role: userData.role,
          isValid: true
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );
      logger.info(`JWT token generated for: ${email}`);

      // Create login log (non-blocking - don't fail registration if this fails)
      try {
        await sheetsService.createLoginLog({
          id: uuidv4(),
          userId: userData.id,
          email: userData.email,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent') || 'Unknown',
          loginMethod: 'registration',
          status: 'success',
          failureReason: null,
          location: null,
          createdAt: new Date().toISOString()
        });
        logger.info(`Login log created for: ${email}`);
      } catch (logError) {
        logger.error('Failed to create login log:', logError.message);
        // Continue with registration even if log fails
      }

      // Create user session (non-blocking - don't fail registration if this fails)
      try {
        await sheetsService.createUserSession({
          id: uuidv4(),
          userId: userData.id,
          sessionToken: token,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent') || 'Unknown',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          isActive: true,
          createdAt: new Date().toISOString()
        });
        logger.info(`User session created for: ${email}`);
      } catch (sessionError) {
        logger.error('Failed to create user session:', sessionError.message);
        // Continue with registration even if session creation fails
      }

      // Remove password from response
      const { password: _, ...userResponse } = userData;

      // Send verification email (non-blocking - don't fail registration if this fails)
      try {
        const verificationLink = `${config.frontendUrl || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
        await emailService.sendVerificationEmail(email, verificationLink);
        logger.info(`Verification email sent to: ${email}`);
      } catch (emailError) {
        logger.error('Failed to send verification email:', emailError.message);
        // Continue with registration even if email fails
      }

      logger.info(`New user registered successfully: ${email}`);

      res.status(201).json({
        message: 'User registered successfully',
        user: userResponse,
        token,
        expiresIn: config.jwt.expiresIn
      });

    } catch (error) {
      logger.error('Registration error:', error.message);
      res.status(500).json({
        error: 'Registration failed',
        message: 'An error occurred while creating your account'
      });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await sheetsService.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          error: 'Account disabled',
          message: 'Your account has been disabled. Please contact support.'
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        // Log failed login attempt
        await sheetsService.createLoginLog({
          id: uuidv4(),
          userId: user.id,
          email: user.email,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent') || 'Unknown',
          loginMethod: 'password',
          status: 'failed',
          failureReason: 'Invalid password',
          location: null,
          createdAt: new Date().toISOString()
        });

        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
      }

      // Update last login
      await sheetsService.updateUser(user.id, {
        lastLogin: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Create login log
      await sheetsService.createLoginLog({
        id: uuidv4(),
        userId: user.id,
        email: user.email,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent') || 'Unknown',
        loginMethod: 'password',
        status: 'success',
        failureReason: null,
        location: null,
        createdAt: new Date().toISOString()
      });

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          isValid: true
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      // Create user session
      await sheetsService.createUserSession({
        id: uuidv4(),
        userId: user.id,
        sessionToken: token,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent') || 'Unknown',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        isActive: true,
        createdAt: new Date().toISOString()
      });

      // Remove password from response
      const { password: _, ...userResponse } = user;

      logger.info(`User logged in: ${email}`);

      res.json({
        message: 'Login successful',
        user: userResponse,
        token,
        expiresIn: config.jwt.expiresIn
      });

    } catch (error) {
      logger.error('Login error:', error.message);
      res.status(500).json({
        error: 'Login failed',
        message: 'An error occurred while logging in'
      });
    }
  }

  // Logout user
  async logout(req, res) {
    try {
      const sessionId = req.sessionId;
      
      if (sessionId) {
        // Deactivate the current session
        await sheetsService.updateUserSession(sessionId, {
          isActive: false,
          updatedAt: new Date().toISOString()
        });
        
        logger.info(`Session invalidated for user: ${req.user?.email || 'Unknown'}`);
      }

      logger.info(`User logged out: ${req.user?.email || 'Unknown'}`);

      res.json({
        message: 'Logout successful',
        details: 'Token has been invalidated and can no longer be used'
      });

    } catch (error) {
      logger.error('Logout error:', error.message);
      res.status(500).json({
        error: 'Logout failed',
        message: 'An error occurred while logging out'
      });
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      const user = await sheetsService.getUserById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'User profile not found'
        });
      }

      // Remove password from response
      const { password: _, ...userResponse } = user;

      res.json({
        user: userResponse
      });

    } catch (error) {
      logger.error('Get profile error:', error.message);
      res.status(500).json({
        error: 'Failed to get profile',
        message: 'An error occurred while fetching your profile'
      });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const { name, phone, address, profileImage } = req.body;
      const userId = req.user.id;

      // Check if phone number is being updated and if it's unique
      if (phone !== undefined) {
        const existingUserByPhone = await sheetsService.getUserByPhone(phone);
        if (existingUserByPhone && existingUserByPhone.id !== userId) {
          return res.status(409).json({
            error: 'Phone number already exists',
            message: 'An account with this phone number already exists'
          });
        }
      }

      const updateData = {
        updatedAt: new Date().toISOString()
      };

      if (name !== undefined) updateData.name = name;
      if (phone !== undefined) updateData.phone = phone;
      if (address !== undefined) updateData.address = address;
      if (profileImage !== undefined) updateData.profileImage = profileImage;

      const updatedUser = await sheetsService.updateUser(userId, updateData);

      // Remove password from response
      const { password: _, ...userResponse } = updatedUser;

      logger.info(`User profile updated: ${req.user.email}`);

      res.json({
        message: 'Profile updated successfully',
        user: userResponse
      });

    } catch (error) {
      logger.error('Update profile error:', error.message);
      res.status(500).json({
        error: 'Failed to update profile',
        message: 'An error occurred while updating your profile'
      });
    }
  }

  // Invalidate all sessions for a user (security feature)
  async invalidateAllSessions(req, res) {
    try {
      const userId = req.user.id;
      
      // Get all active sessions for the user
      const userSessions = await sheetsService.getUserSessionsByUserId(userId);
      const activeSessions = userSessions.filter(session => session.isActive === true);
      
      // Deactivate all sessions
      for (const session of activeSessions) {
        await sheetsService.updateUserSession(session.id, {
          isActive: false,
          updatedAt: new Date().toISOString()
        });
      }
      
      logger.info(`All sessions invalidated for user: ${req.user.email}`);

      res.json({
        message: 'All sessions invalidated successfully',
        sessionsTerminated: activeSessions.length,
        details: 'All tokens for this user have been invalidated'
      });

    } catch (error) {
      logger.error('Invalidate all sessions error:', error.message);
      res.status(500).json({
        error: 'Failed to invalidate sessions',
        message: 'An error occurred while invalidating sessions'
      });
    }
  }

  // Refresh JWT token
  async refresh(req, res) {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({
          error: 'Access denied',
          message: 'No token provided'
        });
      }

      // Verify the existing token (but allow expired tokens)
      const decoded = jwt.verify(token, config.jwt.secret, { ignoreExpiration: true });
      
      // Get user
      const user = await sheetsService.getUserById(decoded.id);
      if (!user || !user.isActive) {
        return res.status(401).json({
          error: 'Access denied',
          message: 'User not found or inactive'
        });
      }

      // Check if the session is still active
      const sessions = await sheetsService.getAllRows('UserSessions');
      const activeSession = sessions.find(session => 
        session.sessionToken === token && 
        session.isActive === true &&
        session.userId === decoded.id
      );

      if (!activeSession) {
        return res.status(401).json({
          error: 'Access denied',
          message: 'Session has been terminated'
        });
      }

      // Generate new token
      const newToken = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          isValid: true
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      // Create new session
      await sheetsService.createUserSession({
        id: uuidv4(),
        userId: user.id,
        sessionToken: newToken,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent') || 'Unknown',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        createdAt: new Date().toISOString()
      });

      // Deactivate old session
      await sheetsService.updateUserSession(activeSession.id, {
        isActive: false,
        updatedAt: new Date().toISOString()
      });

      logger.info(`Token refreshed for user: ${user.email}`);

      res.json({
        message: 'Token refreshed successfully',
        token: newToken,
        expiresIn: config.jwt.expiresIn
      });

    } catch (error) {
      logger.error('Refresh token error:', error.message);
      res.status(401).json({
        error: 'Failed to refresh token',
        message: 'Invalid or expired token'
      });
    }
  }

  // Forgot password - send reset token
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      // Find user
      const user = await sheetsService.getUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists for security
        return res.json({
          message: 'If an account with that email exists, a password reset link has been sent'
        });
      }

      // Generate reset token
      const resetToken = uuidv4();
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Save reset token to user
      await sheetsService.updateUser(user.id, {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires.toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Send email with reset link
      const resetLink = `${config.frontendUrl || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
      logger.info(`Password reset link generated for ${email}: ${resetLink}`);

      await emailService.sendPasswordResetEmail(email, resetLink);

      logger.info(`Password reset requested for: ${email}`);

      res.json({
        message: 'If an account with that email exists, a password reset link has been sent',
        // In production, remove this debug info
        debug: {
          resetLink
        }
      });

    } catch (error) {
      logger.error('Forgot password error:', error.message);
      res.status(500).json({
        error: 'Failed to process request',
        message: 'An error occurred while processing your request'
      });
    }
  }

  // Reset password with token
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      // Find user by reset token
      const users = await sheetsService.getAllUsers();
      const user = users.find(u => 
        u.passwordResetToken === token &&
        u.passwordResetExpires &&
        new Date(u.passwordResetExpires) > new Date()
      );

      if (!user) {
        return res.status(400).json({
          error: 'Invalid or expired token',
          message: 'The password reset token is invalid or has expired'
        });
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update user password and clear reset token
      await sheetsService.updateUser(user.id, {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date().toISOString()
      });

      logger.info(`Password reset completed for: ${user.email}`);

      res.json({
        message: 'Password has been reset successfully'
      });

    } catch (error) {
      logger.error('Reset password error:', error.message);
      res.status(500).json({
        error: 'Failed to reset password',
        message: 'An error occurred while resetting your password'
      });
    }
  }

  // Verify email address
  async verifyEmail(req, res) {
    try {
      const { token } = req.body;

      // Find user by verification token
      const users = await sheetsService.getAllUsers();
      const user = users.find(u => 
        u.emailVerificationToken === token &&
        u.emailVerificationExpires &&
        new Date(u.emailVerificationExpires) > new Date()
      );

      if (!user) {
        return res.status(400).json({
          error: 'Invalid or expired token',
          message: 'The verification token is invalid or has expired'
        });
      }

      // Update user as verified
      await sheetsService.updateUser(user.id, {
        isVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        updatedAt: new Date().toISOString()
      });

      logger.info(`Email verified for: ${user.email}`);

      res.json({
        message: 'Email verified successfully'
      });

    } catch (error) {
      logger.error('Verify email error:', error.message);
      res.status(500).json({
        error: 'Failed to verify email',
        message: 'An error occurred while verifying your email'
      });
    }
  }

  // Resend verification email
  async resendVerification(req, res) {
    try {
      const { email } = req.body;

      // Find user
      const user = await sheetsService.getUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists for security
        return res.json({
          message: 'If an account with that email exists, a verification email has been sent'
        });
      }

      // Check if already verified
      if (user.isVerified) {
        return res.status(400).json({
          error: 'Already verified',
          message: 'This email address has already been verified'
        });
      }

      // Generate verification token
      const verificationToken = uuidv4();
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Save verification token to user
      await sheetsService.updateUser(user.id, {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires.toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Send email with verification link
      const verificationLink = `${config.frontendUrl || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
      logger.info(`Email verification link generated for ${email}: ${verificationLink}`);

      await emailService.sendVerificationEmail(email, verificationLink);

      logger.info(`Verification email resent to: ${email}`);

      res.json({
        message: 'If an account with that email exists, a verification email has been sent',
        // In production, remove this debug info
        debug: {
          verificationLink
        }
      });

    } catch (error) {
      logger.error('Resend verification error:', error.message);
      res.status(500).json({
        error: 'Failed to send verification email',
        message: 'An error occurred while sending the verification email'
      });
    }
  }
}

const authController = new AuthController();

module.exports = {
  register: authController.register.bind(authController),
  login: authController.login.bind(authController),
  logout: authController.logout.bind(authController),
  getProfile: authController.getProfile.bind(authController),
  updateProfile: authController.updateProfile.bind(authController),
  invalidateAllSessions: authController.invalidateAllSessions.bind(authController),
  refresh: authController.refresh.bind(authController),
  forgotPassword: authController.forgotPassword.bind(authController),
  resetPassword: authController.resetPassword.bind(authController),
  verifyEmail: authController.verifyEmail.bind(authController),
  resendVerification: authController.resendVerification.bind(authController)
};
