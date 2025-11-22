# Vercel Deployment Guide for FundRaiser Client

This guide will walk you through deploying your FundRaiser client (frontend) to Vercel.

## 🚀 Automatic Build Process

**Good news!** Vercel will automatically:
- ✅ Install dependencies (`npm install`)
- ✅ Build your Vite React app (`npm run build`)
- ✅ Deploy the built application
- ✅ Handle SPA routing with rewrites

Just configure the environment variable and deploy - Vercel handles the rest!

## Prerequisites

1. ✅ A Vercel account ([sign up here](https://vercel.com/signup) if needed)
2. ✅ Vercel CLI installed (`npm install -g vercel`)
3. ✅ Your server already deployed (at `https://fund-raiser-server-inky.vercel.app`)
4. ✅ Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket) - *Optional but recommended*

**Note**: You don't need to build the project manually! Vercel will automatically run `npm run build` during deployment.

## Required Environment Variable

You need to set one environment variable in Vercel:

### Required Variable:
- `VITE_API_BASE_URL` - Your deployed server API URL

**Value for your setup:**
```
https://fund-raiser-server-inky.vercel.app/api
```

**Important Notes:**
- The URL must end with `/api` since your server routes are under `/api`
- Vite requires the `VITE_` prefix for environment variables to be exposed to the client
- This variable is used at build time, so you need to set it before deploying

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

### 3. Navigate to Your Project Root

```bash
cd FundRaiser
```

**Important**: Make sure you're in the `FundRaiser` root directory (not the `client` subdirectory), since that's where your `package.json` and `vite.config.ts` are located.

### 4. Set Environment Variable

Set the `VITE_API_BASE_URL` environment variable:

```bash
vercel env add VITE_API_BASE_URL
```

When prompted:
- **Value**: Enter `https://fund-raiser-server-inky.vercel.app/api`
- **Environment**: Select `production` (and optionally `preview` and `development`)

### 5. Deploy (Preview/Development)

```bash
vercel
```

- **No need to build manually!** Vercel will automatically:
  - Install dependencies (`npm install`)
  - Build your Vite app (`npm run build`)
  - Deploy to a preview URL

- Follow the interactive prompts:
  - Set up and deploy? → **Yes**
  - Which scope? → Select your account/team
  - Link to existing project? → **No** (for first deployment) or **Yes** (if redeploying)
  - Project name? → Press Enter for default (`fundraiser`) or enter a custom name
  - Directory? → Press Enter for current directory (`.`)
  - Override settings? → **No** (your `vercel.json` is already configured)

- After deployment, you'll get a preview URL like: `https://fundraiser-xxx.vercel.app`

### 6. Deploy to Production

```bash
vercel --prod
```

- This deploys to your production domain
- Vercel will automatically build and deploy - no manual steps needed!
- Your client will be live at: `https://your-project-name.vercel.app`

## Quick Reference - All Commands

```bash
# Install CLI (one-time)
npm install -g vercel

# Login (one-time)
vercel login

# Navigate to project root
cd FundRaiser

# Add environment variable (one-time setup)
vercel env add VITE_API_BASE_URL
# Enter: https://fund-raiser-server-inky.vercel.app/api

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Project Structure

Your project is set up as a monorepo with:
- **Root**: Contains `package.json`, `vite.config.ts`, `vercel.json`
- **Client**: Contains React app source code in `client/src/`
- **Build Output**: `dist/` directory (created by Vite)

Vercel will:
1. Run `npm install` in the root directory
2. Run `npm run build` (which builds the client)
3. Deploy the `dist/` folder

## Vercel Configuration

Your `vercel.json` is already configured:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This configuration:
- Detects Vite framework automatically
- Builds using `npm run build`
- Serves from `dist` directory
- Handles SPA routing (all routes → `index.html`)

## Post-Deployment Steps

### 1. Test Your Deployment

After deployment, test these:

- **Homepage**: `https://your-client.vercel.app/`
- **Event page**: `https://your-client.vercel.app/event/:id`
- **Check browser console** for any errors
- **Verify API calls** are going to your server

### 2. Update CORS on Server (If Needed)

If you get CORS errors, update your server's CORS settings to include your client domain:

```bash
cd server
vercel env add CORS_ORIGIN
# Enter: https://your-client-domain.vercel.app
# OR for multiple: https://your-client-domain.vercel.app,http://localhost:3000
vercel --prod
```

### 3. Set Up Custom Domain (Optional)

- Go to your project settings in Vercel dashboard
- Navigate to "Domains"
- Add your custom domain

## Troubleshooting

### Build Fails

- **Error**: "Cannot find module"
  - Solution: Ensure `package.json` has all dependencies listed
  - Run `npm install` locally to verify

- **Error**: TypeScript compilation errors
  - Solution: Fix TypeScript errors in your code
  - Run `npm run build` locally to verify it works
  - Vercel will show the same errors in the deployment logs

### Runtime Errors

- **Error**: API calls failing
  - Solution: Verify `VITE_API_BASE_URL` is set correctly in Vercel
  - Check that the variable is set for the correct environment (production/preview)
  - The URL should end with `/api`

- **Error**: CORS errors
  - Solution: Update server's `CORS_ORIGIN` to include your client domain
  - Check browser console for specific CORS error messages

- **Error**: Routes not working (404 on refresh)
  - Solution: The `vercel.json` rewrites should handle this
  - Verify the rewrites configuration is correct

### Environment Variable Not Working

- **Error**: API calls still going to `/api` instead of full URL
  - Solution: 
    - Make sure variable name starts with `VITE_` (required by Vite)
    - Restart/redeploy after adding environment variable
    - Check that variable is set for the correct environment
    - Environment variables are injected at **build time**, not runtime

### Check Environment Variables

To verify your environment variables are set correctly:

```bash
# List all environment variables
vercel env ls

# Pull environment variables (for local testing)
vercel env pull .env.local
```

## Environment Variable Setup

### Via CLI

```bash
vercel env add VITE_API_BASE_URL
# Enter: https://fund-raiser-server-inky.vercel.app/api
# Select: production, preview, development
```

### Via Dashboard

1. Go to your project in Vercel dashboard
2. Settings → Environment Variables
3. Add new variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://fund-raiser-server-inky.vercel.app/api`
   - **Environment**: Production, Preview, Development (select all)
4. Save and redeploy

## Continuous Deployment

Once connected to Git:
- Every push to `main`/`master` branch → Production deployment
- Every push to other branches → Preview deployment
- Pull requests → Preview deployment with unique URL

## Monitoring

- Check deployment logs in Vercel dashboard
- Use browser DevTools to monitor API calls
- Check Network tab for failed requests
- Review Vercel Analytics for performance monitoring

## Security Best Practices

1. ✅ Never commit `.env` files to Git
2. ✅ Use Vercel's environment variables (not hardcoded values)
3. ✅ Set specific `CORS_ORIGIN` on server (not `*`)
4. ✅ Use HTTPS for all API calls in production
5. ✅ Review and rotate API keys periodically

## Testing Checklist

- [ ] `VITE_API_BASE_URL` environment variable is set
- [ ] Build completes successfully
- [ ] Client loads without errors
- [ ] API calls are going to correct server URL
- [ ] No CORS errors in browser console
- [ ] Routes work correctly (no 404 on refresh)
- [ ] Authentication flows work
- [ ] Events load successfully

## Next Steps

After successful deployment:
1. Test all features end-to-end
2. Update any hardcoded URLs in documentation
3. Set up monitoring and alerts
4. Configure custom domain (if needed)
5. Set up CI/CD for automated deployments
6. Update server CORS to include client domain

## Your URLs

**Server**: `https://fund-raiser-server-inky.vercel.app`  
**Server API**: `https://fund-raiser-server-inky.vercel.app/api`  
**Client** (after deployment): `https://your-client-name.vercel.app`

---

**Need Help?**
- Check Vercel documentation: https://vercel.com/docs
- Review your deployment logs in Vercel dashboard (shows build output in real-time)
- Test locally first: `npm run build && npm run preview` (optional, for debugging)
- Check browser console for runtime errors

