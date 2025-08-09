# Bupue Platform - Complete Setup Instructions

## 🚀 Features Added

### ✅ Payment Integration
- **Stripe** for credit/debit card payments
- **M-Pesa** integration ready (placeholder for Daraja API)
- Payment webhooks for automatic order status updates
- Secure payment processing with error handling

### ✅ File Upload & Storage
- **Cloudinary** integration for image and file storage
- Support for images, PDFs, and videos
- Automatic image optimization and transformation
- File validation and size limits (10MB)

### ✅ Email System
- Email verification for new accounts
- Password reset functionality
- Order confirmation emails
- Support for SMTP and Gmail configurations

### ✅ Enhanced Admin Panel
- Dashboard with statistics and analytics
- User management (ban/unban, promote to admin)
- Content moderation (delete posts, items, courses)
- Order management and status updates
- System settings configuration

### ✅ Security Enhancements
- Email verification tokens
- Password reset tokens with expiration
- Enhanced user profiles
- Ban system for problematic users

## 📦 Installation Steps

### 1. Install Backend Dependencies
```bash
cd bupue-backend
npm install
```

### 2. Environment Configuration
Copy the example environment file and configure it:
```bash
cp environment.example .env
```

Edit `.env` file with your actual credentials:

#### Required Environment Variables:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/bupue

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Stripe (Get from https://stripe.com)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Cloudinary (Get from https://cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Gmail example)
EMAIL_PROVIDER=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-gmail-app-password
EMAIL_FROM=noreply@yourdomain.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup
Make sure MongoDB is running:
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI with your Atlas connection string
```

### 4. Stripe Configuration

#### Setup Stripe Account:
1. Create account at https://stripe.com
2. Get your API keys from the dashboard
3. Set up webhooks for payment processing

#### Webhook Configuration:
1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://yourdomain.com/api/payments/stripe-webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy webhook secret to your `.env` file

### 5. Cloudinary Setup
1. Create account at https://cloudinary.com
2. Get your cloud name, API key, and secret
3. Add to `.env` file

### 6. Email Setup

#### Option A: Gmail (Recommended for development)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate password for "Mail"
3. Use this app password in `EMAIL_APP_PASSWORD`

#### Option B: SMTP (Recommended for production)
Use any SMTP provider (SendGrid, Mailgun, etc.)

### 7. Start the Backend
```bash
cd bupue-backend
npm run dev
```

### 8. Install Frontend Dependencies
```bash
cd bupue-frontend
npm install
```

### 9. Frontend Environment
Create `.env` file in frontend:
```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
REACT_APP_API_URL=http://localhost:4000/api
```

### 10. Start the Frontend
```bash
cd bupue-frontend
npm start
```

## 🔧 API Endpoints Added

### Payment Endpoints
- `POST /api/payments/create-payment-intent` - Create Stripe payment
- `POST /api/payments/stripe-webhook` - Handle Stripe webhooks
- `POST /api/payments/mpesa-payment` - M-Pesa payment (placeholder)
- `GET /api/payments/status/:orderId` - Get payment status

### File Upload Endpoints
- `POST /api/upload/single` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files (max 5)
- `DELETE /api/upload/delete/:publicId` - Delete file
- `GET /api/upload/details/:publicId` - Get file details

### Email/Auth Endpoints
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Admin Endpoints
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - Get all users (with pagination)
- `PATCH /api/admin/users/:id/ban` - Ban/unban user
- `PATCH /api/admin/users/:id/admin` - Promote/demote admin
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/content` - Get all content (posts, items, courses)
- `DELETE /api/admin/content/:type/:id` - Delete content
- `GET /api/admin/settings` - Get system settings
- `PATCH /api/admin/settings` - Update system settings

## 🎯 Testing the Features

### Test Payment Integration
1. Use Stripe test card numbers:
   - Success: `4242 4242 4242 4242`
   - Declined: `4000 0000 0000 0002`
2. Create an order and proceed to payment
3. Check webhook logs in Stripe dashboard

### Test File Upload
1. Login to the platform
2. Try uploading images when creating items/courses
3. Check Cloudinary dashboard for uploaded files

### Test Email System
1. Register new account
2. Check email for verification link
3. Test forgot password functionality

### Test Admin Panel
1. Make a user admin by updating database:
   ```javascript
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { isAdmin: true } }
   )
   ```
2. Access admin endpoints with admin token

## 🚀 Deployment

### Backend Deployment (Heroku/DigitalOcean/etc.)
1. Set all environment variables in your hosting platform
2. Ensure MongoDB is accessible (Atlas recommended)
3. Configure Stripe webhooks for production domain

### Frontend Deployment (Netlify/Vercel)
1. Build the project: `npm run build`
2. Deploy the `build` folder
3. Configure environment variables in hosting platform

## 🔐 Security Notes

1. **Change JWT_SECRET** in production to a random 256-bit string
2. **Use HTTPS** for all production environments
3. **Secure your database** with proper authentication
4. **Validate Stripe webhooks** using the webhook secret
5. **Rate limit** your API endpoints (already implemented)
6. **Regular security updates** for all dependencies

## 📝 Next Steps for M-Pesa Integration

To complete M-Pesa integration:

1. Register for Safaricom Daraja API
2. Get credentials (Consumer Key, Consumer Secret, etc.)
3. Implement the M-Pesa API calls in `/api/payments/mpesa-payment`
4. Add M-Pesa webhook handler
5. Update frontend to support M-Pesa payments

## 🆘 Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string format

2. **Stripe Webhook Issues**
   - Verify webhook secret
   - Check endpoint URL
   - Review Stripe dashboard logs

3. **Email Not Sending**
   - Verify Gmail app password
   - Check spam folder
   - Ensure 2FA is enabled for Gmail

4. **File Upload Issues**
   - Verify Cloudinary credentials
   - Check file size limits
   - Ensure proper file types

## 📞 Support

If you need help with any specific integration or encounter issues, please provide:
1. Error messages/logs
2. Environment configuration (without sensitive data)
3. Steps to reproduce the issue

Your Bupue platform now has all the essential features for a complete marketplace and learning platform! 🎉
