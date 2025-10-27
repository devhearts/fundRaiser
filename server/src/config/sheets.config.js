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
    pledges: 'Pledges',
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
    'currentAmount',
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
    'amount',
    'isAnonymous',
    'isPledge',
    'message',
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
    'contributionId',
    'amount',
    'paymentMethod',
    'transactionId',
    'paymentProvider',
    'status',
    'processedAt',
    'failureReason',
    'createdAt'
  ],
  
  // Column headers for Pledges sheet
  pledgesHeaders: [
    'id',
    'contributionId',
    'pledgeAmount',
    'pledgeDate',
    'fulfillmentDate',
    'status',
    'reminderSent',
    'lastReminderDate',
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
    
    // Create Pledges sheet if it doesn't exist
    if (!existingSheets.includes(sheetsConfig.sheets.pledges)) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{
            addSheet: {
              properties: {
                title: sheetsConfig.sheets.pledges
              }
            }
          }]
        }
      });
      
      // Add headers to Pledges sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetsConfig.sheets.pledges}!A1`,
        valueInputOption: 'RAW',
        resource: {
          values: [sheetsConfig.pledgesHeaders]
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
  } catch (error) {
    console.error('❌ Failed to ensure sheets exist:', error.message);
    throw error;
  }
};

module.exports = {
  sheetsConfig,
  initializeSheets
};
