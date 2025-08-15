const express = require('express');
const router = express.Router();
const MessageThread = require('../models/Message');
const auth = require('../middleware/auth');

// Get user's message threads
router.get('/', auth, async (req, res) => {
  try {
    const threads = await MessageThread.find({ participants: req.user._id })
      .populate('participants', 'username')
      .populate('messages.sender', 'username')
      .sort({ updatedAt: -1 });
    res.json(threads);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// Get or create a thread with another user
router.get('/:userId', auth, async (req, res) => {
  try {
    if (req.params.userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot message yourself' });
    }

    let thread = await MessageThread.findOne({
      participants: { $all: [req.user._id, req.params.userId] }
    }).populate('participants', 'username').populate('messages.sender', 'username');

    if (!thread) {
      thread = new MessageThread({
        participants: [req.user._id, req.params.userId],
        messages: []
      });
      await thread.save();
      thread = await thread.populate('participants', 'username');
    }

    res.json(thread);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch/create thread' });
  }
});

// Send a message
router.post('/:threadId', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const thread = await MessageThread.findById(req.params.threadId);
    
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    if (!thread.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    thread.messages.push({
      sender: req.user._id,
      text,
      createdAt: new Date()
    });

    await thread.save();
    await thread.populate('messages.sender', 'username');
    
    res.status(201).json(thread);
  } catch (err) {
    res.status(400).json({ message: 'Failed to send message' });
  }
});

module.exports = router;

