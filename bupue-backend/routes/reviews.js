const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Course = require('../models/Course');
const Post = require('../models/Post');
const Item = require('../models/Item');
const auth = require('../middleware/auth');

function getModelByType(type) {
  if (type === 'Course') return Course;
  if (type === 'Post') return Post;
  if (type === 'Item') return Item;
  return null;
}

async function recomputeAggregate(model, docId, fields) {
  const { averageRatingField = 'averageRating', reviewCountField = 'reviewCount' } = fields || {};
  const stats = await Review.aggregate([
    { $match: { targetType: model.modelName, targetId: docId } },
    { $group: { _id: '$targetId', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  const { avg = 0, count = 0 } = stats[0] || {};
  await model.updateOne({ _id: docId }, { [averageRatingField]: avg, [reviewCountField]: count });
}

// Create or update a review
router.post('/', auth, async (req, res) => {
  try {
    const { targetType, targetId, rating, text } = req.body;
    const Model = getModelByType(targetType);
    if (!Model) return res.status(400).json({ message: 'Invalid target type' });

    const exists = await Model.findById(targetId);
    if (!exists) return res.status(404).json({ message: 'Target not found' });

    const review = await Review.findOneAndUpdate(
      { user: req.user._id, targetType, targetId },
      { rating, text },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await recomputeAggregate(Model, exists._id);
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ message: 'Failed to submit review' });
  }
});

// List reviews for a target
router.get('/:targetType/:targetId', async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const reviews = await Review.find({ targetType, targetId })
      .populate('user', 'username')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

module.exports = router;



