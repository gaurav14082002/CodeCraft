const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide course title'],
    trim: true,
    maxlength: 120,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  tagline: {
    type: String,
    required: [true, 'Please provide a short tagline'],
    maxlength: 200,
  },
  description: {
    type: String,
    required: [true, 'Please provide full course description'],
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Web Development', 'Python & Data', 'Algorithms & DSA', 'Backend Engineering', 'Full-Stack'],
    default: 'Web Development',
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
    default: 'Beginner',
  },
  thumbnail: {
    type: String,
    default: 'https://images.unsplash.com/photo-1516116211227-bbc14d489379?w=800&auto=format&fit=crop&q=60',
  },
  price: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 4.8,
  },
  ratingCount: {
    type: Number,
    default: 120,
  },
  studentsCount: {
    type: Number,
    default: 0,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  estimatedHours: {
    type: Number,
    default: 20,
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  syllabusOverview: [{
    type: String,
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual populate for lessons
courseSchema.virtual('lessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'course',
  options: { sort: { order: 1 } },
});

module.exports = mongoose.model('Course', courseSchema);
