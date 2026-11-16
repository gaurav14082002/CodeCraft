const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const User = require('../models/User');
const Progress = require('../models/Progress');
const { protect, optionalAuth, restrictTo } = require('../middleware/auth');

// @route   GET /api/courses
// @desc    Get all published courses with filtering, search & pagination
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, level, search, sort = 'popular' } = req.query;

    const query = { isPublished: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (level && level !== 'All') {
      query.level = level;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tagline: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    let sortOption = { studentsCount: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'popular') sortOption = { studentsCount: -1 };

    const courses = await Course.find(query)
      .populate('instructor', 'name avatar bio')
      .populate('lessons', '_id title type duration moduleTitle order')
      .sort(sortOption);

    // If user is authenticated, attach user's enrollment status
    let enrolledCourseIds = new Set();
    if (req.user) {
      const user = await User.findById(req.user._id).select('enrolledCourses');
      if (user && user.enrolledCourses) {
        enrolledCourseIds = new Set(user.enrolledCourses.map(e => e.course.toString()));
      }
    }

    const coursesWithMeta = courses.map(course => {
      const c = course.toObject();
      c.isEnrolled = enrolledCourseIds.has(c._id.toString());
      c.lessonCount = c.lessons ? c.lessons.length : 0;
      return c;
    });

    res.json({
      success: true,
      count: coursesWithMeta.length,
      courses: coursesWithMeta,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// @route   GET /api/courses/:slugOrId
// @desc    Get single course details by slug or ID with modules and lessons
router.get('/:slugOrId', optionalAuth, async (req, res) => {
  try {
    const { slugOrId } = req.params;

    let course;
    if (slugOrId.match(/^[0-9a-fA-F]{24}$/)) {
      course = await Course.findById(slugOrId).populate('instructor', 'name avatar bio');
    } else {
      course = await Course.findOne({ slug: slugOrId }).populate('instructor', 'name avatar bio');
    }

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Get all lessons for this course ordered by module and sequence
    const lessons = await Lesson.find({ course: course._id })
      .select('-exercise.solutionCode') // hide solution code from public syllabus
      .sort({ order: 1 });

    // Group lessons into modules
    const modulesMap = {};
    lessons.forEach(lesson => {
      const mod = lesson.moduleTitle || 'General';
      if (!modulesMap[mod]) {
        modulesMap[mod] = [];
      }
      modulesMap[mod].push(lesson);
    });

    const modules = Object.keys(modulesMap).map((title, index) => ({
      index: index + 1,
      title,
      lessons: modulesMap[title],
    }));

    let isEnrolled = false;
    let progress = null;

    if (req.user) {
      const user = await User.findById(req.user._id);
      isEnrolled = user.enrolledCourses.some(e => e.course.toString() === course._id.toString());

      if (isEnrolled) {
        progress = await Progress.findOne({ user: req.user._id, course: course._id });
      }
    }

    res.json({
      success: true,
      course: {
        ...course.toObject(),
        modules,
        totalLessons: lessons.length,
        isEnrolled,
        progress,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// @route   POST /api/courses/:id/enroll
// @desc    Enroll authenticated user in a course
router.post('/:id/enroll', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const user = await User.findById(req.user._id);

    const alreadyEnrolled = user.enrolledCourses.some(
      e => e.course.toString() === course._id.toString()
    );

    if (!alreadyEnrolled) {
      user.enrolledCourses.push({ course: course._id, enrolledAt: new Date() });
      await user.save();

      course.studentsCount += 1;
      await course.save();

      // Find first lesson for default lastAccessed
      const firstLesson = await Lesson.findOne({ course: course._id }).sort({ order: 1 });

      await Progress.create({
        user: user._id,
        course: course._id,
        completedLessons: [],
        lastAccessedLesson: firstLesson ? firstLesson._id : null,
        completionPercentage: 0,
      });
    }

    res.json({
      success: true,
      message: 'Successfully enrolled in course!',
      courseId: course._id,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// @route   POST /api/courses
// @desc    Create a new course (Instructor / Admin only)
router.post('/', protect, restrictTo('instructor', 'admin'), async (req, res) => {
  try {
    const { title, tagline, description, category, level, thumbnail, price, estimatedHours, tags, syllabusOverview } = req.body;

    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (await Course.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const course = await Course.create({
      title,
      slug,
      tagline: tagline || title,
      description,
      category: category || 'Web Development',
      level: level || 'Beginner',
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516116211227-bbc14d489379?w=800&auto=format&fit=crop&q=60',
      price: price || 0,
      estimatedHours: estimatedHours || 10,
      tags: tags || ['Programming', 'Code'],
      syllabusOverview: syllabusOverview || [],
      instructor: req.user._id,
    });

    res.status(201).json({
      success: true,
      course,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update course
router.put('/:id', protect, restrictTo('instructor', 'admin'), async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check ownership if instructor
    if (req.user.role === 'instructor' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not the creator of this course' });
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    res.json({
      success: true,
      course,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
