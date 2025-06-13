const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Add more fields as needed (e.g., thumbnail, content, etc.)
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema); 