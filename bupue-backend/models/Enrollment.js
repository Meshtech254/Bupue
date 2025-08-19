const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  completedLessonIds: [{ type: mongoose.Schema.Types.ObjectId }],
  progressPercent: { type: Number, default: 0, min: 0, max: 100 },
  notes: [{
    lessonId: { type: mongoose.Schema.Types.ObjectId },
    text: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  certificateIssued: { type: Boolean, default: false },
  startedAt: { type: Date, default: Date.now },
  lastAccessedAt: { type: Date, default: Date.now }
}, { timestamps: true });

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

enrollmentSchema.methods.recalculateProgress = function(totalLessons) {
  const completed = (this.completedLessonIds || []).length;
  const total = Math.max(1, totalLessons || 1);
  this.progressPercent = Math.min(100, Math.round((completed / total) * 100));
};

module.exports = mongoose.model('Enrollment', enrollmentSchema);