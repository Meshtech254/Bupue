const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true }
}, { _id: false });

const QuizQuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true }
}, { _id: false });

const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  order: { type: Number, default: 0, index: true },
  type: { type: String, enum: ['video', 'reading', 'quiz'], default: 'video' },
  videoUrl: { type: String },
  embedUrl: { type: String },
  textContent: { type: String },
  durationSeconds: { type: Number, default: 0 },
  freePreview: { type: Boolean, default: false },
  resources: [ResourceSchema],
  quiz: {
    questions: [QuizQuestionSchema]
  }
}, { _id: true, timestamps: true });

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true },
  discountPercent: { type: Number, default: 0, min: 0, max: 100 },
  expiresAt: { type: Date },
  active: { type: Boolean, default: true }
}, { _id: false });

const courseSchema = new mongoose.Schema({
  // Basic Info
  title: { type: String, required: true, index: 'text' },
  shortDescription: { type: String, maxlength: 240 },
  fullDescription: { type: String },
  category: { type: String, default: 'General', index: true },
  subcategory: { type: String, default: '' },
  targetAudience: [{ type: String }],
  language: { type: String, default: 'English' },

  // Branding
  thumbnailUrl: { type: String },
  coverImageUrl: { type: String },
  promoVideoUrl: { type: String },

  // Instructor
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  verifiedInstructor: { type: Boolean, default: false },

  // Curriculum Content
  lessons: [LessonSchema],
  durationSeconds: { type: Number, default: 0 },

  // Monetization & Affiliates
  price: { type: Number, default: 0 },
  discountPercent: { type: Number, default: 0, min: 0, max: 100 },
  coupons: [CouponSchema],
  affiliateCommissionPercent: { type: Number, default: 0, min: 0, max: 90 },

  // Meta
  tags: [{ type: String, index: true }],
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  published: { type: Boolean, default: true }
}, { timestamps: true });

// Virtual: isFree
courseSchema.virtual('isFree').get(function() {
  return (this.price || 0) === 0 || (this.discountPercent || 0) >= 100;
});

// Helper: compute duration from lessons
courseSchema.methods.computeDurationSeconds = function() {
  if (!Array.isArray(this.lessons)) return 0;
  return this.lessons.reduce((sum, l) => sum + (l.durationSeconds || 0), 0);
};

courseSchema.pre('save', function(next) {
  this.durationSeconds = this.computeDurationSeconds();
  next();
});

module.exports = mongoose.model('Course', courseSchema);