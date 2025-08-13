# Bupue Backend Deployment Guide

## Deploying to Render

### Prerequisites
- MongoDB database (MongoDB Atlas recommended)
- Email service credentials (Gmail, SendGrid, etc.)
- Render account

### Step 1: Prepare Your Repository

1. Ensure your repository is pushed to GitHub
2. Verify all files are committed:
   - `bupue-backend/package.json`
   - `bupue-backend/index.js`
   - `render.yaml` (in root directory)
   - `bupue-backend/Procfile`

### Step 2: Set Up MongoDB

1. Create a MongoDB Atlas account (free tier available)
2. Create a new cluster
3. Create a database user with read/write permissions
4. Get your connection string
5. Add your IP address to the whitelist (or use 0.0.0.0/0 for all IPs)

### Step 3: Deploy to Render

#### Option A: Using render.yaml (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" and select "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file
5. Configure the following environment variables in Render:

#### Required Environment Variables

```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bupue?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
CORS_ORIGIN=https://your-frontend-domain.com
```

#### Option B: Manual Deployment

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `bupue-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd bupue-backend && npm install`
   - **Start Command**: `cd bupue-backend && npm start`
   - **Plan**: Free

### Step 4: Environment Variables Setup

In your Render service dashboard, add these environment variables:

#### Required Variables:
- `NODE_ENV`: `production`
- `PORT`: `10000`
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A strong secret key for JWT tokens
- `EMAIL_USER`: Your email username
- `EMAIL_PASS`: Your email password/app password
- `EMAIL_FROM`: Your email address
- `CORS_ORIGIN`: Your frontend URL (e.g., `https://your-app.vercel.app`)

#### Optional Variables:
- `JWT_EXPIRES_IN`: `1d` (default)
- `EMAIL_HOST`: `smtp.gmail.com` (for Gmail)

### Step 5: Email Service Setup

#### For Gmail:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password as `EMAIL_PASS`

#### For SendGrid:
1. Create a SendGrid account
2. Create an API key
3. Use SendGrid SMTP settings

### Step 6: Test Your Deployment

1. Wait for the build to complete
2. Check the health endpoint: `https://your-app.onrender.com/api/health`
3. Test the API endpoints

### Step 7: Update Frontend

Update your frontend's API client to use the new backend URL:

```javascript
// In bupue-frontend/src/api/client.js
const API_URL = process.env.REACT_APP_API_URL || 'https://your-app.onrender.com';
```

## Health Check Endpoint

The backend includes a health check endpoint at `/api/health` that returns:

```json
{
  "status": "OK",
  "message": "Bupue Backend is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check that all dependencies are in `package.json`
2. **MongoDB Connection**: Verify your connection string and network access
3. **Environment Variables**: Ensure all required variables are set in Render
4. **CORS Issues**: Check that `CORS_ORIGIN` is set correctly

### Logs:
- Check Render logs in the service dashboard
- Monitor the health endpoint for service status

## Security Notes

1. **Never commit `.env` files** to version control
2. **Use strong JWT secrets** (32+ characters)
3. **Enable HTTPS** (automatic on Render)
4. **Set up proper CORS** origins
5. **Use environment variables** for all sensitive data

## Performance Optimization

1. **Enable caching** for static assets
2. **Use compression** middleware
3. **Implement rate limiting**
4. **Monitor database connections**

## Monitoring

- Use Render's built-in monitoring
- Set up health checks
- Monitor response times
- Track error rates

## Support

For issues with:
- **Render**: Check [Render Documentation](https://render.com/docs)
- **MongoDB**: Check [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- **Application**: Check the logs and health endpoint
