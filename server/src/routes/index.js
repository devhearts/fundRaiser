const express = require('express');
const eventController = require('../controllers/event.controller');
const contributionController = require('../controllers/contribution.controller');
const eventUpdateController = require('../controllers/event-update.controller');
const paymentController = require('../controllers/payment.controller');
const authRoutes = require('./auth.routes');
const { auth, optionalAuth } = require('../middlewares/auth.middleware');
const { phoneAuth } = require('../middlewares/phone-auth.middleware');
const { 
  createEventSchema, 
  updateEventSchema, 
  createContributionSchema, 
  updateContributionSchema,
  createPledgeSchema,
  createEventUpdateSchema,
  updateEventUpdateSchema,
  processPaymentSchema,
  processPaymentWithContributionSchema,
  updatePaymentStatusSchema,
  verifyPhoneSchema,
  validate 
} = require('../validations/event.validation');

const router = express.Router();

// Auth routes
router.use('/', authRoutes);

// Event routes
router.get('/events', auth, eventController.getAllEvents);
router.get('/events/search', auth, eventController.searchEvents);
router.get('/events/user/:userId', auth, eventController.getEventsByUser);
router.get('/events/:id', optionalAuth, eventController.getEventById); // Public endpoint - optional authentication for enhanced data
router.post('/events', auth, validate(createEventSchema), eventController.createEvent);
router.put('/events/:id', auth, validate(updateEventSchema), eventController.updateEvent);
router.delete('/events/:id', auth, eventController.deleteEvent);

// Contribution routes
router.post('/contributions/verify-phone', validate(verifyPhoneSchema), contributionController.verifyPhone);
router.get('/events/:eventId/contributions', optionalAuth, phoneAuth, contributionController.getContributionsByEventId);
router.post('/events/:eventId/contributions', validate(createContributionSchema), contributionController.createContribution);
router.post('/events/:eventId/pledges', validate(createPledgeSchema), contributionController.createPledge); // Public endpoint - no authentication required
router.put('/contributions/:id', validate(updateContributionSchema), contributionController.updateContribution);

// Event Update routes
router.get('/events/:id/updates', eventUpdateController.getEventUpdates);
router.post('/events/:id/updates', validate(createEventUpdateSchema), eventUpdateController.createEventUpdate);
router.put('/events/:id/updates/:updateId', validate(updateEventUpdateSchema), eventUpdateController.updateEventUpdate);
router.delete('/events/:id/updates/:updateId', eventUpdateController.deleteEventUpdate);

// Payment routes
router.post('/payments/process', validate(processPaymentSchema), paymentController.processPayment);
router.post('/payments/create-and-pay', validate(processPaymentWithContributionSchema), paymentController.processPaymentWithContribution);
router.get('/payments/:id', paymentController.getPaymentById);
router.put('/payments/:id/status', validate(updatePaymentStatusSchema), paymentController.updatePaymentStatus);
router.get('/payments/contribution/:contributionId', paymentController.getPaymentsByContributionId);

module.exports = router;
