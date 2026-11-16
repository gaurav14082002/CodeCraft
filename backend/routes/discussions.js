const express = require('express');
const router = express.Router();
const Discussion = require('../models/Discussion');
const { protect } = require('../middleware/auth');

// @route   GET /api/discussions/lesson/:lessonId
// @desc    Get all questions for a lesson
router.get('/lesson/:lessonId', async (req, res) => {
  try {
    const discussions = await Discussion.find({ lesson: req.params.lessonId })
      .populate('user', 'name avatar role')
      .populate('replies.user', 'name avatar role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      discussions,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// @route   POST /api/discussions/lesson/:lessonId
// @desc    Post a new question
router.post('/lesson/:lessonId', protect, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const discussion = await Discussion.create({
      lesson: req.params.lessonId,
      user: req.user._id,
      title,
      content,
    });

    await discussion.populate('user', 'name avatar role');

    res.status(201).json({
      success: true,
      discussion,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// @route   POST /api/discussions/:id/reply
// @desc    Reply to a discussion
router.post('/:id/reply', protect, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: 'Reply content is required' });
    }

    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }

    discussion.replies.push({
      user: req.user._id,
      content,
    });

    await discussion.save();
    await discussion.populate('replies.user', 'name avatar role');

    res.json({
      success: true,
      discussion,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
