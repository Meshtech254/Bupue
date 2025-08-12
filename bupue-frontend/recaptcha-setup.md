# reCAPTCHA Setup Guide

## 1. Get reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click "Create" to add a new site
3. Choose "reCAPTCHA v2" → "I'm not a robot" Checkbox
4. Add your domain(s):
   - For development: `localhost`, `127.0.0.1`
   - For production: Your actual domain
5. Accept terms and click "Submit"

## 2. Configure Frontend

Replace the test key in `Login.js` with your actual keys:

```javascript
// In src/components/auth/Login.js
<ReCAPTCHA
  ref={recaptchaRef}
  sitekey="YOUR_ACTUAL_SITE_KEY_HERE" // Replace this!
  onChange={handleCaptchaChange}
  onExpired={handleCaptchaExpired}
  theme="light"
  size="normal"
/>
```

## 3. Configure Backend

Add to your backend `.env` file:

```env
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

## 4. Backend Verification

In your login route, verify the captcha token:

```javascript
// Example backend verification
const verifyCaptcha = async (token) => {
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`
  });
  
  const data = await response.json();
  return data.success;
};
```

## 5. Test Keys (Development Only)

For development, you can use Google's test keys:
- Site Key: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
- Secret Key: `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`

⚠️ **Never use test keys in production!**

## 6. Security Notes

- Always verify captcha on the backend
- Store secret key securely in environment variables
- Consider rate limiting for login attempts
- Monitor for suspicious activity patterns
