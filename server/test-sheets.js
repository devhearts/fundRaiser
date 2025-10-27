// Test Google Sheets connection
require('dotenv').config();

const { google } = require('googleapis');

async function testConnection() {
  try {
    console.log('🔍 Testing Google Sheets Connection...');
    console.log('GOOGLE_SHEETS_ID:', process.env.GOOGLE_SHEETS_ID ? '✅ Found' : '❌ Missing');
    console.log('GOOGLE_CLIENT_EMAIL:', process.env.GOOGLE_CLIENT_EMAIL ? '✅ Found' : '❌ Missing');
    console.log('GOOGLE_PRIVATE_KEY:', process.env.GOOGLE_PRIVATE_KEY ? '✅ Found' : '❌ Missing');

    // Initialize JWT authentication
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Test connection by getting spreadsheet info
    const response = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID
    });

    console.log('✅ Connection successful!');
    console.log('📊 Spreadsheet title:', response.data.properties.title);
    console.log('📋 Existing sheets:', response.data.sheets.map(s => s.properties.title));

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();
