const { z } = require('zod');

// User registration validation schema
const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  phone: z.string()
    .min(1, 'Phone number is required')
    .regex(/^0\d{9}$/, 'Phone number must be 10 digits starting with 0 (e.g., 0764124754)'),
  
  address: z.string()
    .max(500, 'Address must be less than 500 characters')
    .optional()
    .nullable(),
  
  role: z.enum(['user', 'organizer', 'admin'])
    .optional()
    .default('organizer'),
}).strict();

// User login validation schema
const loginSchema = z.object({
  email: z.string()
    .email('Invalid email format'),
  
  password: z.string()
    .min(1, 'Password is required')
}).strict();

// Password change validation schema
const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Current password is required'),
  
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
}).strict();

// Profile update validation schema
const updateProfileSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .optional(),
  
  phone: z.string()
    .regex(/^0\d{9}$/, 'Phone number must be 10 digits starting with 0 (e.g., 0764124754)')
    .optional()
    .nullable(),
  
  address: z.string()
    .max(500, 'Address must be less than 500 characters')
    .optional()
    .nullable(),
  
  profileImage: z.string()
    .url('Invalid image URL')
    .optional()
    .nullable(),
}).strict();

// Forgot password validation schema
const forgotPasswordSchema = z.object({
  email: z.string()
    .email('Invalid email format'),
}).strict();

// Reset password validation schema
const resetPasswordSchema = z.object({
  token: z.string()
    .min(1, 'Reset token is required'),
  
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
}).strict();

// Verify email validation schema
const verifyEmailSchema = z.object({
  token: z.string()
    .min(1, 'Verification token is required'),
}).strict();

// Resend verification validation schema
const resendVerificationSchema = z.object({
  email: z.string()
    .email('Invalid email format'),
}).strict();

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  validate
};
