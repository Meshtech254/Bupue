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
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isAdmin: { type: Boolean, default: false },
  banned: { type: Boolean, default: false },
  banReason: String,
  bannedAt: Date,
  profile: {
    firstName: String,
    lastName: String,
    displayName: String,
    bio: String,
    avatar: String,
    coverBanner: String,
    phone: String,
    dateOfBirth: Date,
    location: String,
    website: String,
    socialLinks: {
      linkedin: String,
      twitter: String,
      instagram: String,
      github: String,
      portfolio: String
    },
    category: {
      type: String,
      enum: ['Mentor', 'Entrepreneur', 'Digital Creator', 'Student', 'Professional', 'Other'],
      default: 'Other'
    },
    skills: [String],
    availability: {
      type: String,
      enum: ['Available', 'Busy', 'Away', 'Do Not Disturb'],
      default: 'Available'
    },
    openForCollaborations: {
      type: Boolean,
      default: false
    },
    openForMentorship: {
      type: Boolean,
      default: false
    },
    timezone: String,
    languages: [String],
    hourlyRate: Number,
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    following: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    badges: [{
      name: String,
      description: String,
      earnedAt: {
        type: Date,
        default: Date.now
      }
    }],
    featuredContent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }
  },
  wishlist: {
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }]
  },
  activity: {
    viewedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    viewedItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
    viewedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
  }
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

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return token;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  
  return token;
};

module.exports = mongoose.model('User', userSchema); 