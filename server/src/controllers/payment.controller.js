const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const logger = require('../utils/logger');

/**
 * Mock payment processing function
 * Simulates a successful payment for development/testing
 * 
 * In production, this would integrate with actual payment gateways like:
 * - Stripe
 * - PayPal
 * - Mobile Money (MTN, Airtel, etc.)
 * - Bank transfers
 */
const mockPaymentGateway = async (paymentData) => {
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock successful payment response
  return {
    success: true,
    transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    status: 'completed',
    processedAt: new Date(),
    message: 'Payment processed successfully (MOCK)'
  };
};

/**
 * Allocate payment using FIFO strategy
 * Returns array of {contributionId, amount} for fulfilled contributions
 */
const allocatePaymentFIFO = async (phone, eventId, paymentAmount) => {
  // Get all user contributions for this event, sorted by creation date (FIFO)
  const contributions = await db.findContributionsByPhoneAndEvent(phone, eventId);
  contributions.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const fulfilledContributions = [];
  let remainingAmount = paymentAmount;

  for (const contribution of contributions) {
    if (remainingAmount <= 0) break;

    // Calculate how much has been paid for this contribution
    const payments = await db.findPaymentsByContributionId(contribution.id);
    const paidAmount = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    
    const contributionAmount = parseFloat(contribution.amount) || 0;
    const unpaidAmount = contributionAmount - paidAmount;

    if (unpaidAmount > 0) {
      const allocationAmount = Math.min(remainingAmount, unpaidAmount);
      fulfilledContributions.push({
        contributionId: contribution.id,
        amount: allocationAmount
      });
      remainingAmount -= allocationAmount;
    }
  }

  return { fulfilledContributions, remainingAmount };
};

/**
 * Process payment for a contribution or direct payment
 * POST /api/payments/process
 * 
 * Supports two modes:
 * 1. Direct payment (eventId provided): Allocates using FIFO, creates contribution for excess
 * 2. Specific contribution (contributionId provided): Pays against specific contribution
 */
const processPayment = async (req, res) => {
  try {
    const {
      contributionId,
      eventId,
      amount,
      paymentMethod = 'card',
      paymentProvider = 'mock',
      payerName,
      payerEmail,
      payerPhone,
      metadata = {}
    } = req.body;

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount',
        message: 'Amount must be greater than 0'
      });
    }

    let targetEventId;
    let fulfilledContributions = [];
    let excessAmount = 0;

    // Mode 1: Direct payment (eventId provided) - allocate using FIFO
    if (eventId && !contributionId) {
      // Verify event exists
      const event = await db.findEventById(eventId);
      if (!event) {
        return res.status(404).json({
          error: 'Event not found',
          message: `Event with ID ${eventId} does not exist`
        });
      }
      targetEventId = eventId;

      // Get user's contributions for this event
      const userContributions = await db.findContributionsByPhoneAndEvent(payerPhone, eventId);
      
      // Calculate total contributions amount
      const totalContributionsAmount = userContributions.reduce(
        (sum, c) => sum + (parseFloat(c.amount) || 0), 0
      );

      // Calculate total paid amount
      const userPayments = await db.findPaymentsByPhoneAndEvent(payerPhone, eventId);
      const totalPaidAmount = userPayments.reduce(
        (sum, p) => sum + (parseFloat(p.amount) || 0), 0
      );

      // Calculate available amount (contributions - paid)
      const availableAmount = totalContributionsAmount - totalPaidAmount;

      // Allocate payment using FIFO
      const allocation = await allocatePaymentFIFO(payerPhone, eventId, amount);
      fulfilledContributions = allocation.fulfilledContributions;
      excessAmount = allocation.remainingAmount;

      // If payment exceeds available contributions, create new contribution for excess
      if (excessAmount > 0) {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const newContribution = {
          id: uuidv4(),
          eventId,
          donorName: payerName,
          donorEmail: payerEmail || '',
          donorPhone: payerPhone,
          amount: excessAmount,
          isAnonymous: false,
          isPledge: true,
          message: null,
          pledgeDate: today,
          status: 'pending', // Will be confirmed when payment is processed
          createdAt: new Date()
        };

        const createdContribution = await db.addContribution(newContribution);
        fulfilledContributions.push({
          contributionId: createdContribution.id,
          amount: excessAmount
        });

        logger.info(`Created new contribution ${createdContribution.id} for excess amount ${excessAmount}`);
      }

    } 
    // Mode 2: Specific contribution payment (contributionId provided)
    else if (contributionId && !eventId) {
      const contribution = await db.findContributionById(contributionId);
      if (!contribution) {
        return res.status(404).json({
          error: 'Contribution not found',
          message: `Contribution with ID ${contributionId} does not exist`
        });
      }
      targetEventId = contribution.eventId;

      // Verify payer identity matches contribution creator
      const nameMatches = payerName && contribution.donorName && 
        payerName.toLowerCase().trim() === contribution.donorName.toLowerCase().trim();
      const emailMatches = payerEmail && contribution.donorEmail && 
        payerEmail.toLowerCase().trim() === contribution.donorEmail.toLowerCase().trim();
      const phoneMatches = payerPhone && contribution.donorPhone && 
        payerPhone.trim() === contribution.donorPhone.trim();

      if (!nameMatches && !emailMatches && !phoneMatches) {
        return res.status(403).json({
          error: 'Contribution ownership verification failed',
          message: 'The payer information does not match the contribution creator.',
          details: {
            required: {
              name: contribution.donorName,
              email: contribution.donorEmail || 'not provided',
              phone: contribution.donorPhone || 'not provided'
            },
            provided: {
              name: payerName,
              email: payerEmail || 'not provided',
              phone: payerPhone || 'not provided'
            }
          }
        });
      }

      // Check how much has been paid for this contribution
      const payments = await db.findPaymentsByContributionId(contributionId);
      const paidAmount = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
      
      const contributionAmount = parseFloat(contribution.amount) || 0;
      const unpaidAmount = contributionAmount - paidAmount;

      if (unpaidAmount <= 0) {
        return res.status(400).json({
          error: 'Contribution already fully paid',
          message: 'This contribution has already been fully paid'
        });
      }

      if (amount > unpaidAmount) {
        return res.status(400).json({
          error: 'Payment amount exceeds unpaid amount',
          message: `Unpaid amount is ${unpaidAmount}, but payment is ${amount}`,
          unpaidAmount,
          paymentAmount: amount
        });
      }

      fulfilledContributions = [{
        contributionId: contributionId,
        amount: amount
      }];
    } else {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Either contributionId or eventId must be provided (not both)'
      });
    }

    // Process payment through mock gateway
    logger.info(`Processing payment of ${amount} via ${paymentProvider}`);
    const paymentResult = await mockPaymentGateway({
      amount,
      paymentMethod,
      paymentProvider,
      metadata
    });

    // Ensure we have at least one contribution (should always be the case)
    if (!fulfilledContributions || fulfilledContributions.length === 0) {
      return res.status(400).json({
        error: 'No contributions to fulfill',
        message: 'Payment could not be allocated to any contributions'
      });
    }

    // Get primary contributionId (first one in the list)
    const primaryContributionId = fulfilledContributions[0].contributionId;

    if (!paymentResult.success) {
      const paymentRecord = {
        id: uuidv4(),
        contributionId: primaryContributionId, // Required - always present
        amount,
        paymentMethod,
        paymentProvider,
        payerName: payerName || null,
        payerEmail: payerEmail || null,
        payerPhone: payerPhone || null,
        fulfilledContributions: JSON.stringify([]),
        transactionId: paymentResult.transactionId || null,
        status: 'failed',
        processedAt: new Date(),
        failureReason: paymentResult.message || 'Payment processing failed',
        createdAt: new Date()
      };

      await db.addPayment(paymentRecord);

      return res.status(400).json({
        error: 'Payment processing failed',
        message: paymentResult.message || 'Payment could not be processed',
        payment: paymentRecord
      });
    }

    // Payment successful - create payment record
    const paymentRecord = {
      id: uuidv4(),
      contributionId: primaryContributionId, // Required - always present
      amount,
      paymentMethod,
      paymentProvider,
      payerName: payerName || null,
      payerEmail: payerEmail || null,
      payerPhone: payerPhone || null,
      fulfilledContributions: JSON.stringify(fulfilledContributions),
      transactionId: paymentResult.transactionId,
      status: 'completed',
      processedAt: paymentResult.processedAt || new Date(),
      failureReason: null,
      createdAt: new Date()
    };

    const createdPayment = await db.addPayment(paymentRecord);

    // Update contributions and event amount
    let totalAmountAdded = 0;
    for (const fulfilled of fulfilledContributions) {
      const contribution = await db.findContributionById(fulfilled.contributionId);
      if (!contribution) continue;

      // Calculate total paid for this contribution
      const allPayments = await db.findPaymentsByContributionId(fulfilled.contributionId);
      const totalPaid = allPayments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
      
      const contributionAmount = parseFloat(contribution.amount) || 0;
      const wasFullyPaid = contribution.status === 'confirmed';
      
      // Update contribution status if fully paid
      if (totalPaid >= contributionAmount && !wasFullyPaid) {
        await db.updateContribution(fulfilled.contributionId, { status: 'confirmed' });
        totalAmountAdded += contributionAmount;
      } else if (!wasFullyPaid) {
        // Partial payment - add only the new amount
        totalAmountAdded += fulfilled.amount;
      }
    }

    logger.info(`Payment ${createdPayment.id} processed successfully. Fulfilled ${fulfilledContributions.length} contribution(s)`);

    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      payment: createdPayment,
      fulfilledContributions: fulfilledContributions.map(f => ({
        contributionId: f.contributionId,
        amount: f.amount
      })),
      excessAmount: excessAmount > 0 ? excessAmount : undefined
    });
  } catch (error) {
    logger.error('Payment processing error:', error);
    res.status(500).json({
      error: 'Payment processing failed',
      message: 'An error occurred while processing the payment'
    });
  }
};

/**
 * Get payment details
 * GET /api/payments/:id
 */
const getPaymentById = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const payment = await db.findPaymentById(paymentId);

    if (!payment) {
      return res.status(404).json({
        error: 'Payment not found',
        message: `Payment with ID ${paymentId} does not exist`
      });
    }

    res.json(payment);
  } catch (error) {
    logger.error('Failed to get payment:', error);
    res.status(500).json({
      error: 'Failed to fetch payment',
      message: 'An error occurred while fetching the payment'
    });
  }
};

/**
 * Update payment status
 * PUT /api/payments/:id/status
 */
const updatePaymentStatus = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const { status, failureReason } = req.body;

    if (!status) {
      return res.status(400).json({
        error: 'Missing required field',
        message: 'status is required'
      });
    }

    const validStatuses = ['pending', 'processing', 'completed', 'failed', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const payment = await db.findPaymentById(paymentId);
    if (!payment) {
      return res.status(404).json({
        error: 'Payment not found',
        message: `Payment with ID ${paymentId} does not exist`
      });
    }

    const updates = { status };
    if (failureReason) {
      updates.failureReason = failureReason;
    }

    const updatedPayment = await db.updatePayment(paymentId, updates);

    res.json({
      success: true,
      message: 'Payment status updated',
      payment: updatedPayment
    });
  } catch (error) {
    logger.error('Failed to update payment status:', error);
    res.status(500).json({
      error: 'Failed to update payment status',
      message: 'An error occurred while updating the payment status'
    });
  }
};

/**
 * Get payments for a contribution
 * GET /api/payments/contribution/:contributionId
 */
const getPaymentsByContributionId = async (req, res) => {
  try {
    const contributionId = req.params.contributionId;

    // Verify contribution exists
    const contribution = await db.findContributionById(contributionId);
    if (!contribution) {
      return res.status(404).json({
        error: 'Contribution not found',
        message: `Contribution with ID ${contributionId} does not exist`
      });
    }

    const payments = await db.findPaymentsByContributionId(contributionId);
    res.json(payments);
  } catch (error) {
    logger.error('Failed to get payments:', error);
    res.status(500).json({
      error: 'Failed to fetch payments',
      message: 'An error occurred while fetching payments'
    });
  }
};

/**
 * Process payment by creating a contribution first, then processing payment for it
 * POST /api/payments/create-and-pay
 * 
 * This endpoint always creates a new contribution first, then processes a payment for it.
 * This is different from /api/payments/process which uses FIFO allocation.
 */
const processPaymentWithContribution = async (req, res) => {
  try {
    const {
      eventId,
      amount,
      paymentMethod = 'card',
      paymentProvider = 'mock',
      payerName,
      payerEmail,
      payerPhone,
      metadata = {}
    } = req.body;

    // Validate required fields
    if (!eventId) {
      return res.status(400).json({
        error: 'Missing required field',
        message: 'eventId is required'
      });
    }

    if (!payerName || !payerPhone) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'payerName and payerPhone are required'
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount',
        message: 'Amount must be greater than 0'
      });
    }

    // Verify event exists
    const event = await db.findEventById(eventId);
    if (!event) {
      return res.status(404).json({
        error: 'Event not found',
        message: `Event with ID ${eventId} does not exist`
      });
    }

    // Step 1: Create a new contribution with the payment amount
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const newContribution = {
      id: uuidv4(),
      eventId,
      donorName: payerName,
      donorEmail: payerEmail || '',
      donorPhone: payerPhone,
      amount: amount, // Use the payment amount for the contribution
      isAnonymous: false,
      isPledge: true,
      message: metadata.message || null,
      pledgeDate: today,
      status: 'pending', // Will be confirmed when payment is processed
      createdAt: new Date()
    };

    const createdContribution = await db.addContribution(newContribution);
    logger.info(`Created new contribution ${createdContribution.id} with amount ${amount}`);

    // Step 2: Process payment for the newly created contribution
    const fulfilledContributions = [{
      contributionId: createdContribution.id,
      amount: amount
    }];

    // Process payment through mock gateway
    logger.info(`Processing payment of ${amount} via ${paymentProvider} for contribution ${createdContribution.id}`);
    const paymentResult = await mockPaymentGateway({
      amount,
      paymentMethod,
      paymentProvider,
      metadata
    });

    const primaryContributionId = createdContribution.id;

    if (!paymentResult.success) {
      const paymentRecord = {
        id: uuidv4(),
        contributionId: primaryContributionId,
        amount,
        paymentMethod,
        paymentProvider,
        payerName: payerName || null,
        payerEmail: payerEmail || null,
        payerPhone: payerPhone || null,
        fulfilledContributions: JSON.stringify([]),
        transactionId: paymentResult.transactionId || null,
        status: 'failed',
        processedAt: new Date(),
        failureReason: paymentResult.message || 'Payment processing failed',
        createdAt: new Date()
      };

      await db.addPayment(paymentRecord);

      return res.status(400).json({
        error: 'Payment processing failed',
        message: paymentResult.message || 'Payment could not be processed',
        payment: paymentRecord,
        contribution: createdContribution
      });
    }

    // Payment successful - create payment record
    const paymentRecord = {
      id: uuidv4(),
      contributionId: primaryContributionId,
      amount,
      paymentMethod,
      paymentProvider,
      payerName: payerName || null,
      payerEmail: payerEmail || null,
      payerPhone: payerPhone || null,
      fulfilledContributions: JSON.stringify(fulfilledContributions),
      transactionId: paymentResult.transactionId,
      status: 'completed',
      processedAt: paymentResult.processedAt || new Date(),
      failureReason: null,
      createdAt: new Date()
    };

    const createdPayment = await db.addPayment(paymentRecord);

    // Update contribution and event amount
    const contribution = await db.findContributionById(primaryContributionId);
    if (contribution) {
      // Calculate total paid for this contribution
      const allPayments = await db.findPaymentsByContributionId(primaryContributionId);
      const totalPaid = allPayments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
      
      const contributionAmount = parseFloat(contribution.amount) || 0;
      const wasFullyPaid = contribution.status === 'confirmed';
      
      // Update contribution status if fully paid
      if (totalPaid >= contributionAmount && !wasFullyPaid) {
        await db.updateContribution(primaryContributionId, { status: 'confirmed' });
      }
    }

    logger.info(`Payment ${createdPayment.id} processed successfully for contribution ${createdContribution.id}`);

    res.status(201).json({
      success: true,
      message: 'Contribution created and payment processed successfully',
      contribution: createdContribution,
      payment: createdPayment,
      fulfilledContributions: fulfilledContributions.map(f => ({
        contributionId: f.contributionId,
        amount: f.amount
      }))
    });
  } catch (error) {
    logger.error('Payment processing with contribution error:', error);
    res.status(500).json({
      error: 'Payment processing failed',
      message: 'An error occurred while processing the payment'
    });
  }
};

module.exports = {
  processPayment,
  processPaymentWithContribution,
  getPaymentById,
  updatePaymentStatus,
  getPaymentsByContributionId
};

