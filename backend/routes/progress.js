const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const { protect, optionalAuth } = require('../middleware/auth');

// @route   GET /api/progress/my-courses
// @desc    Get current user's enrolled courses and progress overview
router.get('/my-courses', protect, async (req, res) => {
  try {
    const progresses = await Progress.find({ user: req.user._id })
      .populate({
        path: 'course',
        select: 'title slug thumbnail category level estimatedHours instructor',
        populate: {
          path: 'instructor',
          select: 'name avatar',
        },
      })
      .populate('lastAccessedLesson', 'title slug order type');

    res.json({
      success: true,
      count: progresses.length,
      progresses,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// @route   GET /api/progress/course/:courseId
// @desc    Get user progress for a specific course
router.get('/course/:courseId', protect, async (req, res) => {
  try {
    const progress = await Progress.findOne({
      user: req.user._id,
      course: req.params.courseId,
    }).populate('completedLessons', '_id title type order');

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'No progress found for this course. Enroll first.',
      });
    }

    res.json({
      success: true,
      progress,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// @route   GET /api/progress/certificate/:certificateId
// @desc    Public verification of completion certificate
router.get('/certificate/:certificateId', optionalAuth, async (req, res) => {
  try {
    const { certificateId } = req.params;

    const progress = await Progress.findOne({ certificateId })
      .populate('user', 'name email avatar')
      .populate({
        path: 'course',
        select: 'title slug category level estimatedHours instructor',
        populate: {
          path: 'instructor',
          select: 'name avatar bio',
        },
      });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found or invalid certificate ID',
      });
    }

    res.json({
      success: true,
      certificate: {
        certificateId: progress.certificateId,
        studentName: progress.user.name,
        courseTitle: progress.course.title,
        category: progress.course.category,
        level: progress.course.level,
        instructorName: progress.course.instructor ? progress.course.instructor.name : 'CodeCraft Academy',
        completedAt: progress.completedAt || progress.updatedAt,
        issuedBy: 'CodeCraft Learning Institute',
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
