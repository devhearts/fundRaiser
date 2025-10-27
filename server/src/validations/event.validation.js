const { z } = require('zod');

// Event validation schemas
const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description too long'),
  goalAmount: z.number().positive('Goal amount must be positive'),
  coverImage: z.union([z.string().url('Invalid image URL'), z.literal('')]).optional(),
  location: z.string().max(200, 'Location too long').optional(),
  deadline: z.string().datetime('Invalid deadline format').optional(),
  isPublic: z.boolean().optional().default(true),
  status: z.string().optional().default('active')
}).strict();

const updateEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description too long').optional(),
  goalAmount: z.number().positive('Goal amount must be positive').optional(),
  coverImage: z.union([z.string().url('Invalid image URL'), z.literal('')]).optional(),
  location: z.string().max(200, 'Location too long').optional(),
  deadline: z.string().datetime('Invalid deadline format').optional(),
  isPublic: z.boolean().optional(),
  organizerName: z.string().min(2, 'Organizer name must be at least 2 characters').max(100, 'Organizer name too long').optional(),
  organizerEmail: z.string().email('Invalid email format').optional(),
  status: z.string().optional()
}).strict();

// Contribution validation schemas
const createContributionSchema = z.object({
  donorName: z.string().min(1, 'Donor name is required').max(100, 'Donor name too long'),
  donorEmail: z.string().email('Invalid email format'),
  amount: z.number().positive('Amount must be positive'),
  isAnonymous: z.boolean().optional().default(false),
  isPledge: z.boolean().optional().default(false),
  message: z.string().max(500, 'Message too long').nullable().optional(),
  status: z.string().optional().default('pending')
}).strict();

const updateContributionSchema = z.object({
  status: z.string().min(1, 'Status is required')
}).strict();

// Event Update validation schemas
const createEventUpdateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
  content: z.string().min(10, 'Content must be at least 10 characters').max(5000, 'Content too long'),
  images: z.string().optional(),
  isPublic: z.boolean().optional().default(true)
}).strict();

const updateEventUpdateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long').optional(),
  content: z.string().min(10, 'Content must be at least 10 characters').max(5000, 'Content too long').optional(),
  images: z.string().optional(),
  isPublic: z.boolean().optional()
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
  createEventSchema,
  updateEventSchema,
  createContributionSchema,
  updateContributionSchema,
  createEventUpdateSchema,
  updateEventUpdateSchema,
  validate
};
