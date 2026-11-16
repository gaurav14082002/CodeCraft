const express = require('express');
const router = express.Router();
const Lesson = require('../models/Lesson');
const Submission = require('../models/Submission');
const Progress = require('../models/Progress');
const { protect } = require('../middleware/auth');
const { executeJavaScript, executePython } = require('../utils/codeExecutor');

// @route   POST /api/submissions/:lessonId
// @desc    Submit code solution for an exercise lesson, run tests and record submission
router.post('/:lessonId', protect, async (req, res) => {
  try {
    const { code } = req.body;
    const { lessonId } = req.params;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Code is required' });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    const exercise = lesson.exercise;
    if (!exercise || !exercise.testCases || exercise.testCases.length === 0) {
      return res.status(400).json({ success: false, message: 'This lesson does not have coding test cases' });
    }

    // Execute test cases
    let execResult;
    const language = exercise.language || 'javascript';

    if (language === 'python') {
      execResult = await executePython(code, exercise.testCases);
    } else {
      execResult = await executeJavaScript(code, exercise.testCases);
    }

    const allPassed = !!execResult.allPassed;
    const testResults = execResult.testResults || [];

    // Save submission to DB
    const submission = await Submission.create({
      user: req.user._id,
      lesson: lesson._id,
      code,
      language,
      status: allPassed ? 'passed' : 'failed',
      testResults,
      totalTests: exercise.testCases.length,
      passedTests: execResult.passedCount || 0,
      executionTimeMs: execResult.executionTime || 0,
    });

    // Update Progress
    let progress = await Progress.findOne({ user: req.user._id, course: lesson.course });
    if (!progress) {
      progress = await Progress.create({
        user: req.user._id,
        course: lesson.course,
        completedLessons: [],
        exerciseSubmissions: [],
      });
    }

    // Record submission in progress
    progress.exerciseSubmissions.push({
      lesson: lesson._id,
      code,
      passed: allPassed,
      submittedAt: new Date(),
    });

    // If passed all tests, auto-mark lesson completed
    if (allPassed) {
      const alreadyIn = progress.completedLessons.some(l => l.toString() === lesson._id.toString());
      if (!alreadyIn) {
        progress.completedLessons.push(lesson._id);
      }
      
      const totalLessons = await Lesson.countDocuments({ course: lesson.course });
      progress.completionPercentage = totalLessons > 0 ? Math.round((progress.completedLessons.length / totalLessons) * 100) : 0;
      
      if (progress.completionPercentage >= 100 && !progress.isCompleted) {
        progress.isCompleted = true;
        progress.completedAt = new Date();
        progress.certificateId = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      }
    }

    await progress.save();

    res.json({
      success: true,
      allPassed,
      passedCount: execResult.passedCount || 0,
      totalCount: exercise.testCases.length,
      testResults,
      executionTime: execResult.executionTime,
      submissionId: submission._id,
      progress: {
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

// @route   GET /api/submissions/:lessonId
// @desc    Get user's previous submissions for a lesson
router.get('/:lessonId', protect, async (req, res) => {
  try {
    const submissions = await Submission.find({
      user: req.user._id,
      lesson: req.params.lessonId,
    }).sort({ createdAt: -1 }).limit(10);

    res.json({
      success: true,
      submissions,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
