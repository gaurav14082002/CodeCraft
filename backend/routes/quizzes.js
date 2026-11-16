const express = require('express');
const router = express.Router();
const Lesson = require('../models/Lesson');
const Progress = require('../models/Progress');
const { protect } = require('../middleware/auth');

// @route   POST /api/quizzes/:lessonId/submit
// @desc    Submit answers for a quiz lesson, evaluate score, update progress
router.post('/:lessonId/submit', protect, async (req, res) => {
  try {
    const { answers } = req.body; // e.g. [0, 2, 1] - selected answer index for each question
    const { lessonId } = req.params;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Answers must be an array' });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson || !lesson.quiz || lesson.quiz.length === 0) {
      return res.status(404).json({ success: false, message: 'Quiz not found for this lesson' });
    }

    const questions = lesson.quiz;
    let score = 0;
    const review = [];

    questions.forEach((q, idx) => {
      const selected = answers[idx];
      const isCorrect = selected === q.correctAnswerIndex;
      if (isCorrect) score += 1;

      review.push({
        questionIndex: idx,
        question: q.question,
        options: q.options,
        userAnswer: selected !== undefined ? selected : null,
        correctAnswer: q.correctAnswerIndex,
        isCorrect,
        explanation: q.explanation || '',
      });
    });

    const total = questions.length;
    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= 70; // 70% passing grade

    // Update Progress
    let progress = await Progress.findOne({ user: req.user._id, course: lesson.course });
    if (!progress) {
      progress = await Progress.create({
        user: req.user._id,
        course: lesson.course,
        completedLessons: [],
        quizScores: [],
      });
    }

    // Save quiz attempt
    progress.quizScores.push({
      lesson: lesson._id,
      score,
      total,
      percentage,
      completedAt: new Date(),
    });

    // If passed, mark lesson as completed
    if (passed) {
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
      score,
      total,
      percentage,
      passed,
      review,
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

module.exports = router;
