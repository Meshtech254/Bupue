const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const auth = require('../middleware/auth');

// List all items
router.get('/', async (req, res) => {
  try {
    const items = await Item.find().populate('owner', 'username email').sort({ createdAt: -1 });
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