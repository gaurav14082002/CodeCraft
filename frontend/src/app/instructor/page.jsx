'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Sparkles, 
  BookOpen, 
  Users, 
  Code2, 
  CheckCircle2, 
  Video, 
  FileText, 
  HelpCircle, 
  Layers 
} from 'lucide-react';
import { fetcher } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function InstructorPage() {
  const { user, demoLogin } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Course Modal
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '',
    tagline: '',
    description: '',
    category: 'Web Development',
    level: 'Beginner',
    thumbnail: 'https://images.unsplash.com/photo-1516116211227-bbc14d489379?w=800',
    estimatedHours: 12,
  });

  // New Lesson Modal
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [lessonForm, setLessonForm] = useState({
    moduleTitle: 'Module 1: Foundations',
    title: '',
    type: 'exercise',
    duration: '15 min',
    content: '',
    language: 'javascript',
    starterCode: '// Starter code here\nfunction solve(input) {\n  return input;\n}',
    testCasesInput: 'solve("hello")',
    testCasesExpected: '"hello"',
  });

  const loadCourses = async () => {
    try {
      const res = await fetcher('/courses');
      if (res.success && res.courses) {
        setCourses(res.courses);
        if (res.courses.length > 0 && !selectedCourseId) {
          setSelectedCourseId(res.courses[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If not logged in as instructor, automatically switch to demo instructor
    if (user && user.role !== 'instructor') {
      demoLogin('instructor');
    }
    loadCourses();
  }, [user]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.title.trim() || !courseForm.description.trim()) {
      return alert('Please fill in title and description');
    }

    try {
      const res = await fetcher('/courses', {
        method: 'POST',
        body: JSON.stringify(courseForm),
      });

      if (res.success) {
        setShowCourseModal(false);
        setCourseForm({
          title: '',
          tagline: '',
          description: '',
          category: 'Web Development',
          level: 'Beginner',
          thumbnail: 'https://images.unsplash.com/photo-1516116211227-bbc14d489379?w=800',
          estimatedHours: 12,
        });
        loadCourses();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    if (!selectedCourseId || !lessonForm.title.trim()) {
      return alert('Please select a course and enter lesson title');
    }

    const payload = {
      courseId: selectedCourseId,
      moduleTitle: lessonForm.moduleTitle,
      title: lessonForm.title,
      type: lessonForm.type,
      duration: lessonForm.duration,
      content: lessonForm.content,
    };

    if (lessonForm.type === 'exercise') {
      payload.exercise = {
        language: lessonForm.language,
        instructions: lessonForm.content,
        starterCode: lessonForm.starterCode,
        testCases: [
          {
            description: 'Sample Test Case',
            input: lessonForm.testCasesInput,
            expectedOutput: lessonForm.testCasesExpected,
            isHidden: false,
          },
        ],
      };
    }

    try {
      const res = await fetcher('/lessons', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setShowLessonModal(false);
        alert('Lesson added successfully!');
        loadCourses();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const totalStudents = courses.reduce((acc, c) => acc + (c.studentsCount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Studio Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-950/40 via-[#121626] to-brand-950/40 border border-purple-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-mono font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Instructor Studio Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Course Authoring & Management
          </h1>
          <p className="text-xs text-gray-400">
            Publish courses, configure automated unit test challenges, and track global student engagement.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowCourseModal(true)}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-md flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Course</span>
          </button>
          <button
            onClick={() => setShowLessonModal(true)}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl shadow-md flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lesson</span>
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#0f1424] border border-gray-800 space-y-1">
          <span className="text-xs text-gray-400 font-mono">Published Courses</span>
          <div className="text-3xl font-extrabold text-white">{courses.length}</div>
        </div>
        <div className="p-6 rounded-2xl bg-[#0f1424] border border-gray-800 space-y-1">
          <span className="text-xs text-gray-400 font-mono">Total Student Enrollments</span>
          <div className="text-3xl font-extrabold text-purple-400">{totalStudents}</div>
        </div>
        <div className="p-6 rounded-2xl bg-[#0f1424] border border-gray-800 space-y-1">
          <span className="text-xs text-gray-400 font-mono">Live Automated Sandbox</span>
          <div className="text-3xl font-extrabold text-emerald-400">Active</div>
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Your Courses</h2>

        <div className="space-y-3">
          {courses.map((c) => (
            <div
              key={c._id}
              className="p-5 rounded-2xl bg-[#0d121f] border border-gray-800 hover:border-gray-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={c.thumbnail}
                  alt={c.title}
                  className="w-16 h-16 rounded-xl object-cover border border-gray-800 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-500/10 text-brand-400">
                      {c.category}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                      {c.level}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white mt-1">{c.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-400 font-mono mt-1">
                    <span>{c.lessonCount || c.lessons?.length || 5} Lessons</span>
                    <span>•</span>
                    <span>{c.studentsCount} Students</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/courses/${c.slug}`}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white rounded-lg transition"
                >
                  View Syllabus
                </Link>
                <button
                  onClick={() => {
                    setSelectedCourseId(c._id);
                    setShowLessonModal(true);
                  }}
                  className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold rounded-lg transition"
                >
                  + Add Lesson
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Create Course */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1424] border border-gray-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-5 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white">Create New Course</h3>

            <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-medium mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder="e.g. Mastering Golang for Distributed Systems"
                  className="w-full px-3 py-2 bg-[#090d16] border border-gray-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Tagline</label>
                <input
                  type="text"
                  required
                  value={courseForm.tagline}
                  onChange={(e) => setCourseForm({ ...courseForm, tagline: e.target.value })}
                  placeholder="Short, punchy summary..."
                  className="w-full px-3 py-2 bg-[#090d16] border border-gray-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Full Description</label>
                <textarea
                  rows={3}
                  required
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="What will developers achieve after completing this course?"
                  className="w-full px-3 py-2 bg-[#090d16] border border-gray-700 rounded-lg text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Category</label>
                  <select
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090d16] border border-gray-700 rounded-lg text-white"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Python & Data">Python & Data</option>
                    <option value="Algorithms & DSA">Algorithms & DSA</option>
                    <option value="Backend Engineering">Backend Engineering</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 font-medium mb-1">Level</label>
                  <select
                    value={courseForm.level}
                    onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090d16] border border-gray-700 rounded-lg text-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 rounded-lg text-white font-semibold"
                >
                  Publish Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Lesson */}
      {showLessonModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1424] border border-gray-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-5 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white">Add New Lesson</h3>

            <form onSubmit={handleCreateLesson} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Target Course</label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090d16] border border-gray-700 rounded-lg text-white"
                  >
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 font-medium mb-1">Module Title</label>
                  <input
                    type="text"
                    required
                    value={lessonForm.moduleTitle}
                    onChange={(e) => setLessonForm({ ...lessonForm, moduleTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090d16] border border-gray-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-gray-400 font-medium mb-1">Lesson Title</label>
                  <input
                    type="text"
                    required
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    placeholder="e.g. Binary Search Tree Inversion"
                    className="w-full px-3 py-2 bg-[#090d16] border border-gray-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-medium mb-1">Lesson Type</label>
                  <select
                    value={lessonForm.type}
                    onChange={(e) => setLessonForm({ ...lessonForm, type: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090d16] border border-gray-700 rounded-lg text-white"
                  >
                    <option value="exercise">Coding Exercise</option>
                    <option value="video">Video Masterclass</option>
                    <option value="article">Technical Article</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Instructions / Markdown Notes</label>
                <textarea
                  rows={3}
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                  placeholder="Markdown explanation or problem description..."
                  className="w-full px-3 py-2 bg-[#090d16] border border-gray-700 rounded-lg text-white"
                />
              </div>

              {lessonForm.type === 'exercise' && (
                <div className="space-y-3 p-4 rounded-xl bg-gray-900/60 border border-gray-800">
                  <span className="font-semibold text-emerald-400 block">Coding Exercise Configuration</span>
                  <div>
                    <label className="block text-gray-400 font-medium mb-1">Starter Code</label>
                    <textarea
                      rows={3}
                      value={lessonForm.starterCode}
                      onChange={(e) => setLessonForm({ ...lessonForm, starterCode: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090d16] border border-gray-700 rounded-lg text-gray-200 font-mono text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-400 font-medium mb-1">Test Input</label>
                      <input
                        type="text"
                        value={lessonForm.testCasesInput}
                        onChange={(e) => setLessonForm({ ...lessonForm, testCasesInput: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090d16] border border-gray-700 rounded-lg text-gray-200 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 font-medium mb-1">Expected Output</label>
                      <input
                        type="text"
                        value={lessonForm.testCasesExpected}
                        onChange={(e) => setLessonForm({ ...lessonForm, testCasesExpected: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090d16] border border-gray-700 rounded-lg text-gray-200 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-semibold"
                >
                  Save & Publish Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
