const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

// Get event updates for an event
const getEventUpdates = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await db.findEventById(eventId);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const updates = await db.getEventUpdatesByEventId(eventId);
    res.json(updates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event updates' });
  }
};

// Create new event update (organizer only)
const createEventUpdate = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await db.findEventById(eventId);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // TODO: Add authorization check to ensure only the event organizer can create updates
    // if (req.user.email !== event.organizerEmail) {
    //   return res.status(403).json({ error: 'Unauthorized' });
    // }

    const {
      title,
      content,
      images,
      isPublic = true
    } = req.body;

    const eventUpdate = {
      id: uuidv4(),
      eventId,
      organizerId: event.organizerEmail,
      title,
      content,
      images,
      isPublic,
      createdAt: new Date()
    };

    const createdUpdate = await db.addEventUpdate(eventUpdate);
    res.status(201).json(createdUpdate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event update' });
  }
};

// Update event update (organizer only)
const updateEventUpdate = async (req, res) => {
  try {
    const eventId = req.params.id;
    const updateId = req.params.updateId;
    
    const eventUpdate = await db.getEventUpdateById(updateId);
    if (!eventUpdate) {
      return res.status(404).json({ error: 'Event update not found' });
    }

    if (eventUpdate.eventId !== eventId) {
      return res.status(404).json({ error: 'Event update not found for this event' });
    }

    // TODO: Add authorization check
    // const event = await db.findEventById(eventId);
    // if (req.user.email !== event.organizerEmail) {
    //   return res.status(403).json({ error: 'Unauthorized' });
    // }

    const updates = req.body;
    const updatedEventUpdate = await db.updateEventUpdate(updateId, updates);
    
    res.json(updatedEventUpdate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event update' });
  }
};

// Delete event update (organizer only)
const deleteEventUpdate = async (req, res) => {
  try {
    const eventId = req.params.id;
    const updateId = req.params.updateId;
    
    const eventUpdate = await db.getEventUpdateById(updateId);
    if (!eventUpdate) {
      return res.status(404).json({ error: 'Event update not found' });
    }

    if (eventUpdate.eventId !== eventId) {
      return res.status(404).json({ error: 'Event update not found for this event' });
    }

    // TODO: Add authorization check
    // const event = await db.findEventById(eventId);
    // if (req.user.email !== event.organizerEmail) {
    //   return res.status(403).json({ error: 'Unauthorized' });
    // }

    await db.deleteEventUpdate(updateId);
    res.json({ message: 'Event update deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event update' });
  }
};

module.exports = {
  getEventUpdates,
  createEventUpdate,
  updateEventUpdate,
  deleteEventUpdate
};
