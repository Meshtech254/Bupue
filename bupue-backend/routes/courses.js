const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const auth = require('../middleware/auth');

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().populate('owner', 'username email').sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
});

// Get a single course by id
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('owner', 'username email');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(400).json({ message: 'Invalid course id' });
  }
});

// Create a course (auth required)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, price } = req.body;
    const course = new Course({
      title,
      description,
      price,
      owner: req.user._id
    });
    await course.save();
    res.status(201).json(course);
  } catch (err) {
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
    course.title = req.body.title || course.title;
    course.description = req.body.description || course.description;
    course.price = req.body.price || course.price;
    // ...add other fields as needed
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

module.exports = router; 