const { sheetsConfig, initializeSheets } = require('../config/sheets.config');
const logger = require('../utils/logger');

class GoogleSheetsService {
  constructor() {
    this.sheets = null;
    this.spreadsheetId = sheetsConfig.spreadsheetId;
  }

  async initialize() {
    try {
      this.sheets = await initializeSheets();
      logger.info('Google Sheets service initialized');
    } catch (error) {
      logger.error('Failed to initialize Google Sheets service:', error.message);
      throw error;
    }
  }

  isInitialized() {
    return this.sheets !== null;
  }

  // Generic method to get all rows from a sheet
  async getAllRows(sheetName) {
    try {
      // Check if sheets service is initialized
      if (!this.sheets) {
        logger.error('Google Sheets service not initialized');
        throw new Error('Google Sheets service not initialized. Please ensure the service is properly set up.');
      }

      // Check if spreadsheet ID is set
      if (!this.spreadsheetId) {
        logger.error('Spreadsheet ID not configured');
        throw new Error('Spreadsheet ID not configured');
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:Z`
      });

      const rows = response.data.values || [];
      if (rows.length === 0) {
        logger.info(`No rows found in ${sheetName}`);
        return [];
      }

      // Skip header row
      const dataRows = rows.slice(1);
      const headers = rows[0];

      logger.info(`Retrieved ${dataRows.length} rows from ${sheetName}`);

      // Convert rows to objects
      return dataRows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          let value = row[index] || '';

          // Convert string values back to appropriate types
          if (header === 'goalAmount' || header === 'amount') {
            value = parseFloat(value) || 0;
          } else if (header === 'isPublic' || header === 'isAnonymous' || header === 'isPledge' ||
                     header === 'isVerified' || header === 'isActive' || header === 'isDefault') {
            value = value === 'TRUE' || value === 'true';
          } else if (header === 'deadline' || header === 'createdAt' || header === 'updatedAt' ||
                     header === 'lastLogin' || header === 'expiresAt' || header === 'pledgeDate' ||
                     header === 'fulfillmentDate' || header === 'sentAt' || header === 'readAt' ||
                     header === 'processedAt' || header === 'lastReminderDate' || header === 'deletedAt') {
            value = value ? new Date(value) : null;
          } else if (header === 'fulfilledContributions' || header === 'metadata') {
            // Parse JSON strings
            try {
              value = value ? JSON.parse(value) : [];
            } catch (e) {
              value = [];
            }
          }

          obj[header] = value;
        });
        return obj;
      });
    } catch (error) {
      logger.error(`Failed to get rows from ${sheetName}:`, error.message);
      throw error;
    }
  }

  // Generic method to add a row to a sheet
  async addRow(sheetName, data) {
    try {
      // Check if sheets service is initialized
      if (!this.sheets) {
        logger.error('Google Sheets service not initialized');
        throw new Error('Google Sheets service not initialized. Please ensure the service is properly set up.');
      }

      // Check if spreadsheet ID is set
      if (!this.spreadsheetId) {
        logger.error('Spreadsheet ID not configured');
        throw new Error('Spreadsheet ID not configured');
      }

      let headers;

      // Determine headers based on sheet name
      switch (sheetName) {
        case sheetsConfig.sheets.events:
          headers = sheetsConfig.eventsHeaders;
          break;
        case sheetsConfig.sheets.contributions:
          headers = sheetsConfig.contributionsHeaders;
          break;
        case sheetsConfig.sheets.users:
          headers = sheetsConfig.usersHeaders;
          break;
        case sheetsConfig.sheets.payments:
          headers = sheetsConfig.paymentsHeaders;
          break;
        case sheetsConfig.sheets.notifications:
          headers = sheetsConfig.notificationsHeaders;
          break;
        case sheetsConfig.sheets.loginLogs:
          headers = sheetsConfig.loginLogsHeaders;
          break;
        case sheetsConfig.sheets.eventUpdates:
          headers = sheetsConfig.eventUpdatesHeaders;
          break;
        case sheetsConfig.sheets.userSessions:
          headers = sheetsConfig.userSessionsHeaders;
          break;
        case sheetsConfig.sheets.paymentMethods:
          headers = sheetsConfig.paymentMethodsHeaders;
          break;
        default:
          logger.error(`Unknown sheet: ${sheetName}`);
          throw new Error(`Unknown sheet: ${sheetName}`);
      }

      // Convert object to array in the correct order
      const row = headers.map(header => {
        let value = data[header] || '';

        // Convert values to string format for Google Sheets
        if (typeof value === 'boolean') {
          value = value ? 'TRUE' : 'FALSE';
        } else if (value instanceof Date) {
          value = value.toISOString();
        } else if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
          // Stringify JSON objects/arrays
          value = JSON.stringify(value);
        } else if (value === null || value === undefined) {
          value = '';
        }

        return value;
      });

      // Calculate end column letter (handle beyond Z if needed)
      const getColumnLetter = (num) => {
        let letter = '';
        while (num > 0) {
          const remainder = (num - 1) % 26;
          letter = String.fromCharCode(65 + remainder) + letter;
          num = Math.floor((num - 1) / 26);
        }
        return letter;
      };

      const endColumn = getColumnLetter(headers.length);
      const range = `${sheetName}!A:${endColumn}`;

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: range,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [row]
        }
      });

      logger.info(`Successfully added row to ${sheetName}`);
      return data;
    } catch (error) {
      logger.error(`Failed to add row to ${sheetName}:`, error.message);
      throw error;
    }
  }

  // Generic method to update a row in a sheet
  async updateRow(sheetName, id, updates) {
    try {
      const rows = await this.getAllRows(sheetName);
      const rowIndex = rows.findIndex(row => row.id === id);

      if (rowIndex === -1) {
        throw new Error(`${sheetName.slice(0, -1)} not found`);
      }

      // Update the data
      const updatedData = { ...rows[rowIndex], ...updates };

      // Delete the old row and add the updated one
      await this.deleteRow(sheetName, id);
      await this.addRow(sheetName, updatedData);

      logger.info(`Updated row in ${sheetName}`);
      return updatedData;
    } catch (error) {
      logger.error(`Failed to update row in ${sheetName}:`, error.message);
      throw error;
    }
  }

  // Generic method to delete a row from a sheet
  async deleteRow(sheetName, id) {
    try {
      const rows = await this.getAllRows(sheetName);
      const rowIndex = rows.findIndex(row => row.id === id);

      if (rowIndex === -1) {
        throw new Error(`${sheetName.slice(0, -1)} not found`);
      }

      // Row number in sheet (accounting for header row)
      const sheetRowNumber = rowIndex + 2;

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: await this.getSheetId(sheetName),
                dimension: 'ROWS',
                startIndex: sheetRowNumber - 1,
                endIndex: sheetRowNumber
              }
            }
          }]
        }
      });

      logger.info(`Deleted row from ${sheetName}`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete row from ${sheetName}:`, error.message);
      throw error;
    }
  }

  // Helper method to get sheet ID
  async getSheetId(sheetName) {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId
      });

      const sheet = response.data.sheets.find(s => s.properties.title === sheetName);
      return sheet ? sheet.properties.sheetId : null;
    } catch (error) {
      logger.error(`Failed to get sheet ID for ${sheetName}:`, error.message);
      throw error;
    }
  }

  // Event-specific methods
  async getAllEvents() {
    return await this.getAllRows(sheetsConfig.sheets.events);
  }

  async getEventById(id) {
    const events = await this.getAllEvents();
    return events.find(event => event.id === id);
  }

  async createEvent(eventData) {
    return await this.addRow(sheetsConfig.sheets.events, eventData);
  }

  async updateEvent(id, updates) {
    return await this.updateRow(sheetsConfig.sheets.events, id, updates);
  }

  async deleteEvent(id) {
    return await this.deleteRow(sheetsConfig.sheets.events, id);
  }

  // Contribution-specific methods
  async getAllContributions() {
    return await this.getAllRows(sheetsConfig.sheets.contributions);
  }

  async getContributionById(id) {
    const contributions = await this.getAllContributions();
    return contributions.find(contribution => contribution.id === id);
  }

  async getContributionsByEventId(eventId) {
    const contributions = await this.getAllContributions();
    return contributions.filter(contribution => contribution.eventId === eventId);
  }

  async getContributionsByPhoneAndEvent(phone, eventId) {
    const contributions = await this.getContributionsByEventId(eventId);
    return contributions.filter(contribution => contribution.donorPhone === phone);
  }

  async getContributionsByPhone(phone) {
    const contributions = await this.getAllContributions();
    const normalizePhone = (value = '') => (value || '').replace(/\s+/g, '');
    const sanitizedPhone = normalizePhone(phone);
    return contributions.filter(contribution => {
      if (!contribution.donorPhone) return false;
      return normalizePhone(contribution.donorPhone) === sanitizedPhone;
    });
  }

  async createContribution(contributionData) {
    return await this.addRow(sheetsConfig.sheets.contributions, contributionData);
  }

  async updateContribution(id, updates) {
    return await this.updateRow(sheetsConfig.sheets.contributions, id, updates);
  }

  async deleteContribution(id) {
    return await this.deleteRow(sheetsConfig.sheets.contributions, id);
  }

  // User-specific methods
  async getAllUsers() {
    return await this.getAllRows(sheetsConfig.sheets.users);
  }

  async getUserById(id) {
    const users = await this.getAllUsers();
    logger.info(`[getUserById] Looking for user with ID: ${id} (type: ${typeof id}), Total users: ${users.length}`);
    
    if (users.length > 0) {
      const sampleIds = users.slice(0, 5).map(u => `${u.id} (type: ${typeof u.id})`);
      logger.info(`[getUserById] Sample user IDs: ${sampleIds.join(', ')}`);
    }
    
    // Try both strict and loose comparison (in case of type mismatch)
    const user = users.find(user => {
      const strictMatch = user.id === id;
      const looseMatch = String(user.id).trim() === String(id).trim();
      return strictMatch || looseMatch;
    });
    
    if (user) {
      logger.info(`[getUserById] Found user - id: ${user.id}, email: ${user.email}, name: ${user.name}`);
    } else {
      logger.warn(`[getUserById] User not found with ID: ${id}`);
    }
    
    return user;
  }

  async getUserByEmail(email) {
    const users = await this.getAllUsers();
    return users.find(user => user.email === email);
  }

  async getUserByPhone(phone) {
    const users = await this.getAllUsers();
    return users.find(user => user.phone === phone);
  }

  async createUser(userData) {
    return await this.addRow(sheetsConfig.sheets.users, userData);
  }

  async updateUser(id, updates) {
    return await this.updateRow(sheetsConfig.sheets.users, id, updates);
  }

  async deleteUser(id) {
    return await this.deleteRow(sheetsConfig.sheets.users, id);
  }

  // Login Logs methods
  async createLoginLog(logData) {
    return await this.addRow(sheetsConfig.sheets.loginLogs, logData);
  }

  async getLoginLogsByUserId(userId) {
    const logs = await this.getAllRows(sheetsConfig.sheets.loginLogs);
    return logs.filter(log => log.userId === userId);
  }

  // User Sessions methods
  async createUserSession(sessionData) {
    return await this.addRow(sheetsConfig.sheets.userSessions, sessionData);
  }

  async getUserSessionsByUserId(userId) {
    const sessions = await this.getAllRows(sheetsConfig.sheets.userSessions);
    return sessions.filter(session => session.userId === userId);
  }

  async updateUserSession(id, updates) {
    return await this.updateRow(sheetsConfig.sheets.userSessions, id, updates);
  }

  async deleteUserSession(id) {
    return await this.deleteRow(sheetsConfig.sheets.userSessions, id);
  }

  // Event Updates methods
  async getAllEventUpdates() {
    return await this.getAllRows(sheetsConfig.sheets.eventUpdates);
  }

  async getEventUpdateById(id) {
    const updates = await this.getAllEventUpdates();
    return updates.find(update => update.id === id);
  }

  async getEventUpdatesByEventId(eventId) {
    const updates = await this.getAllEventUpdates();
    return updates.filter(update => update.eventId === eventId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async createEventUpdate(updateData) {
    return await this.addRow(sheetsConfig.sheets.eventUpdates, updateData);
  }

  async updateEventUpdate(id, updates) {
    return await this.updateRow(sheetsConfig.sheets.eventUpdates, id, updates);
  }

  async deleteEventUpdate(id) {
    return await this.deleteRow(sheetsConfig.sheets.eventUpdates, id);
  }

  // Payment-specific methods
  async getAllPayments(includeDeleted = false) {
    const payments = await this.getAllRows(sheetsConfig.sheets.payments);
    if (includeDeleted) {
      return payments;
    }
    // Filter out soft-deleted payments
    return payments.filter(payment => !payment.deletedAt);
  }

  async getPaymentById(id, includeDeleted = false) {
    const payments = await this.getAllPayments(includeDeleted);
    return payments.find(payment => payment.id === id);
  }

  async getPaymentsByContributionId(contributionId, includeDeleted = false) {
    const payments = await this.getAllPayments(includeDeleted);
    return payments.filter(payment => payment.contributionId === contributionId);
  }

  async getPaymentsByPhoneAndEvent(phone, eventId, includeDeleted = false) {
    const payments = await this.getAllPayments(includeDeleted);
    // Get all contributions for this event to filter payments
    const contributions = await this.getContributionsByEventId(eventId);
    const contributionIds = new Set(contributions.map(c => c.id));

    // Filter payments by phone, status, and contributionId matching event
    return payments.filter(payment =>
      payment.payerPhone === phone &&
      contributionIds.has(payment.contributionId) &&
      payment.status === 'completed'
    );
  }

  async createPayment(paymentData) {
    return await this.addRow(sheetsConfig.sheets.payments, paymentData);
  }

  async updatePayment(id, updates) {
    return await this.updateRow(sheetsConfig.sheets.payments, id, updates);
  }

  // Soft delete payment - sets deletedAt timestamp instead of removing the row
  async deletePayment(id) {
    try {
      const payment = await this.getPaymentById(id, true); // Include deleted to check if exists
      if (!payment) {
        throw new Error('Payment not found');
      }

      // If already soft-deleted, return
      if (payment.deletedAt) {
        logger.info(`Payment ${id} is already deleted`);
        return payment;
      }

      // Soft delete by setting deletedAt timestamp
      return await this.updatePayment(id, {
        deletedAt: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`Failed to soft delete payment:`, error.message);
      throw error;
    }
  }
}

module.exports = new GoogleSheetsService();
