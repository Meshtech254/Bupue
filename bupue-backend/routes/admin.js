const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Admin middleware - check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    // First check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user is admin (trust middleware but also verify from DB)
    if (req.user.isAdmin) {
      return next();
    }

    const freshUser = await User.findById(req.user._id).select('isAdmin');
    if (!freshUser || !freshUser.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get admin dashboard stats
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ banned: { $ne: true } });
    const bannedUsers = await User.countDocuments({ banned: true });

    // For now, we'll return basic stats
    // Later we can add courses, posts, items counts
    res.json({
      totalUsers,
      activeUsers,
      bannedUsers,
      totalCourses: 0,
      totalPosts: 0,
      totalItems: 0,
      pendingApprovals: 0
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Failed to get admin stats' });
  }
});

// Get all users for admin
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, status } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { username: searchRegex },
        { email: searchRegex },
        { 'profile.displayName': searchRegex }
      ];
    }

    if (category) {
      query['profile.category'] = category;
    }

    if (status === 'banned') {
      query.banned = true;
    } else if (status === 'active') {
      query.banned = { $ne: true };
    }

    const users = await User.find(query)
      .select('-password -emailVerificationToken -passwordResetToken')
      .populate('profile.followers', 'username profile.displayName')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasMore: skip + users.length < total
      }
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ message: 'Failed to get users' });
  }
});

// Ban a user
router.post('/users/:userId/ban', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.banned = true;
    user.banReason = req.body.reason || 'Admin action';
    user.bannedAt = new Date();
    await user.save();

    res.json({ message: 'User banned successfully' });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ message: 'Failed to ban user' });
  }
});

// Unban a user
router.post('/users/:userId/unban', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.banned = false;
    user.banReason = undefined;
    user.bannedAt = undefined;
    await user.save();

    res.json({ message: 'User unbanned successfully' });
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({ message: 'Failed to unban user' });
  }
});

// Update user (admin)
router.put('/users/:userId', auth, adminAuth, async (req, res) => {
  try {
    const { username, email, profile } = req.body;
    
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update basic fields
    if (username) user.username = username;
    if (email) user.email = email;
    
    // Update profile fields
    if (profile) {
      if (profile.displayName) user.profile.displayName = profile.displayName;
      if (profile.category) user.profile.category = profile.category;
      if (profile.bio) user.profile.bio = profile.bio;
      if (profile.skills) user.profile.skills = profile.skills;
    }

    await user.save();

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// Delete user (admin)
router.delete('/users/:userId', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.userId);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Get recent activity
router.get('/activity', auth, adminAuth, async (req, res) => {
  try {
    // For now, return recent user registrations
    // Later we can add more activity types
    const recentUsers = await User.find()
      .select('username email createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    const activity = recentUsers.map(user => ({
      type: 'user_register',
      description: `New user registered: ${user.username}`,
      timestamp: user.createdAt,
      userId: user._id
    }));

    res.json(activity);
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ message: 'Failed to get activity' });
  }
});

module.exports = router;

