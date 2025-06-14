const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

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
    await user.save();
    console.log('User saved successfully');

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
        email: user.email
      }
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
          email: user.email
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
    Object.keys(updates).forEach(key => {
      if (key !== 'password') user[key] = updates[key];
    });
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

module.exports = router; 