const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get all courses with filters and search
router.get('/', async (req, res) => {
  try {
    const {
      q,
      category,
      subcategory,
      tags,
      minPrice,
      maxPrice,
      minRating,
      freeOnly,
      sort = 'newest'
    } = req.query;

    const filter = {};
    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { title: regex },
        { shortDescription: regex },
        { fullDescription: regex },
        { tags: regex }
      ];
    }
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (tags) filter.tags = { $in: tags.split(',').map(t => t.trim()) };
    if (freeOnly === 'true') filter.price = 0;
    if (minPrice || maxPrice) {
      filter.price = filter.price || {};
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

    const courses = await Course.find(filter)
      .select('title thumbnailUrl shortDescription price averageRating reviewCount tags owner verifiedInstructor category')
      .populate('owner', 'username profile.avatar profile.displayName')
      .sort(sortMap[sort] || sortMap.newest);
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
});

// Get a single course by id - landing page data with curriculum preview
router.get('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('owner', 'username email profile.avatar profile.displayName');
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const enrollment = await Enrollment.findOne({ user: req.user._id, course: course._id });
    const isEnrolled = !!enrollment;

    // Only expose previews for non-enrolled users
    const lessonsPreview = (course.lessons || [])
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(l => ({
        _id: l._id,
        title: l.title,
        order: l.order,
        type: l.type,
        durationSeconds: l.durationSeconds,
        freePreview: l.freePreview,
        // expose content links only for previews
        videoUrl: l.freePreview ? l.videoUrl : undefined,
        embedUrl: l.freePreview ? l.embedUrl : undefined,
        resources: l.freePreview ? l.resources : []
      }));

    res.json({
      _id: course._id,
      title: course.title,
      shortDescription: course.shortDescription,
      fullDescription: course.fullDescription,
      category: course.category,
      subcategory: course.subcategory,
      targetAudience: course.targetAudience,
      language: course.language,
      thumbnailUrl: course.thumbnailUrl,
      coverImageUrl: course.coverImageUrl,
      promoVideoUrl: course.promoVideoUrl,
      owner: course.owner,
      verifiedInstructor: course.verifiedInstructor,
      price: course.price,
      discountPercent: course.discountPercent,
      affiliateCommissionPercent: course.affiliateCommissionPercent,
      averageRating: course.averageRating,
      reviewCount: course.reviewCount,
      tags: course.tags,
      durationSeconds: course.durationSeconds,
      lessons: lessonsPreview,
      isEnrolled
    });
  } catch (err) {
    res.status(400).json({ message: 'Invalid course id' });
  }
});

// Create a course (auth required)
router.post('/', auth, async (req, res) => {
  try {
    const payload = req.body || {};
    const course = new Course({
      title: payload.title,
      shortDescription: payload.shortDescription,
      fullDescription: payload.fullDescription,
      category: payload.category,
      subcategory: payload.subcategory,
      targetAudience: payload.targetAudience,
      language: payload.language,
      thumbnailUrl: payload.thumbnailUrl,
      coverImageUrl: payload.coverImageUrl,
      promoVideoUrl: payload.promoVideoUrl,
      lessons: Array.isArray(payload.lessons) ? payload.lessons : [],
      price: payload.price ?? 0,
      discountPercent: payload.discountPercent ?? 0,
      coupons: Array.isArray(payload.coupons) ? payload.coupons : [],
      affiliateCommissionPercent: payload.affiliateCommissionPercent ?? 0,
      tags: Array.isArray(payload.tags) ? payload.tags : [],
      verifiedInstructor: payload.verifiedInstructor ?? false,
      owner: req.user._id
    });
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    console.error('Create course error:', err);
    res.status(400).json({ message: 'Failed to create course' });
  }
});

// Edit a course (only owner)
router.put('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const payload = req.body || {};
    const updatable = [
      'title','shortDescription','fullDescription','category','subcategory','targetAudience','language',
      'thumbnailUrl','coverImageUrl','promoVideoUrl','price','discountPercent','affiliateCommissionPercent','tags','verifiedInstructor','published'
    ];
    updatable.forEach(k => {
      if (payload[k] !== undefined) course[k] = payload[k];
    });
    if (Array.isArray(payload.lessons)) course.lessons = payload.lessons;
    if (Array.isArray(payload.coupons)) course.coupons = payload.coupons;
    await course.save();
    res.json(course);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update course' });
  }
});

// Delete a course (only owner)
router.delete('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await course.deleteOne();
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete course' });
  }
});

// Enroll in a course (auth)
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const existing = await Enrollment.findOne({ user: req.user._id, course: course._id });
    if (existing) {
      return res.json(existing);
    }

    // TODO: handle payments/coupons. For now, always allow enrollment.
    const enrollment = new Enrollment({ user: req.user._id, course: course._id, completedLessonIds: [] });
    enrollment.recalculateProgress((course.lessons || []).length);
    await enrollment.save();
    res.status(201).json(enrollment);
  } catch (err) {
    console.error('Enroll error:', err);
    res.status(400).json({ message: 'Failed to enroll' });
  }
});

// Get enrollment status
router.get('/:id/enrollment', auth, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ user: req.user._id, course: req.params.id });
    if (!enrollment) return res.status(404).json({ message: 'Not enrolled' });
    res.json(enrollment);
  } catch (err) {
    res.status(400).json({ message: 'Failed to get enrollment' });
  }
});

// Get full course content if enrolled or owner
router.get('/:id/content', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const isOwner = course.owner.toString() === req.user._id.toString();
    const enrollment = await Enrollment.findOne({ user: req.user._id, course: course._id });
    const isEnrolled = !!enrollment;
    if (!isOwner && !isEnrolled) return res.status(403).json({ message: 'Access denied' });

    const lessons = (course.lessons || []).sort((a, b) => (a.order || 0) - (b.order || 0));
    res.json({
      _id: course._id,
      title: course.title,
      lessons,
      resources: []
    });
  } catch (err) {
    res.status(400).json({ message: 'Failed to get content' });
  }
});

// Mark lesson as complete
router.post('/:id/progress/:lessonId/complete', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const enrollment = await Enrollment.findOne({ user: req.user._id, course: course._id });
    if (!enrollment) return res.status(403).json({ message: 'Not enrolled' });

    const lessonId = req.params.lessonId;
    const already = (enrollment.completedLessonIds || []).some(id => id.toString() === lessonId);
    if (!already) enrollment.completedLessonIds.push(lessonId);
    enrollment.lastAccessedAt = new Date();
    enrollment.recalculateProgress((course.lessons || []).length);
    await enrollment.save();
    res.json(enrollment);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update progress' });
  }
});

// Get progress
router.get('/:id/progress', auth, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ user: req.user._id, course: req.params.id });
    if (!enrollment) return res.status(404).json({ message: 'Not enrolled' });
    res.json({ progressPercent: enrollment.progressPercent, completedLessonIds: enrollment.completedLessonIds || [] });
  } catch (err) {
    res.status(400).json({ message: 'Failed to get progress' });
  }
});

module.exports = router;