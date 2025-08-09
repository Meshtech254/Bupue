const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Course = require('../models/Course');
const Item = require('../models/Item');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Apply auth and admin middleware to all routes
router.use(auth);
router.use(requireAdmin);

// Dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      totalOrders,
      totalCourses,
      totalItems,
      totalPosts,
      recentOrders,
      pendingOrders,
      monthlyRevenue
    ] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Course.countDocuments(),
      Item.countDocuments(),
      Post.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'username email'),
      Order.countDocuments({ status: 'pending' }),
      Order.aggregate([
        {
          $match: {
            status: 'paid',
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$total' }
          }
        }
      ])
    ]);

    res.json({
      statistics: {
        totalUsers,
        totalOrders,
        totalCourses,
        totalItems,
        totalPosts,
        pendingOrders,
        monthlyRevenue: monthlyRevenue[0]?.total || 0
      },
      recentOrders
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to load dashboard' });
  }
});

// User management
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    
    const query = search 
      ? {
          $or: [
            { username: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    const users = await User.find(query)
      .select('-password -emailVerificationToken -passwordResetToken')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to get users' });
  }
});

// Ban/unban user
router.patch('/users/:id/ban', async (req, res) => {
  try {
    const { banned, reason } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isAdmin) {
      return res.status(400).json({ message: 'Cannot ban admin users' });
    }

    user.banned = banned;
    user.banReason = reason;
    user.bannedAt = banned ? new Date() : undefined;
    await user.save();

    res.json({ 
      message: `User ${banned ? 'banned' : 'unbanned'} successfully`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        banned: user.banned,
        banReason: user.banReason
      }
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
});

// Make user admin
router.patch('/users/:id/admin', async (req, res) => {
  try {
    const { isAdmin } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isAdmin = isAdmin;
    await user.save();

    res.json({ 
      message: `User ${isAdmin ? 'promoted to' : 'demoted from'} admin successfully`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Admin promotion error:', error);
    res.status(500).json({ message: 'Failed to update admin status' });
  }
});

// Order management
router.get('/orders', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || '';
    
    const query = status ? { status } : {};

    const orders = await Order.find(query)
      .populate('user', 'username email')
      .populate('items.item', 'title price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Failed to get orders' });
  }
});

// Content management
router.get('/content', async (req, res) => {
  try {
    const type = req.query.type || 'all';
    
    let content = [];
    
    if (type === 'all' || type === 'courses') {
      const courses = await Course.find()
        .populate('owner', 'username email')
        .sort({ createdAt: -1 });
      content = [...content, ...courses.map(c => ({ ...c.toObject(), type: 'course' }))];
    }
    
    if (type === 'all' || type === 'items') {
      const items = await Item.find()
        .populate('owner', 'username email')
        .sort({ createdAt: -1 });
      content = [...content, ...items.map(i => ({ ...i.toObject(), type: 'item' }))];
    }
    
    if (type === 'all' || type === 'posts') {
      const posts = await Post.find()
        .populate('author', 'username email')
        .sort({ createdAt: -1 });
      content = [...content, ...posts.map(p => ({ ...p.toObject(), type: 'post' }))];
    }

    // Sort by creation date
    content.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ content });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ message: 'Failed to get content' });
  }
});

// Delete content
router.delete('/content/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const { reason } = req.body;
    
    let result;
    
    switch (type) {
      case 'course':
        result = await Course.findByIdAndDelete(id);
        break;
      case 'item':
        result = await Item.findByIdAndDelete(id);
        break;
      case 'post':
        result = await Post.findByIdAndDelete(id);
        break;
      default:
        return res.status(400).json({ message: 'Invalid content type' });
    }
    
    if (!result) {
      return res.status(404).json({ message: 'Content not found' });
    }

    res.json({ 
      message: 'Content deleted successfully',
      reason,
      deletedItem: result
    });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ message: 'Failed to delete content' });
  }
});

// System settings
router.get('/settings', async (req, res) => {
  try {
    // This would typically come from a settings collection
    const settings = {
      siteName: process.env.SITE_NAME || 'Bupue',
      allowRegistration: process.env.ALLOW_REGISTRATION !== 'false',
      requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION === 'true',
      maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
      maxFileSize: process.env.MAX_FILE_SIZE || '10MB',
      allowedFileTypes: process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,pdf,mp4'
    };

    res.json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Failed to get settings' });
  }
});

// Update system settings (basic version - in production you'd want a proper settings system)
router.patch('/settings', async (req, res) => {
  try {
    const updates = req.body;
    
    // In a real application, you'd save these to a database
    // For now, we'll just return the updated settings
    
    res.json({ 
      message: 'Settings updated successfully',
      settings: updates 
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

module.exports = router;
