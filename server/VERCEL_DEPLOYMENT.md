# Vercel Deployment Guide for FundRaiser Server

This guide will walk you through deploying your `FundRaiser/server` to Vercel using the CLI.

## 🚀 Automatic Deployment Process

**Good news!** This is a Node.js Express server (no build step needed). Vercel will automatically:
- ✅ Install dependencies (`npm install`)
- ✅ Deploy your server as serverless functions
- ✅ No build command needed - your code is ready to deploy!

Just configure the environment variables and deploy - Vercel handles the rest!

## Prerequisites

1. ✅ A Vercel account ([sign up here](https://vercel.com/signup) if needed)
2. ✅ Vercel CLI installed (`npm install -g vercel`)
3. ✅ Your `.env` file with all required environment variables (to copy values to Vercel)
4. ✅ Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket) - *Optional but recommended*

**Note**: Since this is plain JavaScript (not TypeScript), there's no build step required. Vercel will deploy your code directly!

## Required Environment Variables

Based on your server configuration, you'll need to set these environment variables in Vercel:

### Required Variables (Google Sheets):
- `GOOGLE_SHEETS_ID` - Your Google Spreadsheet ID (from the URL)
- `GOOGLE_CLIENT_EMAIL` - Your Google Service Account email
- `GOOGLE_PRIVATE_KEY` - Your Google Service Account private key (with `\n` for newlines)

### Optional Variables:
- `NODE_ENV` - Set to `production` for production deployments
- `PORT` - Vercel will set this automatically, no need to configure
- `CORS_ORIGIN` - CORS origin (default: `*`)
- `JWT_SECRET` - JWT secret key (for authentication)
- `JWT_EXPIRES_IN` - JWT expiration (default: `7d`)
- `EMAIL_SERVICE` - Email service provider (e.g., `gmail`)
- `EMAIL_USER` - Email address for sending emails
- `EMAIL_PASSWORD` - Email app password
- `FRONTEND_URL` - Frontend URL for email links
- `LOG_LEVEL` - Logging level (default: `INFO`)

## Step-by-Step Deployment via Vercel CLI

### 1. Install Vercel CLI (if not already installed)

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

- This will open your browser to authenticate
- Once logged in, you're ready to deploy

### 3. Navigate to Your Server Directory

```bash
cd FundRaiser/server
```

### 4. Set Environment Variables (Do this before deploying)

You'll need to add your environment variables from your `.env` file. Run these commands and paste the values when prompted:

**Required Google Sheets Variables:**
```bash
# Required variables - select "production" when prompted for environment
vercel env add GOOGLE_SHEETS_ID
vercel env add GOOGLE_CLIENT_EMAIL
vercel env add GOOGLE_PRIVATE_KEY
```

**Optional Variables (if you're using them):**
```bash
vercel env add NODE_ENV
vercel env add CORS_ORIGIN
vercel env add JWT_SECRET
vercel env add JWT_EXPIRES_IN
vercel env add EMAIL_SERVICE
vercel env add EMAIL_USER
vercel env add EMAIL_PASSWORD
vercel env add FRONTEND_URL
vercel env add LOG_LEVEL
```

**For each variable:**
- Paste the value from your `.env` file when prompted
- Select environment: Choose `production` (and optionally `preview` and `development`)
- Press Enter to confirm

**Important for GOOGLE_PRIVATE_KEY:**
- Paste the entire private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- You can paste it as-is (with actual newlines) or with `\n` escape sequences
- The code will handle both formats automatically (see `src/config/sheets.config.js`)

### 5. Deploy (Preview/Development)

```bash
vercel
```

- **No build needed!** Vercel will automatically:
  - Install dependencies (`npm install`)
  - Deploy your server as serverless functions
  - Create a preview URL

- Follow the interactive prompts:
  - Set up and deploy? → **Yes**
  - Which scope? → Select your account/team
  - Link to existing project? → **No** (for first deployment) or **Yes** (if redeploying)
  - Project name? → Press Enter for default (`fundraiser-server`) or enter a custom name
  - Directory? → Press Enter for current directory (`.`)
  - Override settings? → **No** (your `vercel.json` is already configured)

- After deployment, you'll get a preview URL like: `https://fundraiser-server-xxx.vercel.app`

### 6. Deploy to Production

```bash
vercel --prod
```

- This deploys to your production domain
- Vercel will automatically install dependencies and deploy - no manual steps needed!
- Your server will be live at: `https://your-project-name.vercel.app`

## Quick Reference - All Commands

```bash
# Install CLI (one-time)
npm install -g vercel

# Login (one-time)
vercel login

# Navigate to server directory
cd FundRaiser/server

# Add required environment variables (one-time setup)
vercel env add GOOGLE_SHEETS_ID
vercel env add GOOGLE_CLIENT_EMAIL
vercel env add GOOGLE_PRIVATE_KEY

# Add optional environment variables (if needed)
vercel env add NODE_ENV
vercel env add CORS_ORIGIN
vercel env add JWT_SECRET
# ... etc

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Post-Deployment Steps

### 1. Test Your Deployment

Test these endpoints to verify everything is working:

- **Health check**: `https://your-project.vercel.app/api/health`
- **Get events**: `https://your-project.vercel.app/api/events`
- **Get specific event**: `https://your-project.vercel.app/api/events/:id`

### 2. Update Frontend Configuration

Update your frontend to use the new Vercel URL:

```javascript
// In your frontend code
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-project-name.vercel.app/api'
  : 'http://localhost:3000/api';
```

### 3. Set Up Custom Domain (Optional)

- Go to your project settings in Vercel dashboard
- Navigate to "Domains"
- Add your custom domain

## Troubleshooting

### Deployment Fails

- **Error**: "Cannot find module"
  - Solution: Ensure `package.json` has all dependencies listed
  - Run `npm install` locally to verify all dependencies are correct

- **Error**: "Module not found" or import errors
  - Solution: Check that all your `require()` statements are correct
  - Verify file paths are relative to the project root

### Runtime Errors

- **Error**: "GOOGLE_SHEETS_ID environment variable is required"
  - Solution: Verify all Google Sheets environment variables are set in Vercel
  - Check that variables are set for the correct environment (production/preview)
  - Run `vercel env ls` to list all environment variables

- **Error**: "Invalid private key"
  - Solution: Ensure the private key includes the full key with headers
  - For Vercel, you can paste the key as-is (with actual newlines) or with `\n` escape sequences
  - Make sure there are no extra spaces or quotes
  - The code in `src/config/sheets.config.js` handles both formats with `.replace(/\\n/g, '\n')`

- **Error**: "Permission denied" when accessing Google Sheets
  - Solution: Verify the service account email has access to the spreadsheet
  - Check that Google Sheets API is enabled in Google Cloud Console
  - Ensure the service account has "Editor" permissions on the spreadsheet

### Function Timeout

- If your functions timeout, you can increase the timeout in `vercel.json`:
  ```json
  {
    "functions": {
      "index.js": {
        "maxDuration": 30
      }
    }
  }
  ```
- For longer operations, consider optimizing your code or using Vercel Pro plan

### Check Environment Variables

To verify your environment variables are set correctly:

```bash
# List all environment variables
vercel env ls

# Pull environment variables (for local testing)
vercel env pull .env.local
```

## Environment Variable Format Tips

### For GOOGLE_PRIVATE_KEY in Vercel:

**Option 1: Single line with \n**
```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n
```

**Option 2: Multi-line (Vercel supports this)**
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
-----END PRIVATE KEY-----
```

The code in `src/config/sheets.config.js` handles both formats with `.replace(/\\n/g, '\n')`.

## Project Structure for Vercel

Your `vercel.json` is already configured correctly:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.js"
    }
  ]
}
```

This configuration:
- Uses `index.js` as the entry point (which exports your Express app)
- Routes all requests to your Express app
- Deploys as serverless functions

## Continuous Deployment

Once connected to Git:
- Every push to `main`/`master` branch → Production deployment
- Every push to other branches → Preview deployment
- Pull requests → Preview deployment with unique URL

## Monitoring

- Check deployment logs in Vercel dashboard
- Use the `/api/health` endpoint to monitor server status
- Set up Vercel Analytics for performance monitoring
- Check function logs in Vercel dashboard for debugging

## Security Best Practices

1. ✅ Never commit `.env` files to Git
2. ✅ Use Vercel's environment variables (not hardcoded values)
3. ✅ Rotate service account keys periodically
4. ✅ Use different service accounts for dev/prod
5. ✅ Enable Vercel's security features (DDoS protection, etc.)
6. ✅ Set strong `JWT_SECRET` values in production
7. ✅ Use specific `CORS_ORIGIN` instead of `*` in production

## API Endpoints Reference

After deployment, your API will be available at:

- `GET /api/health` - Health check
- `GET /api/events` - Get all public events
- `GET /api/events/:id` - Get specific event
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `GET /api/events/:eventId/contributions` - Get contributions for event
- `POST /api/events/:eventId/contributions` - Create contribution
- `PUT /api/contributions/:id` - Update contribution status

## Next Steps

After successful deployment:
1. Test all API endpoints
2. Update your frontend to use the new Vercel URL
3. Set up monitoring and alerts
4. Configure custom domain (if needed)
5. Set up CI/CD for automated deployments
6. Review and optimize function performance

---

**Need Help?**
- Check Vercel documentation: https://vercel.com/docs
- Review your deployment logs in Vercel dashboard (shows output in real-time)
- Test locally first: `npm install && npm start` (optional, for debugging)
- Check Google Sheets setup: [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md)
- Review environment variables: [ENV_TEMPLATE.md](./ENV_TEMPLATE.md)
