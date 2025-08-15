const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('wishlist.courses')
      .populate('wishlist.items')
      .populate('wishlist.posts');
    res.json(user.wishlist || { courses: [], items: [], posts: [] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch wishlist' });
  }
});

router.post('/:type/:id', auth, async (req, res) => {
  try {
    const { type, id } = req.params;
    if (!['courses', 'items', 'posts'].includes(type)) {
      return res.status(400).json({ message: 'Invalid wishlist type' });
    }
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist || { courses: [], items: [], posts: [] };
    const list = user.wishlist[type];
    if (!list.find(x => x.toString() === id)) list.push(id);
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: 'Failed to add to wishlist' });
  }
});

router.delete('/:type/:id', auth, async (req, res) => {
  try {
    const { type, id } = req.params;
    if (!['courses', 'items', 'posts'].includes(type)) {
      return res.status(400).json({ message: 'Invalid wishlist type' });
    }
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist || { courses: [], items: [], posts: [] };
    user.wishlist[type] = user.wishlist[type].filter(x => x.toString() !== id);
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: 'Failed to remove from wishlist' });
  }
});

module.exports = router;



