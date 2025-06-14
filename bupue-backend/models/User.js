const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isAdmin: { type: Boolean, default: false },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  try {
    if (!this.isModified('password')) {
      console.log('Password not modified, skipping hash');
      return next();
    }
    
    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Password hashed successfully');
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('Starting password comparison...');
    
    if (!this.password) {
      console.error('No password set for user');
      throw new Error('Password not set');
    }

    if (!candidatePassword) {
      console.error('No candidate password provided');
      throw new Error('Candidate password is required');
    }

    console.log('Comparing passwords with bcrypt...');
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Password comparison complete, result:', isMatch);
    
    return isMatch;
  } catch (error) {
    console.error('Password comparison error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

module.exports = mongoose.model('User', userSchema); 