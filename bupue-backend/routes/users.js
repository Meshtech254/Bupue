const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Search users with filters
router.get('/search', auth, async (req, res) => {
  try {
    const { q, category, skills, limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    let searchQuery = { _id: { $ne: req.user._id } };

    if (q) {
      searchQuery.$or = [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { 'profile.firstName': { $regex: q, $options: 'i' } },
        { 'profile.lastName': { $regex: q, $options: 'i' } },
        { 'profile.displayName': { $regex: q, $options: 'i' } },
        { 'profile.bio': { $regex: q, $options: 'i' } }
      ];
    }

    if (category) {
      searchQuery['profile.category'] = category;
    }

    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      searchQuery['profile.skills'] = { $in: skillsArray };
    }

    console.log('Search query:', searchQuery);

    const users = await User.find(searchQuery)
      .select('username email profile.followers profile.following profile.category profile.skills profile.bio profile.avatar profile.displayName profile.badges')
      .populate('profile.followers', 'username profile.displayName profile.avatar')
      .populate('profile.following', 'username profile.displayName profile.avatar')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ 'profile.followers.length': -1, username: 1 });

    console.log('Found users:', users.length);

    const total = await User.countDocuments(searchQuery);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasMore: skip + users.length < total
      }
    });
  } catch (err) {
    console.error('User search error:', err);
    res.status(500).json({ message: 'Failed to search users' });
  }
});

// Get user profile by ID
router.get('/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password -emailVerificationToken -passwordResetToken')
      .populate('profile.followers', 'username profile.displayName profile.avatar')
      .populate('profile.following', 'username profile.displayName profile.avatar');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if current user is following this user
    const isFollowing = user.profile.followers.some(follower => 
      follower._id.toString() === req.user._id.toString()
    );

    res.json({
      ...user.toObject(),
      isFollowing
    });
  } catch (err) {
    console.error('Get user profile error:', err);
    res.status(500).json({ message: 'Failed to get user profile' });
  }
});

// Follow a user
router.post('/:userId/follow', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(req.user._id);

    const isAlreadyFollowing = userToFollow.profile.followers.some(follower =>
      follower.toString() === req.user._id.toString()
    );

    if (isAlreadyFollowing) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    userToFollow.profile.followers.push(req.user._id);
    currentUser.profile.following.push(userId);

    await Promise.all([userToFollow.save(), currentUser.save()]);

    res.json({ 
      message: 'Successfully followed user',
      isFollowing: true,
      followersCount: userToFollow.profile.followers.length
    });
  } catch (err) {
    console.error('Follow user error:', err);
    res.status(500).json({ message: 'Failed to follow user' });
  }
});

// Unfollow a user
router.delete('/:userId/follow', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    const userToUnfollow = await User.findById(userId);
    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(req.user._id);

    userToUnfollow.profile.followers = userToUnfollow.profile.followers.filter(
      follower => follower.toString() !== req.user._id.toString()
    );
    
    currentUser.profile.following = currentUser.profile.following.filter(
      following => following.toString() !== userId
    );

    await Promise.all([userToUnfollow.save(), currentUser.save()]);

    res.json({ 
      message: 'Successfully unfollowed user',
      isFollowing: false,
      followersCount: userToUnfollow.profile.followers.length
    });
  } catch (err) {
    console.error('Unfollow user error:', err);
    res.status(500).json({ message: 'Failed to unfollow user' });
  }
});

// Get suggested users to follow
router.get('/suggestions/follow', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);

    // Find users not already followed, with similar interests or popular users
    const suggestions = await User.find({
      _id: { 
        $ne: req.user._id,
        $nin: currentUser.profile.following 
      }
    })
    .select('username profile.displayName profile.avatar profile.category profile.skills profile.bio profile.followers profile.badges')
    .populate('profile.followers', 'username profile.displayName profile.avatar')
    .sort({ 'profile.followers.length': -1 })
    .limit(10);

    res.json(suggestions);
  } catch (err) {
    console.error('Get follow suggestions error:', err);
    res.status(500).json({ message: 'Failed to get follow suggestions' });
  }
});

module.exports = router;
