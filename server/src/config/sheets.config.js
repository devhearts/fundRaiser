// Load environment variables first
require('dotenv').config();

const { google } = require('googleapis');
const config = require('./config');

// Google Sheets configuration
const sheetsConfig = {
  // Spreadsheet ID (found in the URL)
  spreadsheetId: process.env.GOOGLE_SHEETS_ID || '',

  // Sheet names for different data
  sheets: {
    events: 'Events',
    contributions: 'Contributions',
    users: 'Users',
    payments: 'Payments',
    notifications: 'Notifications',
    loginLogs: 'LoginLogs',
    eventUpdates: 'EventUpdates',
    userSessions: 'UserSessions',
    paymentMethods: 'PaymentMethods'
  },
  
  // Column headers for Events sheet
  eventsHeaders: [
    'id',
    'title', 
    'description',
    'goalAmount',
    'coverImage',
    'location',
    'deadline',
    'isPublic',
    'organizerName',
    'organizerEmail',
    'status',
    'createdAt'
  ],
  
  // Column headers for Contributions sheet
  contributionsHeaders: [
    'id',
    'eventId',
    'donorName',
    'donorEmail',
    'donorPhone',
    'amount',
    'isAnonymous',
    'isPledge',
    'message',
    'pledgeDate',
    'status',
    'createdAt'
  ],
  
  // Column headers for Users sheet
  usersHeaders: [
    'id',
    'name',
    'email',
    'password',
    'role',
    'profileImage',
    'phone',
    'address',
    'isVerified',
    'isActive',
    'lastLogin',
    'emailVerificationToken',
    'emailVerificationExpires',
    'passwordResetToken',
    'passwordResetExpires',
    'createdAt',
    'updatedAt'
  ],
  
  // Column headers for Payments sheet
  paymentsHeaders: [
    'id',
    'contributionId', // Required - can get eventId from contribution
    'amount',
    'paymentMethod',
    'paymentProvider',
    'payerName',
    'payerEmail',
    'payerPhone',
    'fulfilledContributions', // JSON array: [{contributionId, amount}]
    'transactionId',
    'status',
    'processedAt',
    'failureReason',
    'deletedAt',
    'createdAt'
  ],
  
  // Column headers for Notifications sheet
  notificationsHeaders: [
    'id',
    'userId',
    'eventId',
    'contributionId',
    'type',
    'category',
    'title',
    'message',
    'status',
    'sentAt',
    'readAt',
    'createdAt'
  ],
  
  // Column headers for Login Logs sheet
  loginLogsHeaders: [
    'id',
    'userId',
    'email',
    'ipAddress',
    'userAgent',
    'loginMethod',
    'status',
    'failureReason',
    'location',
    'createdAt'
  ],
  
  // Column headers for Event Updates sheet
  eventUpdatesHeaders: [
    'id',
    'eventId',
    'organizerId',
    'title',
    'content',
    'images',
    'isPublic',
    'createdAt'
  ],
  
  // Column headers for User Sessions sheet
  userSessionsHeaders: [
    'id',
    'userId',
    'sessionToken',
    'ipAddress',
    'userAgent',
    'expiresAt',
    'isActive',
    'createdAt'
  ],
  
  // Column headers for Payment Methods sheet
  paymentMethodsHeaders: [
    'id',
    'userId',
    'type',
    'provider',
    'accountNumber',
    'isDefault',
    'isVerified',
    'createdAt'
  ]
};

// Initialize Google Sheets API
const initializeSheets = async () => {
  try {
    // Simplified JWT Authentication (only needs email and private key)
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Test connection and create sheets if they don't exist
    await ensureSheetsExist(sheets);
    
    return sheets;
  } catch (error) {
    console.error('Failed to initialize Google Sheets:', error.message);
    throw error;
  }
};

// Ensure required sheets exist and have proper headers
const ensureSheetsExist = async (sheets) => {
  try {
    const spreadsheetId = sheetsConfig.spreadsheetId;
    
    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEETS_ID environment variable is required');
    }

    // Get spreadsheet info
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId
    });

    const existingSheets = spreadsheet.data.sheets.map(sheet => sheet.properties.title);
    
    // Create Events sheet if it doesn't exist
    if (!existingSheets.includes(sheetsConfig.sheets.events)) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{
            addSheet: {
              properties: {
                title: sheetsConfig.sheets.events
              }
            }
          }]
        }
      });
      
      // Add headers to Events sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetsConfig.sheets.events}!A1`,
        valueInputOption: 'RAW',
        resource: {
          values: [sheetsConfig.eventsHeaders]
        }
      });
    }
    
    // Create Contributions sheet if it doesn't exist
    if (!existingSheets.includes(sheetsConfig.sheets.contributions)) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{
            addSheet: {
              properties: {
                title: sheetsConfig.sheets.contributions
              }
            }
          }]
        }
      });
      
      // Add headers to Contributions sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetsConfig.sheets.contributions}!A1`,
        valueInputOption: 'RAW',
        resource: {
          values: [sheetsConfig.contributionsHeaders]
        }
      });
    }
    
    // Create Users sheet if it doesn't exist
    if (!existingSheets.includes(sheetsConfig.sheets.users)) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{
            addSheet: {
              properties: {
                title: sheetsConfig.sheets.users
              }
            }
          }]
        }
      });
      
      // Add headers to Users sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetsConfig.sheets.users}!A1`,
        valueInputOption: 'RAW',
        resource: {
          values: [sheetsConfig.usersHeaders]
        }
      });
    }
    
    // Create Payments sheet if it doesn't exist
    if (!existingSheets.includes(sheetsConfig.sheets.payments)) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{
            addSheet: {
              properties: {
                title: sheetsConfig.sheets.payments
              }
            }
          }]
        }
      });
      
      // Add headers to Payments sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetsConfig.sheets.payments}!A1`,
        valueInputOption: 'RAW',
        resource: {
          values: [sheetsConfig.paymentsHeaders]
        }
      });
    }
    
    // Create Notifications sheet if it doesn't exist
    if (!existingSheets.includes(sheetsConfig.sheets.notifications)) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{
            addSheet: {
              properties: {
                title: sheetsConfig.sheets.notifications
              }
            }
          }]
        }
      });
      
      // Add headers to Notifications sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetsConfig.sheets.notifications}!A1`,
        valueInputOption: 'RAW',
        resource: {
          values: [sheetsConfig.notificationsHeaders]
        }
      });
    }
    
    // Create Login Logs sheet if it doesn't exist
    if (!existingSheets.includes(sheetsConfig.sheets.loginLogs)) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{
            addSheet: {
              properties: {
                title: sheetsConfig.sheets.loginLogs
              }
            }
          }]
        }
      });
      
      // Add headers to Login Logs sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetsConfig.sheets.loginLogs}!A1`,
        valueInputOption: 'RAW',
        resource: {
          values: [sheetsConfig.loginLogsHeaders]
        }
      });
    }
    
    // Create Event Updates sheet if it doesn't exist
    if (!existingSheets.includes(sheetsConfig.sheets.eventUpdates)) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{
            addSheet: {
              properties: {
                title: sheetsConfig.sheets.eventUpdates
              }
            }
          }]
        }
      });
      
      // Add headers to Event Updates sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetsConfig.sheets.eventUpdates}!A1`,
        valueInputOption: 'RAW',
        resource: {
          values: [sheetsConfig.eventUpdatesHeaders]
        }
      });
    }
    
    // Create User Sessions sheet if it doesn't exist
    if (!existingSheets.includes(sheetsConfig.sheets.userSessions)) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{
            addSheet: {
              properties: {
                title: sheetsConfig.sheets.userSessions
              }
            }
          }]
        }
      });
      
      // Add headers to User Sessions sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetsConfig.sheets.userSessions}!A1`,
        valueInputOption: 'RAW',
        resource: {
          values: [sheetsConfig.userSessionsHeaders]
        }
      });
    }
    
    // Create Payment Methods sheet if it doesn't exist
    if (!existingSheets.includes(sheetsConfig.sheets.paymentMethods)) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{
            addSheet: {
              properties: {
                title: sheetsConfig.sheets.paymentMethods
              }
            }
          }]
        }
      });
      
      // Add headers to Payment Methods sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetsConfig.sheets.paymentMethods}!A1`,
        valueInputOption: 'RAW',
        resource: {
          values: [sheetsConfig.paymentMethodsHeaders]
        }
      });
    }
    
    console.log('✅ Google Sheets initialized successfully');
    
    // Update existing sheets with new headers if needed
    await updateSheetHeaders(sheets);
  } catch (error) {
    console.error('❌ Failed to ensure sheets exist:', error.message);
    throw error;
  }
};

// Helper function to update sheet headers and reorganize data
const updateSheetHeadersForSheet = async (sheets, sheetName, expectedHeaders) => {
  try {
    const spreadsheetId = sheetsConfig.spreadsheetId;
    
    // Get current headers and all data from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
    });
    
    const allRows = response.data.values || [];
    if (allRows.length === 0) {
      // Sheet is empty, just update headers
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        resource: {
          values: [expectedHeaders]
        }
      });
      return;
    }
    
    const currentHeaders = allRows[0] || [];
    
    // Check if headers need updating
    if (currentHeaders.length !== expectedHeaders.length || 
        !expectedHeaders.every((header, index) => currentHeaders[index] === header)) {
      console.log(`📝 Updating ${sheetName} sheet headers and reorganizing data...`);
      
      // Create a map of old header positions
      const headerMap = new Map();
      currentHeaders.forEach((header, index) => {
        headerMap.set(header, index);
      });
      
      // Reorganize data rows to match new header order
      const reorganizedRows = [];
      
      // Add new header row
      reorganizedRows.push(expectedHeaders);
      
      // Process each data row (skip header row)
      for (let i = 1; i < allRows.length; i++) {
        const oldRow = allRows[i];
        const newRow = [];
        
        // For each expected header, get the value from the old row position
        expectedHeaders.forEach((header) => {
          const oldIndex = headerMap.get(header);
          // If header existed in old sheet, use its value; otherwise use empty string
          newRow.push(oldIndex !== undefined && oldIndex < oldRow.length ? oldRow[oldIndex] : '');
        });
        
        reorganizedRows.push(newRow);
      }
      
      // Clear the entire sheet and write new data
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: `${sheetName}!A:Z`,
      });
      
      // Write all rows (headers + data) back
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        resource: {
          values: reorganizedRows
        }
      });
      
      console.log(`✅ ${sheetName} sheet updated: ${reorganizedRows.length - 1} rows reorganized with new headers`);
    }
  } catch (error) {
    // Don't fail initialization if header update fails (sheet might not exist yet)
    console.warn(`⚠️  Could not update ${sheetName} sheet headers:`, error.message);
  }
};

// Update existing sheet headers to match current configuration
const updateSheetHeaders = async (sheets) => {
  try {
    // Update Events sheet (fix column alignment)
    await updateSheetHeadersForSheet(sheets, sheetsConfig.sheets.events, sheetsConfig.eventsHeaders);
    
    // Update Contributions sheet
    await updateSheetHeadersForSheet(sheets, sheetsConfig.sheets.contributions, sheetsConfig.contributionsHeaders);
    
    // Update Payments sheet
    await updateSheetHeadersForSheet(sheets, sheetsConfig.sheets.payments, sheetsConfig.paymentsHeaders);
  } catch (error) {
    // Don't fail initialization if header update fails
    console.warn('⚠️  Could not update sheet headers:', error.message);
  }
};

module.exports = {
  sheetsConfig,
  initializeSheets
};
