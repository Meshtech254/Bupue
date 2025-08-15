const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const auth = require('../middleware/auth');

// List all items with filters and search
router.get('/', async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, minRating, sort = 'newest' } = req.query;
    const filter = {};
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (minRating) filter.averageRating = { $gte: Number(minRating) };

    const sortMap = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating_desc: { averageRating: -1, reviewCount: -1 }
    };

    const items = await Item.find(filter)
      .populate('owner', 'username email')
      .sort(sortMap[sort] || sortMap.newest);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch items' });
  }
});

// Create an item (auth required)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, price, images } = req.body;
    const item = new Item({
      title,
      description,
      price,
      images: images || [],
      owner: req.user._id
    });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create item' });
  }
});

// Get a single item
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('owner', 'username email');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: 'Invalid item id' });
  }
});

// Edit an item (auth, only owner)
router.put('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    item.title = req.body.title || item.title;
    item.description = req.body.description || item.description;
    item.price = req.body.price || item.price;
    item.images = req.body.images || item.images;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update item' });
  }
});

// Delete an item (auth, only owner)
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await item.deleteOne();
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete item' });
  }
});

module.exports = router; 