const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const config = require('../config/config');
const logger = require('../utils/logger');
const emailService = require('../services/email.service');
const { normalizeEmail } = require('../utils/email.utils');

// Import computeEventCurrentAmounts from event controller
// Note: This is a shared utility function for computing event amounts from payments
const computeEventCurrentAmounts = async (eventIds = []) => {
  try {
    const eventIdSet = eventIds.length ? new Set(eventIds) : null;
    const [allContributions, allPayments] = await Promise.all([
      db.getContributions(),
      db.getPayments()
    ]);

    const contributionToEvent = new Map();
    const totals = new Map();

    allContributions.forEach(contribution => {
      if (!eventIdSet || eventIdSet.has(contribution.eventId)) {
        contributionToEvent.set(contribution.id, contribution.eventId);
        if (!totals.has(contribution.eventId)) {
          totals.set(contribution.eventId, 0);
        }
      }
    });

    if (eventIdSet) {
      eventIds.forEach(id => {
        if (!totals.has(id)) {
          totals.set(id, 0);
        }
      });
    }

    allPayments
      .filter(payment => payment.status === 'completed')
      .forEach(payment => {
        const fulfilledList = Array.isArray(payment.fulfilledContributions) && payment.fulfilledContributions.length > 0
          ? payment.fulfilledContributions
          : [{ contributionId: payment.contributionId, amount: payment.amount }];

        fulfilledList.forEach(fulfilled => {
          const eventId = contributionToEvent.get(fulfilled.contributionId);
          if (!eventId) return;
          if (eventIdSet && !eventIdSet.has(eventId)) return;

          const amount = parseFloat(fulfilled.amount) || 0;
          totals.set(eventId, (totals.get(eventId) || 0) + amount);
        });
      });

    return totals;
  } catch (error) {
    logger.error('Failed to compute event current amounts:', error.message);
    return new Map();
  }
};

// Verify phone and generate JWT token (5 minute expiry)
// This creates a temporary session for viewing contributions
const verifyPhone = async (req, res) => {
  try {
    const { phone, eventId } = req.body;

    const event = await db.findEventById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const contributions = await db.findContributionsByEventId(eventId);
    const normalizePhone = (value = '') => value.replace(/\s+/g, '');
    const sanitizedPhone = normalizePhone(phone);

    const hasMatchingContribution = contributions.some(contribution => {
      if (!contribution.donorPhone) return false;
      return normalizePhone(contribution.donorPhone) === sanitizedPhone;
    });

    if (!hasMatchingContribution) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'No contributions found for the provided phone number on this event.'
      });
    }

    // Generate JWT token with 5 minute expiry
    const token = jwt.sign(
      {
        phone: sanitizedPhone,
        eventId: eventId,
        type: 'phone_verification'
      },
      config.jwt.secret,
      { expiresIn: '5m' }
    );

    logger.info(`Phone verification token generated for phone: ${sanitizedPhone}, event: ${eventId}`);

    res.json({
      message: 'Phone verified successfully',
      token,
      expiresIn: '5m'
    });
  } catch (error) {
    logger.error('Failed to verify phone:', error);
    res.status(500).json({ error: 'Failed to verify phone' });
  }
};

// Get contributions for an event
// Access: Event organizer (authenticated) OR contributors (by phone JWT token or phone query param for backward compatibility)
const getContributionsByEventId = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const phoneFromQuery = typeof req.query.phone === 'string' ? req.query.phone.trim() : '';
    const phoneToken = req.phoneToken || null; // Set by phoneAuth middleware

    const event = await db.findEventById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const contributions = await db.findContributionsByEventId(eventId);

    const user = req.user || null;
    const isOrganizer =
      !!user &&
      ((user.email && event.organizerEmail && user.email.toLowerCase() === event.organizerEmail.toLowerCase()) ||
        (user.id && event.organizerId && user.id === event.organizerId));

    if (isOrganizer) {
      return res.json(contributions);
    }

    // If phone token is present and valid, allow access
    if (phoneToken && phoneToken.eventId === eventId) {
      const normalizePhone = (value = '') => value.replace(/\s+/g, '');
      const sanitizedPhone = normalizePhone(phoneToken.phone);

      const hasMatchingContribution = contributions.some(contribution => {
        if (!contribution.donorPhone) return false;
        return normalizePhone(contribution.donorPhone) === sanitizedPhone;
      });

      if (hasMatchingContribution) {
        return res.json(contributions);
      }
    }

    // Backward compatibility: check phone query param
    if (!phoneFromQuery) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only the event organizer or contributors can view this data. Provide the phone number used for the contribution.'
      });
    }

    const normalizePhone = (value = '') => value.replace(/\s+/g, '');
    const sanitizedPhone = normalizePhone(phoneFromQuery);

    const hasMatchingContribution = contributions.some(contribution => {
      if (!contribution.donorPhone) return false;
      return normalizePhone(contribution.donorPhone) === sanitizedPhone;
    });

    if (!hasMatchingContribution) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'No contributions found for the provided phone number on this event.'
      });
    }

    res.json(contributions);
  } catch (error) {
    logger.error('Failed to fetch contributions:', error);
    res.status(500).json({ error: 'Failed to fetch contributions' });
  }
};

// Create new contribution (all contributions are now pledges - promises to pay later)
const createContribution = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const event = await db.findEventById(eventId);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const {
      donorName,
      donorEmail,
      donorPhone,
      amount,
      isAnonymous = false,
      message,
      pledgeDate,
      status = 'pending'
    } = req.body;

    // All contributions are pledges now (isPledge: true for backward compatibility)
    const newContribution = {
      id: uuidv4(),
      eventId,
      donorName,
      donorEmail: donorEmail || '',
      donorPhone,
      amount,
      isAnonymous,
      isPledge: true, // All contributions are pledges
      message,
      pledgeDate: pledgeDate ? new Date(pledgeDate) : new Date(), // Default to today if not provided (YYYY-MM-DD format)
      status,
      createdAt: new Date()
    };

    const createdContribution = await db.addContribution(newContribution);

    // Don't update event's current amount - only update when pledge is fulfilled (paid)
    // Event amount will be updated when payment is processed

    res.status(201).json(createdContribution);
  } catch (error) {
    logger.error('Failed to create contribution:', error);
    res.status(500).json({ error: 'Failed to create contribution' });
  }
};

// Create new pledge (deprecated - now just calls createContribution)
// Kept for backward compatibility with existing API calls
const createPledge = async (req, res) => {
  // All contributions are pledges now, so just use createContribution
  return createContribution(req, res);
};

// Update contribution status
const updateContribution = async (req, res) => {
  try {
    const contributionId = req.params.id;
    const { status } = req.body;

    const contribution = await db.findContributionById(contributionId);
    if (!contribution) {
      return res.status(404).json({ error: 'Contribution not found' });
    }

    const oldStatus = contribution.status;
    const updatedContribution = await db.updateContribution(contributionId, { status });

    // All contributions are pledges now - event amount only updates when payment is processed
    // Status updates don't automatically update event amount
    // The payment processing endpoint handles event amount updates

    res.json(updatedContribution);
  } catch (error) {
    logger.error('Failed to update contribution:', error);
    res.status(500).json({ error: 'Failed to update contribution' });
  }
};

// Get specific contribution by ID
const getContributionById = async (req, res) => {
  try {
    const contributionId = req.params.id;
    const contribution = await db.findContributionById(contributionId);

    if (!contribution) {
      return res.status(404).json({ error: 'Contribution not found' });
    }

    // Get the associated event for additional context
    const event = await db.findEventById(contribution.eventId);
    
    // Compute current amount for the event
    let currentAmount = 0;
    if (event) {
      const currentAmounts = await computeEventCurrentAmounts([event.id]);
      currentAmount = currentAmounts.get(event.id) || 0;
    }
    
    res.json({
      ...contribution,
      event: event ? {
        id: event.id,
        title: event.title,
        organizerName: event.organizerName,
        goalAmount: event.goalAmount,
        currentAmount
      } : null
    });
  } catch (error) {
    logger.error('Failed to fetch contribution:', error);
    res.status(500).json({ error: 'Failed to fetch contribution' });
  }
};

// Get user's contributions by phone number
const getContributionsByUserPhone = async (req, res) => {
  try {
    const phone = req.params.phone;
    
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Normalize phone number (remove spaces)
    const normalizePhone = (value = '') => (value || '').replace(/\s+/g, '');
    const sanitizedPhone = normalizePhone(phone);

    const contributions = await db.findContributionsByPhone(sanitizedPhone);

    // Get unique event IDs to compute current amounts efficiently
    const eventIds = [...new Set(contributions.map(c => c.eventId))];
    const currentAmounts = await computeEventCurrentAmounts(eventIds);

    // Enrich contributions with event information
    const contributionsWithEvents = await Promise.all(
      contributions.map(async (contribution) => {
        const event = await db.findEventById(contribution.eventId);
        return {
          ...contribution,
          event: event ? {
            id: event.id,
            title: event.title,
            organizerName: event.organizerName,
            goalAmount: event.goalAmount,
            currentAmount: currentAmounts.get(event.id) || 0
          } : null
        };
      })
    );

    res.json({
      phone: sanitizedPhone,
      totalContributions: contributionsWithEvents.length,
      contributions: contributionsWithEvents
    });
  } catch (error) {
    logger.error('Failed to fetch contributions by phone:', error);
    res.status(500).json({ error: 'Failed to fetch contributions' });
  }
};

// Send reminder for unpaid contribution
const sendContributionReminder = async (req, res) => {
  try {
    const contributionId = req.params.id;
    const contribution = await db.findContributionById(contributionId);

    if (!contribution) {
      return res.status(404).json({ error: 'Contribution not found' });
    }

    // Check if contribution is already paid
    if (contribution.status === 'completed' || contribution.status === 'paid') {
      return res.status(400).json({
        error: 'Contribution already paid',
        message: 'This contribution has already been paid. No reminder needed.'
      });
    }

    // Get the associated event
    const event = await db.findEventById(contribution.eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user is the event organizer (authorization)
    const user = req.user || null;
    const userEmailNormalized = user?.email ? normalizeEmail(user.email) : null;
    const eventEmailNormalized = event.organizerEmail ? normalizeEmail(event.organizerEmail) : null;
    const isOrganizer = !!user && 
      ((userEmailNormalized && eventEmailNormalized && userEmailNormalized === eventEmailNormalized) ||
       (user.id && event.organizerId && user.id === event.organizerId));

    if (!isOrganizer) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only the event organizer can send reminders for contributions'
      });
    }

    // Send reminder email if donor email is available
    let emailSent = false;
    if (contribution.donorEmail) {
      const reminderLink = `${config.frontendUrl || 'http://localhost:5173'}/event/${event.id}`;
      emailSent = await emailService.sendContributionReminder(
        contribution.donorEmail,
        contribution.donorName,
        contribution.amount,
        event.title,
        reminderLink,
        contribution.pledgeDate
      );
    }

    logger.info(`Reminder sent for contribution ${contributionId} to ${contribution.donorPhone}${contribution.donorEmail ? ` (${contribution.donorEmail})` : ''}`);

    res.json({
      message: 'Reminder sent successfully',
      contributionId: contribution.id,
      donorPhone: contribution.donorPhone,
      donorEmail: contribution.donorEmail || null,
      emailSent,
      note: contribution.donorEmail 
        ? 'Reminder email sent to donor' 
        : 'No email address available. Please contact the donor directly.'
    });
  } catch (error) {
    logger.error('Failed to send reminder:', error);
    res.status(500).json({ error: 'Failed to send reminder' });
  }
};

module.exports = {
  verifyPhone,
  getContributionsByEventId,
  createContribution,
  createPledge,
  updateContribution,
  getContributionById,
  getContributionsByUserPhone,
  sendContributionReminder
};
