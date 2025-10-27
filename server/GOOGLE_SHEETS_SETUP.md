# Google Sheets Database Setup Guide

This guide will help you set up Google Sheets as your database for the FundRaiser application.

## 📋 **Prerequisites**

1. Google Cloud Platform account
2. Google Sheets API enabled
3. Service Account created with proper permissions

## 🔧 **Step 1: Create Google Cloud Project**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your **Project ID**

## 🔑 **Step 2: Enable Google Sheets API**

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Sheets API"
3. Click on it and press **Enable**

## 👤 **Step 3: Create Service Account**

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **Service Account**
3. Fill in the details:
   - **Name**: `fundraiser-sheets-service`
   - **Description**: `Service account for FundRaiser Google Sheets integration`
4. Click **Create and Continue**
5. Skip the optional steps and click **Done**

## 🔐 **Step 4: Generate Service Account Key**

1. In the **Credentials** page, find your service account
2. Click on the service account email
3. Go to the **Keys** tab
4. Click **Add Key** > **Create new key**
5. Choose **JSON** format
6. Download the JSON file

## 📊 **Step 5: Create Google Spreadsheet**

1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new spreadsheet
3. Name it "FundRaiser Database" (or any name you prefer)
4. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
   ```

## 🔗 **Step 6: Share Spreadsheet with Service Account**

1. In your Google Spreadsheet, click **Share**
2. Add the service account email (from the JSON file) as an editor
3. The email looks like: `fundraiser-sheets-service@your-project.iam.gserviceaccount.com`

## ⚙️ **Step 7: Configure Environment Variables**

Create a `.env` file in your server directory with the following variables:

```bash
# Environment Configuration
NODE_ENV=development
PORT=3000

# Google Sheets Configuration
GOOGLE_SHEETS_ID=your_spreadsheet_id_here
GOOGLE_PROJECT_ID=your_project_id_here
GOOGLE_PRIVATE_KEY_ID=your_private_key_id_here
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=your_service_account_email_here
GOOGLE_CLIENT_ID=your_client_id_here

# CORS Configuration
CORS_ORIGIN=*

# JWT Configuration (for future authentication)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Email Configuration (for future notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Logging
LOG_LEVEL=INFO
```

## 📝 **Step 8: Extract Values from JSON**

From your downloaded service account JSON file, extract these values:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",           // → GOOGLE_PROJECT_ID
  "private_key_id": "your-private-key-id",   // → GOOGLE_PRIVATE_KEY_ID
  "private_key": "-----BEGIN PRIVATE KEY-----\n...", // → GOOGLE_PRIVATE_KEY
  "client_email": "service@project.iam.gserviceaccount.com", // → GOOGLE_CLIENT_EMAIL
  "client_id": "your-client-id",            // → GOOGLE_CLIENT_ID
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

## 🚀 **Step 9: Test the Setup**

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm run dev
   ```

3. The server will automatically:
   - Connect to Google Sheets
   - Create "Events" and "Contributions" sheets if they don't exist
   - Add proper headers to each sheet

## 📊 **Step 10: Verify Sheets Creation**

Check your Google Spreadsheet - you should see two new sheets:
- **Events** - with headers for event data
- **Contributions** - with headers for contribution data

## 🔒 **Security Notes**

1. **Never commit** your `.env` file to version control
2. **Keep your service account JSON** file secure
3. **Use environment variables** in production (Vercel, etc.)
4. **Limit service account permissions** to only what's needed

## 🚨 **Troubleshooting**

### Common Issues:

1. **"Permission denied"**
   - Ensure the service account email has editor access to the spreadsheet

2. **"Spreadsheet not found"**
   - Check that the `GOOGLE_SHEETS_ID` is correct
   - Ensure the spreadsheet exists and is accessible

3. **"Invalid credentials"**
   - Verify all environment variables are set correctly
   - Check that the private key includes `\n` characters

4. **"API not enabled"**
   - Ensure Google Sheets API is enabled in your Google Cloud project

## 📚 **API Usage**

Once set up, your API will automatically use Google Sheets as the database:

- **Events** are stored in the "Events" sheet
- **Contributions** are stored in the "Contributions" sheet
- **All CRUD operations** work seamlessly with Google Sheets
- **Data is persistent** and accessible from Google Sheets interface

## 🔄 **Production Deployment**

For Vercel deployment, add all environment variables in your Vercel dashboard:

1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add all the Google Sheets configuration variables
4. Deploy your application

The Google Sheets integration will work seamlessly in production!
