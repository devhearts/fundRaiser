// Database configuration and connection
// Using Google Sheets as the database

const sheetsService = require('../services/sheets.service');
const logger = require('../utils/logger');

// Database connection function
const connectDatabase = async () => {
  try {
    await sheetsService.initialize();
    logger.info('✅ Google Sheets database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Data access functions using Google Sheets
const getEvents = async () => {
  try {
    return await sheetsService.getAllEvents();
  } catch (error) {
    logger.error('Failed to get events:', error.message);
    return [];
  }
};

const getContributions = async () => {
  try {
    return await sheetsService.getAllContributions();
  } catch (error) {
    logger.error('Failed to get contributions:', error.message);
    return [];
  }
};

const getPayments = async (includeDeleted = false) => {
  try {
    return await sheetsService.getAllPayments(includeDeleted);
  } catch (error) {
    logger.error('Failed to get payments:', error.message);
    return [];
  }
};

const addEvent = async (event) => {
  try {
    return await sheetsService.createEvent(event);
  } catch (error) {
    logger.error('Failed to add event:', error.message);
    throw error;
  }
};

const addContribution = async (contribution) => {
  try {
    return await sheetsService.createContribution(contribution);
  } catch (error) {
    logger.error('Failed to add contribution:', error.message);
    throw error;
  }
};

const updateEvent = async (id, updates) => {
  try {
    return await sheetsService.updateEvent(id, updates);
  } catch (error) {
    logger.error('Failed to update event:', error.message);
    throw error;
  }
};

const updateContribution = async (id, updates) => {
  try {
    return await sheetsService.updateContribution(id, updates);
  } catch (error) {
    logger.error('Failed to update contribution:', error.message);
    throw error;
  }
};

const deleteEvent = async (id) => {
  try {
    // First delete all related contributions
    const contributions = await sheetsService.getContributionsByEventId(id);
    for (const contribution of contributions) {
      await sheetsService.deleteContribution(contribution.id);
    }
    
    // Then delete the event
    return await sheetsService.deleteEvent(id);
  } catch (error) {
    logger.error('Failed to delete event:', error.message);
    throw error;
  }
};

const findEventById = async (id) => {
  try {
    return await sheetsService.getEventById(id);
  } catch (error) {
    logger.error('Failed to find event by ID:', error.message);
    return null;
  }
};

const findContributionById = async (id) => {
  try {
    return await sheetsService.getContributionById(id);
  } catch (error) {
    logger.error('Failed to find contribution by ID:', error.message);
    return null;
  }
};

const findContributionsByEventId = async (eventId) => {
  try {
    return await sheetsService.getContributionsByEventId(eventId);
  } catch (error) {
    logger.error('Failed to find contributions by event ID:', error.message);
    return [];
  }
};

// Event Updates functions
const getEventUpdatesByEventId = async (eventId) => {
  try {
    return await sheetsService.getEventUpdatesByEventId(eventId);
  } catch (error) {
    logger.error('Failed to get event updates:', error.message);
    return [];
  }
};

const getEventUpdateById = async (id) => {
  try {
    return await sheetsService.getEventUpdateById(id);
  } catch (error) {
    logger.error('Failed to find event update by ID:', error.message);
    return null;
  }
};

const addEventUpdate = async (updateData) => {
  try {
    return await sheetsService.createEventUpdate(updateData);
  } catch (error) {
    logger.error('Failed to add event update:', error.message);
    throw error;
  }
};

const updateEventUpdate = async (id, updates) => {
  try {
    return await sheetsService.updateEventUpdate(id, updates);
  } catch (error) {
    logger.error('Failed to update event update:', error.message);
    throw error;
  }
};

const deleteEventUpdate = async (id) => {
  try {
    return await sheetsService.deleteEventUpdate(id);
  } catch (error) {
    logger.error('Failed to delete event update:', error.message);
    throw error;
  }
};

// Payment functions
const findPaymentById = async (id) => {
  try {
    return await sheetsService.getPaymentById(id);
  } catch (error) {
    logger.error('Failed to find payment by ID:', error.message);
    return null;
  }
};

const findPaymentsByContributionId = async (contributionId) => {
  try {
    return await sheetsService.getPaymentsByContributionId(contributionId);
  } catch (error) {
    logger.error('Failed to find payments by contribution ID:', error.message);
    return [];
  }
};

const findContributionsByPhoneAndEvent = async (phone, eventId) => {
  try {
    return await sheetsService.getContributionsByPhoneAndEvent(phone, eventId);
  } catch (error) {
    logger.error('Failed to find contributions by phone and event:', error.message);
    return [];
  }
};

const findContributionsByPhone = async (phone) => {
  try {
    return await sheetsService.getContributionsByPhone(phone);
  } catch (error) {
    logger.error('Failed to find contributions by phone:', error.message);
    return [];
  }
};

const findPaymentsByPhoneAndEvent = async (phone, eventId) => {
  try {
    return await sheetsService.getPaymentsByPhoneAndEvent(phone, eventId);
  } catch (error) {
    logger.error('Failed to find payments by phone and event:', error.message);
    return [];
  }
};

const addPayment = async (payment) => {
  try {
    return await sheetsService.createPayment(payment);
  } catch (error) {
    logger.error('Failed to add payment:', error.message);
    throw error;
  }
};

const updatePayment = async (id, updates) => {
  try {
    return await sheetsService.updatePayment(id, updates);
  } catch (error) {
    logger.error('Failed to update payment:', error.message);
    throw error;
  }
};

// Soft delete payment - sets deletedAt timestamp instead of removing the record
const deletePayment = async (id) => {
  try {
    return await sheetsService.deletePayment(id);
  } catch (error) {
    logger.error('Failed to delete payment:', error.message);
    throw error;
  }
};

module.exports = {
  connectDatabase,
  getEvents,
  getContributions,
  getPayments,
  addEvent,
  addContribution,
  updateEvent,
  updateContribution,
  deleteEvent,
  findEventById,
  findContributionById,
  findContributionsByEventId,
  findContributionsByPhoneAndEvent,
  findContributionsByPhone,
  getEventUpdatesByEventId,
  getEventUpdateById,
  addEventUpdate,
  updateEventUpdate,
  deleteEventUpdate,
  findPaymentById,
  findPaymentsByContributionId,
  findPaymentsByPhoneAndEvent,
  addPayment,
  updatePayment,
  deletePayment
};
