const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
      quantity: { type: Number, required: true, default: 1 },
      price: { type: Number, required: true }
    }
  ],
  total: { type: Number, required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'paid', 'shipped', 'completed', 'cancelled'] },
  shipping: {
    name: String,
    address: String,
    city: String,
    country: String,
    postalCode: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema); 