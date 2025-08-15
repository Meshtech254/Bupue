const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Post = require('../models/Post');
const Item = require('../models/Item');
const auth = require('../middleware/auth');

// Get personalized recommendations for a user
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's activity and preferences
    const { viewedCourses, viewedItems, viewedPosts, profile } = user;
    const { category, skills } = profile || {};

    // Build recommendation queries based on user activity
    const recommendations = {
      courses: [],
      items: [],
      posts: []
    };

    // Course recommendations based on viewed courses and profile
    if (viewedCourses && viewedCourses.length > 0) {
      const viewedCourseIds = viewedCourses.map(id => id.toString());
      const similarCourses = await Course.find({
        _id: { $nin: viewedCourseIds },
        $or: [
          { category: { $in: [category] } },
          { owner: { $in: viewedCourses.map(c => c.owner) } }
        ]
      }).populate('owner', 'username').limit(5);
      recommendations.courses = similarCourses;
    } else {
      // Fallback to popular courses
      const popularCourses = await Course.find()
        .sort({ averageRating: -1, reviewCount: -1 })
        .populate('owner', 'username')
        .limit(5);
      recommendations.courses = popularCourses;
    }

    // Item recommendations
    if (viewedItems && viewedItems.length > 0) {
      const viewedItemIds = viewedItems.map(id => id.toString());
      const similarItems = await Item.find({
        _id: { $nin: viewedItemIds },
        category: { $in: [category] }
      }).populate('owner', 'username').limit(5);
      recommendations.items = similarItems;
    } else {
      const popularItems = await Item.find()
        .sort({ averageRating: -1, reviewCount: -1 })
        .populate('owner', 'username')
        .limit(5);
      recommendations.items = popularItems;
    }

    // Event recommendations
    if (viewedPosts && viewedPosts.length > 0) {
      const viewedPostIds = viewedPosts.map(id => id.toString());
      const similarEvents = await Post.find({
        _id: { $nin: viewedPostIds },
        category: { $in: [category] }
      }).populate('author', 'username').limit(5);
      recommendations.posts = similarEvents;
    } else {
      const upcomingEvents = await Post.find()
        .sort({ eventDate: 1 })
        .populate('author', 'username')
        .limit(5);
      recommendations.posts = upcomingEvents;
    }

    res.json(recommendations);
  } catch (err) {
    console.error('Recommendations error:', err);
    res.status(500).json({ message: 'Failed to fetch recommendations' });
  }
});

module.exports = router;

