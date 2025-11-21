const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const sheetsService = require('../services/sheets.service');
const logger = require('../utils/logger');

/**
 * Compute currentAmount for events by summing completed payments
 * This function looks up payments in the Payments table and calculates
 * how much has been paid for each event by:
 * 1. Mapping contributions to their events
 * 2. Finding all completed payments
 * 3. Summing payment amounts from fulfilledContributions array
 * 
 * @param {string[]} eventIds - Optional array of event IDs to compute for. If empty, computes for all events.
 * @returns {Map<string, number>} Map of eventId -> currentAmount (sum of completed payments)
 */
const computeEventCurrentAmounts = async (eventIds = []) => {
  try {
    const eventIdSet = eventIds.length ? new Set(eventIds) : null;
    // Get all contributions and payments from database
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

    // Sum up all completed payments for each event
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

// Get all events for logged-in user
const getAllEvents = async (req, res) => {
  try {
    // Get the logged-in user's email
    const user = await sheetsService.getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get all events and filter by the logged-in user's email
    const events = await db.getEvents();
    const userEvents = events.filter(event => event.organizerEmail === user.email);
    const eventIds = userEvents.map(event => event.id);
    const currentAmounts = await computeEventCurrentAmounts(eventIds);

    const eventsWithTotals = userEvents.map(event => ({
      ...event,
      currentAmount: currentAmounts.get(event.id) || 0
    }));

    // Calculate events stats for the user
    const eventsStats = await calculateEventsStats(user.email, currentAmounts);

    res.json({
      events: eventsWithTotals,
      eventsStats: eventsStats
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

// Helper function to calculate events stats for a user
const calculateEventsStats = async (userEmail, precomputedCurrentAmounts = null) => {
  try {
    // Get all events created by the user
    const allEvents = await db.getEvents();
    const userEvents = allEvents.filter(event => event.organizerEmail === userEmail);
    
    // Get all contributions
    const allContributions = await db.getContributions();
    
    // Get event IDs for user's events
    const userEventIds = userEvents.map(event => event.id);
    const currentAmounts = precomputedCurrentAmounts || await computeEventCurrentAmounts(userEventIds);
    
    // Filter contributions that belong to user's events
    const userContributions = allContributions.filter(contribution => 
      userEventIds.includes(contribution.eventId)
    );
    
    // Calculate totalRaised based on completed payments
    const totalRaised = userEventIds.reduce((sum, eventId) => {
      return sum + (currentAmounts.get(eventId) || 0);
    }, 0);
    
    // Calculate activeEvents (events where goalAmount > currentAmount and status is 'active')
    const activeEvents = userEvents.filter(event => {
      const currentAmount = currentAmounts.get(event.id) || 0;
      return event.status === 'active' && currentAmount < (event.goalAmount || 0);
    }).length;
    
    // Calculate completedPledges (contributions with status='completed')
    const completedPledges = userContributions.filter(c => c.status === 'completed').length;
    
    // Calculate pendingPledges (contributions with status='pending')
    const pendingPledges = userContributions.filter(c => c.status === 'pending').length;
    
    return {
      totalRaised,
      activeEvents,
      completedPledges,
      pendingPledges
    };
  } catch (error) {
    logger.error('Failed to calculate events stats:', error.message);
    return {
      totalRaised: 0,
      activeEvents: 0,
      completedPledges: 0,
      pendingPledges: 0
    };
  }
};

// Get specific event by ID
const getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await db.findEventById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Fetch contributions for this event
    const contributions = await db.findContributionsByEventId(eventId);
    const currentAmounts = await computeEventCurrentAmounts([eventId]);
    const isAuthenticated = !!req.user;
    const response = {
      ...event,
      currentAmount: currentAmounts.get(eventId) || 0
    };

    if (isAuthenticated) {
      response.contributions = contributions || [];
    }

    res.json(response);
  } catch (error) {
    logger.error('Get event by ID error:', error.message);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

// Create new event
const createEvent = async (req, res) => {
  try {
    // Fetch the authenticated user's information
    const user = await sheetsService.getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const {
      title,
      description,
      goalAmount,
      coverImage,
      location,
      deadline,
      isPublic = true,
      status = 'active'
    } = req.body;

    // Check if user already has an event with the same title (case-insensitive)
    const existingEvents = await db.getEvents();
    const duplicateEvent = existingEvents.find(event =>
      event.organizerEmail === user.email &&
      event.title.toLowerCase() === title.toLowerCase()
    );

    if (duplicateEvent) {
      return res.status(409).json({
        error: 'Duplicate event',
        message: 'You already have an event with this title. Please choose a different title.'
      });
    }

    // Use the authenticated user's information for organizer details
    const newEvent = {
      id: uuidv4(),
      title,
      description,
      goalAmount,
      coverImage,
      location,
      deadline: deadline ? new Date(deadline) : null,
      isPublic,
      organizerName: user.name,
      organizerEmail: user.email,
      status,
      createdAt: new Date()
    };

    const createdEvent = await db.addEvent(newEvent);
    res.status(201).json({
      ...createdEvent,
      currentAmount: 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const updates = req.body;

    // Get the event to check ownership
    const event = await db.findEventById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get the logged-in user
    const user = await sheetsService.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is the organizer or an admin
    if (event.organizerEmail !== user.email && user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'Only the event organizer or an admin can update this event' 
      });
    }

    // Convert deadline string to Date if provided
    if (updates.deadline) {
      updates.deadline = new Date(updates.deadline);
    }

    const updatedEvent = await db.updateEvent(eventId, updates);
    const currentAmounts = await computeEventCurrentAmounts([eventId]);
    res.json({
      ...updatedEvent,
      currentAmount: currentAmounts.get(eventId) || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event' });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    // Get the event to check ownership
    const event = await db.findEventById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get the logged-in user
    const user = await sheetsService.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is the organizer or an admin
    if (event.organizerEmail !== user.email && user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'Only the event organizer or an admin can delete this event' 
      });
    }

    const deleted = await db.deleteEvent(eventId);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

// Get events by user (admin only)
const getEventsByUser = async (req, res) => {
  try {
    // Get the logged-in user
    const user = await sheetsService.getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is an admin
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'Only administrators can view events by user' 
      });
    }

    const { userId } = req.params;
    const events = await db.getEvents();

    // Filter events by organizerEmail (assuming userId is email)
    const userEvents = events.filter(event => event.organizerEmail === userId);
    const eventIds = userEvents.map(event => event.id);
    const currentAmounts = await computeEventCurrentAmounts(eventIds);
    const eventsWithTotals = userEvents.map(event => ({
      ...event,
      currentAmount: currentAmounts.get(event.id) || 0
    }));

    res.json(eventsWithTotals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user events' });
  }
};

// Search events with filters (authenticated users only)
const searchEvents = async (req, res) => {
  try {
    const { q, location, status } = req.query;

    // Get the logged-in user
    const user = await sheetsService.getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get all events
    let events = await db.getEvents();

    // Filter by user role
    if (user.role === 'admin') {
      // Admins can search through all events
      // Don't filter by organizer
    } else {
      // Organizers can only search their own events
      events = events.filter(event => event.organizerEmail === user.email);
    }

    // Apply search filters
    if (q) {
      const searchTerm = q.toLowerCase();
      events = events.filter(event =>
        event.title.toLowerCase().includes(searchTerm) ||
        event.description.toLowerCase().includes(searchTerm) ||
        event.organizerName.toLowerCase().includes(searchTerm)
      );
    }

    if (location) {
      const locationTerm = location.toLowerCase();
      events = events.filter(event =>
        event.location && event.location.toLowerCase().includes(locationTerm)
      );
    }

    if (status) {
      events = events.filter(event => event.status === status);
    }

    const eventIds = events.map(event => event.id);
    const currentAmounts = await computeEventCurrentAmounts(eventIds);
    const eventsWithTotals = events.map(event => ({
      ...event,
      currentAmount: currentAmounts.get(event.id) || 0
    }));

    res.json(eventsWithTotals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search events' });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByUser,
  searchEvents
};
