const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const config = require('../config/config');
const logger = require('../utils/logger');

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

module.exports = {
  verifyPhone,
  getContributionsByEventId,
  createContribution,
  createPledge,
  updateContribution
};
