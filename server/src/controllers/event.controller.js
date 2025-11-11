const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const sheetsService = require('../services/sheets.service');
const logger = require('../utils/logger');

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

    // Calculate events stats for the user
    const eventsStats = await calculateEventsStats(user.email);

    res.json({
      events: userEvents,
      eventsStats: eventsStats
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

// Helper function to calculate events stats for a user
const calculateEventsStats = async (userEmail) => {
  try {
    // Get all events created by the user
    const allEvents = await db.getEvents();
    const userEvents = allEvents.filter(event => event.organizerEmail === userEmail);
    
    // Get all contributions
    const allContributions = await db.getContributions();
    
    // Get event IDs for user's events
    const userEventIds = userEvents.map(event => event.id);
    
    // Filter contributions that belong to user's events
    const userContributions = allContributions.filter(contribution => 
      userEventIds.includes(contribution.eventId)
    );
    
    // Calculate totalRaised (completed contributions for user's events)
    const totalRaised = userContributions
      .filter(c => c.status === 'completed')
      .reduce((sum, c) => sum + (c.amount || 0), 0);
    
    // Calculate activeEvents (events where goalAmount > currentAmount and status is 'active')
    const activeEvents = userEvents.filter(event => 
      event.status === 'active' && 
      (event.currentAmount || 0) < (event.goalAmount || 0)
    ).length;
    
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
    
    // Include contributions in the response
    res.json({
      ...event,
      contributions: contributions || []
    });
  } catch (error) {
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
      currentAmount: 0,
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
    res.status(201).json(createdEvent);
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
    res.json(updatedEvent);
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

    res.json(userEvents);
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

    res.json(events);
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
