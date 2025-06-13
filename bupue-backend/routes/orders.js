const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Item = require('../models/Item');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Create an order
router.post('/', auth, async (req, res) => {
  try {
    const { items, shipping } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }
    // Calculate total and validate items
    let total = 0;
    const orderItems = await Promise.all(items.map(async (cartItem) => {
      const item = await Item.findById(cartItem.item);
      if (!item) throw new Error('Item not found');
      const price = item.price;
      total += price * cartItem.quantity;
      return {
        item: item._id,
        quantity: cartItem.quantity,
        price
      };
    }));
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      total,
      shipping
    });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to create order' });
  }
});

// Get all orders for the logged-in user
router.get('/my', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Get a single order by id (only owner)
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.item');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: 'Invalid order id' });
  }
});

// Admin: Get all orders
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.isAdmin) return res.status(403).json({ message: 'Not authorized' });
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Admin: Update order status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.isAdmin) return res.status(403).json({ message: 'Not authorized' });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = req.body.status || order.status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update order status' });
  }
});

module.exports = router; 