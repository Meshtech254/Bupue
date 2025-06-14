const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const coursesRoutes = require('./routes/courses');
const itemsRoutes = require('./routes/items');
const ordersRoutes = require('./routes/orders');

// Load environment variables with absolute path
const envPath = path.resolve(__dirname, '.env');
console.log('Loading .env file from:', envPath);
dotenv.config({ path: envPath });

// Debug: Log environment variables (excluding sensitive values)
console.log('Environment variables loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set',
  JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/orders', ordersRoutes);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bupue';

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 