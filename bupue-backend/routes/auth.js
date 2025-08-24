const router = require('express').Router();

const jwt = require('jsonwebtoken');

const crypto = require('crypto');

const User = require('../models/User');

const auth = require('../middleware/auth');

const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

const https = require('https');
const { URL, URLSearchParams } = require('url');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';



// Register

router.post('/register', async (req, res) => {

  try {

    console.log('Registration attempt with data:', { ...req.body, password: '[REDACTED]' });

    

    const { username, email, password } = req.body;



    // Validate required fields

    if (!username || !email || !password) {

      console.log('Missing required fields:', { username: !!username, email: !!email, password: !!password });

      return res.status(400).json({ 

        message: 'Missing required fields',

        details: {

          username: !username ? 'Username is required' : null,

          email: !email ? 'Email is required' : null,

          password: !password ? 'Password is required' : null

        }

      });

    }



    // Check if user already exists

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {

      console.log('User already exists:', { email, username });

      return res.status(400).json({ message: 'User already exists' });

    }



    // Create new user

    const user = new User({

      username,

      email,

      password

    });



    console.log('Attempting to save new user:', { username, email });

    

    // Generate email verification token

    const verificationToken = user.generateEmailVerificationToken();

    await user.save();

    console.log('User saved successfully');



    // Send verification email

    try {

      await sendVerificationEmail(email, verificationToken, username);

      console.log('Verification email sent successfully');

    } catch (emailError) {

      console.error('Failed to send verification email:', emailError);

      // Continue with registration even if email fails

    }



    // Create token

    const token = jwt.sign(

      { id: user._id },

      process.env.JWT_SECRET,

      { expiresIn: '1d' }

    );



    res.status(201).json({

      token,

      user: {

        id: user._id,

        username: user.username,

        email: user.email,

        isEmailVerified: user.isEmailVerified,

        isAdmin: user.isAdmin

      },

      message: 'Registration successful. Please check your email to verify your account.'

    });

  } catch (err) {

    console.error('Registration error details:', {

      name: err.name,

      message: err.message,

      stack: err.stack,

      code: err.code

    });

    

    // Handle specific MongoDB errors

    if (err.code === 11000) {

      return res.status(400).json({ 

        message: 'Username or email already exists',

        field: Object.keys(err.keyPattern)[0]

      });

    }

    

    res.status(500).json({ 

      message: 'Server error during registration',

      error: process.env.NODE_ENV === 'development' ? err.message : undefined

    });

  }

});

// ======= OAuth helpers =======
function postForm(urlString, bodyObj) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const postData = new URLSearchParams(bodyObj).toString();

    const options = {
      method: 'POST',
      hostname: url.hostname,
      path: url.pathname + (url.search || ''),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(json);
          else reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        } catch (e) { reject(e); }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function getJson(urlString, accessToken) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const options = {
      method: 'GET',
      hostname: url.hostname,
      path: url.pathname + (url.search || ''),
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(json);
          else reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        } catch (e) { reject(e); }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function findOrCreateOAuthUser(email, displayName) {
  let user = await User.findOne({ email });
  if (!user) {
    const base = (displayName || email.split('@')[0] || 'user')
      .toLowerCase().replace(/[^a-z0-9_]+/g, '');
    let username = base || `user${Math.floor(Math.random() * 10000)}`;
    if (await User.findOne({ username })) {
      username = `${base}${Math.floor(Math.random() * 10000)}`;
    }

    user = new User({
      username,
      email,
      password: require('crypto').randomBytes(16).toString('hex'),
      isEmailVerified: true
    });
    await user.save();
  }
  return user;
}

function redirectWithToken(res, token, nextParam) {
  const next = nextParam || '/dashboard';
  const to = `${FRONTEND_URL}/oauth/callback?token=${encodeURIComponent(token)}&next=${encodeURIComponent(next)}`;
  return res.redirect(to);
}



// Login

router.post('/login', async (req, res) => {

  try {

    console.log('Login attempt with data:', { email: req.body.email });

    

    const { email, password } = req.body;



    // Validate required fields

    if (!email || !password) {

      return res.status(400).json({ 

        message: 'Missing credentials',

        details: {

          email: !email ? 'Email is required' : null,

          password: !password ? 'Password is required' : null

        }

      });

    }



    // Check if user exists

    const user = await User.findOne({ email }).select('+password');

    console.log('User lookup result:', user ? 'User found' : 'User not found');



    if (!user) {

      return res.status(400).json({ message: 'Invalid credentials' });

    }



    // Debug: Log user details (excluding password)

    console.log('User details:', {

      id: user._id,

      email: user.email,

      username: user.username,

      hasPassword: !!user.password

    });



    // Check password

    try {

      const isMatch = await user.comparePassword(password);

      console.log('Password comparison result:', isMatch);



      if (!isMatch) {

        return res.status(400).json({ message: 'Invalid credentials' });

      }

    } catch (compareError) {

      console.error('Password comparison error:', compareError);

      return res.status(500).json({ message: 'Error verifying password' });

    }



    // Verify JWT_SECRET is set

    if (!process.env.JWT_SECRET) {

      console.error('JWT_SECRET is not set in environment variables');

      return res.status(500).json({ message: 'Server configuration error' });

    }



    // Create token

    try {

      const token = jwt.sign(

        { id: user._id },

        process.env.JWT_SECRET,

        { expiresIn: '1d' }

      );



      console.log('Login successful for user:', user.email);

      

      res.json({

        token,

        user: {

          id: user._id,

          username: user.username,

            email: user.email,

          isAdmin: user.isAdmin

        }

      });

    } catch (tokenError) {

      console.error('Token generation error:', tokenError);

      return res.status(500).json({ message: 'Error generating authentication token' });

    }

  } catch (err) {

    console.error('Login error:', {

      name: err.name,

      message: err.message,

      stack: err.stack

    });

    

    res.status(500).json({ 

      message: 'Server error during login',

      error: process.env.NODE_ENV === 'development' ? err.message : undefined

    });

  }

});



// Get user data

router.get('/me', auth, async (req, res) => {

  try {

    const user = await User.findById(req.user.id).select('-password');

    if (!user) {

      return res.status(404).json({ message: 'User not found' });

    }

    res.json(user);

  } catch (err) {

    console.error('Get user error:', err);

    res.status(500).json({ message: 'Server error while fetching user data' });

  }

});



// Edit user profile (auth required)

router.put('/profile', auth, async (req, res) => {

  try {

    const updates = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {

      return res.status(404).json({ message: 'User not found' });

    }

    

    // Handle basic user fields

    if (updates.username) user.username = updates.username;

    if (updates.email) user.email = updates.email;

    

    // Handle profile fields

    if (updates.profile) {

      if (!user.profile) user.profile = {};

      

      // Basic profile fields

      if (updates.profile.firstName !== undefined) user.profile.firstName = updates.profile.firstName;

      if (updates.profile.lastName !== undefined) user.profile.lastName = updates.profile.lastName;

      if (updates.profile.displayName !== undefined) user.profile.displayName = updates.profile.displayName;

      if (updates.profile.bio !== undefined) user.profile.bio = updates.profile.bio;

      if (updates.profile.avatar !== undefined) user.profile.avatar = updates.profile.avatar;

      if (updates.profile.coverBanner !== undefined) user.profile.coverBanner = updates.profile.coverBanner;

      if (updates.profile.phone !== undefined) user.profile.phone = updates.profile.phone;

      if (updates.profile.dateOfBirth !== undefined) user.profile.dateOfBirth = updates.profile.dateOfBirth;

      if (updates.profile.location !== undefined) user.profile.location = updates.profile.location;

      if (updates.profile.website !== undefined) user.profile.website = updates.profile.website;

      if (updates.profile.category !== undefined) user.profile.category = updates.profile.category;

      if (updates.profile.skills !== undefined) user.profile.skills = updates.profile.skills;

      if (updates.profile.availability !== undefined) user.profile.availability = updates.profile.availability;

      if (updates.profile.openForCollaborations !== undefined) user.profile.openForCollaborations = updates.profile.openForCollaborations;

      if (updates.profile.openForMentorship !== undefined) user.profile.openForMentorship = updates.profile.openForMentorship;

      if (updates.profile.timezone !== undefined) user.profile.timezone = updates.profile.timezone;

      if (updates.profile.languages !== undefined) user.profile.languages = updates.profile.languages;

      if (updates.profile.hourlyRate !== undefined) user.profile.hourlyRate = updates.profile.hourlyRate;

      

      // Social links

      if (updates.profile.socialLinks) {

        if (!user.profile.socialLinks) user.profile.socialLinks = {};

        if (updates.profile.socialLinks.linkedin !== undefined) user.profile.socialLinks.linkedin = updates.profile.socialLinks.linkedin;

        if (updates.profile.socialLinks.twitter !== undefined) user.profile.socialLinks.twitter = updates.profile.socialLinks.twitter;

        if (updates.profile.socialLinks.instagram !== undefined) user.profile.socialLinks.instagram = updates.profile.socialLinks.instagram;

        if (updates.profile.socialLinks.github !== undefined) user.profile.socialLinks.github = updates.profile.socialLinks.github;

        if (updates.profile.socialLinks.portfolio !== undefined) user.profile.socialLinks.portfolio = updates.profile.socialLinks.portfolio;

      }

    }

    

    await user.save();

    res.json(user);

  } catch (err) {

    console.error('Profile update error:', err);

    res.status(400).json({ message: 'Failed to update profile' });

  }

});



// Delete user account (auth required)

router.delete('/profile', auth, async (req, res) => {

  try {

    const user = await User.findById(req.user._id);

    if (!user) {

      return res.status(404).json({ message: 'User not found' });

    }

    await user.deleteOne();

    res.json({ message: 'Account deleted' });

  } catch (err) {

    console.error('Account deletion error:', err);

    res.status(400).json({ message: 'Failed to delete account' });

  }

});



// Verify email

router.post('/verify-email', async (req, res) => {

  try {

    const { token } = req.body;

    

    if (!token) {

      return res.status(400).json({ message: 'Verification token is required' });

    }



    // Hash the token to compare with stored hash

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    

    // Find user with matching token and check if token hasn't expired

    const user = await User.findOne({

      emailVerificationToken: hashedToken,

      emailVerificationExpires: { $gt: Date.now() }

    });



    if (!user) {

      return res.status(400).json({ message: 'Invalid or expired verification token' });

    }



    // Update user verification status

    user.isEmailVerified = true;

    user.emailVerificationToken = undefined;

    user.emailVerificationExpires = undefined;

    await user.save();



    res.json({ message: 'Email verified successfully' });

  } catch (error) {

    console.error('Email verification error:', error);

    res.status(500).json({ message: 'Email verification failed' });

  }

});



// Resend verification email

router.post('/resend-verification', async (req, res) => {

  try {

    const { email } = req.body;

    

    if (!email) {

      return res.status(400).json({ message: 'Email is required' });

    }



    const user = await User.findOne({ email });

    if (!user) {

      return res.status(404).json({ message: 'User not found' });

    }



    if (user.isEmailVerified) {

      return res.status(400).json({ message: 'Email is already verified' });

    }



    // Generate new verification token

    const verificationToken = user.generateEmailVerificationToken();

    await user.save();



    // Send verification email

    await sendVerificationEmail(email, verificationToken, user.username);



    res.json({ message: 'Verification email sent successfully' });

  } catch (error) {

    console.error('Resend verification error:', error);

    res.status(500).json({ message: 'Failed to resend verification email' });

  }

});



// Forgot password

router.post('/forgot-password', async (req, res) => {

  try {

    const { email } = req.body;

    

    if (!email) {

      return res.status(400).json({ message: 'Email is required' });

    }



    const user = await User.findOne({ email });

    if (!user) {

      // Don't reveal if email exists or not for security

      return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });

    }



    // Generate password reset token

    const resetToken = user.generatePasswordResetToken();

    await user.save();



    // Send password reset email

    try {

      await sendPasswordResetEmail(email, resetToken, user.username);

      res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });

    } catch (emailError) {

      console.error('Failed to send password reset email:', emailError);

      res.status(500).json({ message: 'Failed to send password reset email' });

    }

  } catch (error) {

    console.error('Forgot password error:', error);

    res.status(500).json({ message: 'Password reset request failed' });

  }

});



// Reset password

router.post('/reset-password', async (req, res) => {

  try {

    const { token, newPassword } = req.body;

    

    if (!token || !newPassword) {

      return res.status(400).json({ message: 'Token and new password are required' });

    }



    if (newPassword.length < 6) {

      return res.status(400).json({ message: 'Password must be at least 6 characters long' });

    }



    // Hash the token to compare with stored hash

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    

    // Find user with matching token and check if token hasn't expired

    const user = await User.findOne({

      passwordResetToken: hashedToken,

      passwordResetExpires: { $gt: Date.now() }

    }).select('+password');



    if (!user) {

      return res.status(400).json({ message: 'Invalid or expired reset token' });

    }



    // Update password

    user.password = newPassword;

    user.passwordResetToken = undefined;

    user.passwordResetExpires = undefined;

    await user.save();



    res.json({ message: 'Password reset successfully' });

  } catch (error) {

    console.error('Reset password error:', error);

    res.status(500).json({ message: 'Password reset failed' });

  }

});

// -------- Google OAuth --------
router.get('/oauth/google', async (req, res) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${BACKEND_URL}/api/auth/oauth/google/callback`;
    const scope = encodeURIComponent('openid email profile');
    const state = encodeURIComponent(req.query.next || '/dashboard');

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&access_type=offline&include_granted_scopes=true&prompt=consent&state=${state}`;
    res.redirect(authUrl);
  } catch (e) {
    console.error('Google OAuth start error:', e);
    res.status(500).json({ message: 'Failed to start Google OAuth' });
  }
});

router.get('/oauth/google/callback', async (req, res) => {
  try {
    const code = req.query.code;
    const state = req.query.state;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${BACKEND_URL}/api/auth/oauth/google/callback`;
    if (!code) return res.status(400).send('Missing code');

    const tokenResp = await postForm('https://oauth2.googleapis.com/token', {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    });

    const accessToken = tokenResp.access_token;
    if (!accessToken) throw new Error('Missing access_token');

    const profile = await getJson('https://openidconnect.googleapis.com/v1/userinfo', accessToken);
    const email = profile.email;
    const displayName = profile.name;
    if (!email) throw new Error('No email from Google userinfo');

    const user = await findOrCreateOAuthUser(email, displayName);
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    return redirectWithToken(res, jwtToken, state);
  } catch (e) {
    console.error('Google OAuth callback error:', e);
    res.status(500).send('Google OAuth failed');
  }
});

// -------- Microsoft OAuth --------
router.get('/oauth/microsoft', async (req, res) => {
  try {
    const clientId = process.env.MS_CLIENT_ID;
    const redirectUri = `${BACKEND_URL}/api/auth/oauth/microsoft/callback`;
    const scope = encodeURIComponent('openid profile email');
    const state = encodeURIComponent(req.query.next || '/dashboard');

    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${encodeURIComponent(clientId)}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&response_mode=query&scope=${scope}&state=${state}`;
    res.redirect(authUrl);
  } catch (e) {
    console.error('Microsoft OAuth start error:', e);
    res.status(500).json({ message: 'Failed to start Microsoft OAuth' });
  }
});

router.get('/oauth/microsoft/callback', async (req, res) => {
  try {
    const code = req.query.code;
    const state = req.query.state;
    const clientId = process.env.MS_CLIENT_ID;
    const clientSecret = process.env.MS_CLIENT_SECRET;
    const redirectUri = `${BACKEND_URL}/api/auth/oauth/microsoft/callback`;
    if (!code) return res.status(400).send('Missing code');

    const tokenResp = await postForm('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      client_id: clientId,
      scope: 'openid profile email',
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      client_secret: clientSecret
    });

    const accessToken = tokenResp.access_token;
    if (!accessToken) throw new Error('Missing access_token');

    const profile = await getJson('https://graph.microsoft.com/oidc/userinfo', accessToken);
    const email = profile.email || profile.preferred_username;
    const displayName = profile.name;
    if (!email) throw new Error('No email from Microsoft userinfo');

    const user = await findOrCreateOAuthUser(email, displayName);
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    return redirectWithToken(res, jwtToken, state);
  } catch (e) {
    console.error('Microsoft OAuth callback error:', e);
    res.status(500).send('Microsoft OAuth failed');
  }
});


module.exports = router; 