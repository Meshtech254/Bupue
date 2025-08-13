# Vercel Deployment Guide

## Environment Variables Required

To deploy successfully on Vercel, you need to set these environment variables in your Vercel project settings:

### 1. API URL Configuration
```
REACT_APP_API_URL=https://your-backend-domain.com
```

**Important**: Replace `https://your-backend-domain.com` with your actual backend URL where your Node.js/Express server is hosted.

### 2. Stripe Configuration (Optional)
```
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: Your backend URL (e.g., `https://your-backend.herokuapp.com`)
   - **Environment**: Production, Preview, Development
5. Click "Save"
6. Redeploy your project

## Backend Requirements

Your backend must be accessible from the internet and have CORS configured to allow requests from your Vercel domain.

## Common Issues

- **404 Errors**: Usually means `REACT_APP_API_URL` is not set or points to wrong URL
- **CORS Errors**: Backend needs to allow your Vercel domain
- **API Timeouts**: Check if backend is responding quickly enough

## Testing

After setting environment variables:
1. Redeploy your Vercel project
2. Test API calls in browser console
3. Check Network tab for failed requests
