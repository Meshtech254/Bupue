const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Comment = require('../models/Comment');

// Get all posts with filters and search
router.get('/', async (req, res) => {
  try {
    const { q, category, startDate, endDate, minRating, sort = 'newest' } = req.query;
    const filter = {};
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { body: { $regex: q, $options: 'i' } }
      ];
    }
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.eventDate = {};
      if (startDate) filter.eventDate.$gte = new Date(startDate);
      if (endDate) filter.eventDate.$lte = new Date(endDate);
    }
    if (minRating) filter.averageRating = { $gte: Number(minRating) };

    const sortMap = {
      newest: { createdAt: -1 },
      soonest: { eventDate: 1 },
      rating_desc: { averageRating: -1, reviewCount: -1 }
    };

    const posts = await Post.find(filter)
      .populate('author', 'username email')
      .sort(sortMap[sort] || sortMap.newest);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

// Create a post (auth required)
router.post('/', auth, async (req, res) => {
  try {
    const { title, body } = req.body;
    const post = new Post({
      title,
      body,
      author: req.user._id
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create post' });
  }
});

// Get a single post by id
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username email');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(400).json({ message: 'Invalid post id' });
  }
});

// Get comments for a post
router.get('/:postId/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'username email')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
});

// Add a comment to a post (auth required)
router.post('/:postId/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const comment = new Comment({
      text,
      author: req.user._id,
      post: req.params.postId
    });
    await comment.save();
    await comment.populate('author', 'username email');
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ message: 'Failed to add comment' });
  }
});

// Edit a post (auth, only author)
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    post.title = req.body.title || post.title;
    post.body = req.body.body || post.body;
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update post' });
  }
});

// Delete a post (auth, only author)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete post' });
  }
});

// Edit a comment (auth, only author)
router.put('/:postId/comments/:commentId', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    comment.text = req.body.text || comment.text;
    await comment.save();
    res.json(comment);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update comment' });
  }
});

// Delete a comment (auth, only author)
router.delete('/:postId/comments/:commentId', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete comment' });
  }
});

module.exports = router; 