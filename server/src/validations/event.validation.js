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
// All contributions are now pledges (promises to pay later)
const createContributionSchema = z.object({
  donorName: z.string().min(1, 'Donor name is required').max(100, 'Donor name too long'),
  donorEmail: z.union([z.string().email('Invalid email format'), z.literal('')]).optional(),
  donorPhone: z.string()
    .min(1, 'Phone number is required')
    .regex(/^07\d{8}$/, 'Must be 10 digits starting with 07'),
  amount: z.number().positive('Amount must be positive'),
  isAnonymous: z.boolean().optional().default(false),
  message: z.string().max(500, 'Message too long').nullable().optional(),
  pledgeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD').refine((date) => {
    const pledgeDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    pledgeDate.setHours(0, 0, 0, 0);
    return pledgeDate >= today;
  }, 'Pledge date must be today or in the future').optional(),
  status: z.string().optional().default('pending')
}).strict();

const updateContributionSchema = z.object({
  status: z.string().min(1, 'Status is required')
}).strict();

// Legacy pledge schema - kept for backward compatibility but now uses createContributionSchema
// All contributions are pledges, so this is deprecated
const createPledgeSchema = createContributionSchema;

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

// Payment validation schemas
const processPaymentSchema = z.object({
  // For direct payment: eventId provided, contribution will be created first
  // For specific contribution: contributionId provided
  contributionId: z.string().min(1, 'Contribution ID is required').optional(),
  eventId: z.string().min(1, 'Event ID is required').optional(), // For direct payments
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.enum(['card', 'mobile_money', 'bank_transfer', 'cash', 'other']).optional().default('card'),
  paymentProvider: z.string().max(50, 'Payment provider name too long').optional().default('mock'),
  // Payer identification - required
  payerName: z.string().min(1, 'Payer name is required').max(100, 'Payer name too long'),
  payerEmail: z.string().email('Invalid payer email format').optional(),
  payerPhone: z.string().regex(/^07\d{8}$/, 'Must be 10 digits starting with 07'),
  metadata: z.record(z.any()).optional().default({})
}).strict().refine((data) => {
  // Either contributionId or eventId must be provided (not both)
  return (data.contributionId && !data.eventId) || (!data.contributionId && data.eventId);
}, {
  message: 'Either contributionId or eventId must be provided (not both)',
  path: ['contributionId', 'eventId']
});

const processPaymentWithContributionSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.enum(['card', 'mobile_money', 'bank_transfer', 'cash', 'other']).optional().default('card'),
  paymentProvider: z.string().max(50, 'Payment provider name too long').optional().default('mock'),
  payerName: z.string().min(1, 'Payer name is required').max(100, 'Payer name too long'),
  payerEmail: z.string().email('Invalid payer email format').optional(),
  payerPhone: z.string().regex(/^07\d{8}$/, 'Must be 10 digits starting with 07'),
  metadata: z.record(z.any()).optional().default({})
}).strict();

const updatePaymentStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'refunded'], {
    errorMap: () => ({ message: 'Status must be one of: pending, processing, completed, failed, refunded' })
  }),
  failureReason: z.string().max(500, 'Failure reason too long').nullable().optional()
}).strict();

// Phone verification schema for JWT token generation
const verifyPhoneSchema = z.object({
  phone: z.string()
    .min(1, 'Phone number is required')
    .regex(/^07\d{8}$/, 'Must be 10 digits starting with 07'),
  eventId: z.string().min(1, 'Event ID is required')
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
  createPledgeSchema, // Deprecated - use createContributionSchema instead
  createEventUpdateSchema,
  updateEventUpdateSchema,
  processPaymentSchema,
  processPaymentWithContributionSchema,
  updatePaymentStatusSchema,
  verifyPhoneSchema,
  validate
};
