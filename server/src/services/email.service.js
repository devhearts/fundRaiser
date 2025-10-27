// Email service (for future notifications)
const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    if (config.email.user && config.email.password) {
      this.transporter = nodemailer.createTransport({
        service: config.email.service,
        auth: {
          user: config.email.user,
          pass: config.email.password
        }
      });
    }
  }

  async sendEmail(to, subject, text, html = null) {
    if (!this.transporter) {
      logger.warn('Email service not configured');
      return false;
    }

    try {
      const mailOptions = {
        from: config.email.user,
        to,
        subject,
        text,
        html
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to}`);
      return true;
    } catch (error) {
      logger.error('Failed to send email:', error.message);
      return false;
    }
  }

  async sendEventConfirmation(organizerEmail, eventTitle) {
    const subject = `Event Created: ${eventTitle}`;
    const text = `Your fundraising event "${eventTitle}" has been created successfully.`;
    
    return await this.sendEmail(organizerEmail, subject, text);
  }

  async sendContributionConfirmation(donorEmail, amount, eventTitle) {
    const subject = `Thank you for your contribution to ${eventTitle}`;
    const text = `Thank you for your contribution of $${amount} to "${eventTitle}".`;
    
    return await this.sendEmail(donorEmail, subject, text);
  }

  async sendVerificationEmail(email, verificationLink) {
    const subject = 'Verify your email address';
    const html = `
      <h2>Welcome to FundRaiser!</h2>
      <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
      <p><a href="${verificationLink}">Verify Email</a></p>
      <p>Or copy and paste this link into your browser:</p>
      <p>${verificationLink}</p>
      <p>This link will expire in 24 hours.</p>
    `;
    const text = `Welcome to FundRaiser! Please verify your email by visiting: ${verificationLink}`;
    
    return await this.sendEmail(email, subject, text, html);
  }

  async sendPasswordResetEmail(email, resetLink) {
    const subject = 'Reset your password';
    const html = `
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password. Click the link below to reset it:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>Or copy and paste this link into your browser:</p>
      <p>${resetLink}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
    `;
    const text = `Reset your password by visiting: ${resetLink}. This link expires in 1 hour.`;
    
    return await this.sendEmail(email, subject, text, html);
  }
}

module.exports = new EmailService();
