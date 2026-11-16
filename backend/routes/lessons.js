const express = require('express');
const router = express.Router();
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const { protect, optionalAuth, restrictTo } = require('../middleware/auth');

// @route   GET /api/lessons/:id
// @desc    Get single lesson with siblings for navigation
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('course', 'title slug instructor');

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    // Get previous and next lesson in course order
    const siblings = await Lesson.find({ course: lesson.course._id })
      .select('_id title type order moduleTitle slug')
      .sort({ order: 1 });

    const currentIndex = siblings.findIndex(l => l._id.toString() === lesson._id.toString());
    const prevLesson = currentIndex > 0 ? siblings[currentIndex - 1] : null;
    const nextLesson = currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;

    let isCompleted = false;
    if (req.user) {
      const progress = await Progress.findOne({
        user: req.user._id,
        course: lesson.course._id,
      });

      if (progress) {
        isCompleted = progress.completedLessons.some(l => l.toString() === lesson._id.toString());
        // Update last accessed lesson
        progress.lastAccessedLesson = lesson._id;
        await progress.save();
      }
    }

    // Hide solution code for regular students
    const lessonData = lesson.toObject();
    if (!req.user || req.user.role === 'student') {
      if (lessonData.exercise) {
        delete lessonData.exercise.solutionCode;
      }
    }

    res.json({
      success: true,
      lesson: lessonData,
      navigation: {
        prevLesson,
        nextLesson,
        currentIndex,
        totalLessons: siblings.length,
        allLessons: siblings,
      },
      isCompleted,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// @route   POST /api/lessons/:id/complete
// @desc    Mark lesson as completed
router.post('/:id/complete', protect, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    let progress = await Progress.findOne({
      user: req.user._id,
      course: lesson.course,
    });

    if (!progress) {
      progress = await Progress.create({
        user: req.user._id,
        course: lesson.course,
        completedLessons: [lesson._id],
        lastAccessedLesson: lesson._id,
      });
    } else {
      const alreadyIn = progress.completedLessons.some(l => l.toString() === lesson._id.toString());
      if (!alreadyIn) {
        progress.completedLessons.push(lesson._id);
      }
      progress.lastAccessedLesson = lesson._id;
    }

    // Recompute completion percentage
    const totalLessons = await Lesson.countDocuments({ course: lesson.course });
    const completedCount = progress.completedLessons.length;
    progress.completionPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    if (progress.completionPercentage >= 100 && !progress.isCompleted) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
      progress.certificateId = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    }

    await progress.save();

    res.json({
      success: true,
      message: 'Lesson marked as completed!',
      progress: {
        completedLessonsCount: progress.completedLessons.length,
        completionPercentage: progress.completionPercentage,
        isCompleted: progress.isCompleted,
        certificateId: progress.certificateId,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// @route   POST /api/lessons
// @desc    Create a lesson (Instructor/Admin)
router.post('/', protect, restrictTo('instructor', 'admin'), async (req, res) => {
  try {
    const { courseId, moduleTitle, title, type, duration, content, videoUrl, exercise, quiz, order } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const lastOrder = order !== undefined 
      ? order 
      : ((await Lesson.countDocuments({ course: courseId })) + 1);

    const lesson = await Lesson.create({
      course: courseId,
      moduleTitle: moduleTitle || 'General',
      title,
      slug,
      order: lastOrder,
      type: type || 'article',
      duration: duration || '10 min',
      content: content || '',
      videoUrl: videoUrl || '',
      exercise: exercise || {},
      quiz: quiz || [],
    });

    res.status(201).json({
      success: true,
      lesson,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
