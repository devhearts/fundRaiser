# Environment Variables Template
# Copy this content to a .env file and fill in your actual values

# Environment Configuration
NODE_ENV=development
PORT=3000

# Google Sheets Configuration (ONLY 3 VARIABLES NEEDED!)
# 1. Your Spreadsheet ID (from the URL)
GOOGLE_SHEETS_ID=your_spreadsheet_id_here

# 2. Your Service Account Email
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

# 3. Your Private Key (keep the quotes and \n characters)
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"

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
