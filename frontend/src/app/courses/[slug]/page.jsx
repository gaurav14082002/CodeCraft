'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpen, 
  Clock, 
  Star, 
  Users, 
  Play, 
  Code2, 
  HelpCircle, 
  FileText, 
  CheckCircle2, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck 
} from 'lucide-react';
import { fetcher } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, demoLogin } = useAuth();
  const slug = params?.slug;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    if (!slug) return;
    fetcher(`/courses/${slug}`)
      .then((res) => {
        if (res.success && res.course) {
          setCourse(res.course);
          // Expand all modules by default
          const exp = {};
          res.course.modules?.forEach((_, i) => {
            exp[i] = true;
          });
          setExpandedModules(exp);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  const toggleModule = (index) => {
    setExpandedModules((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleEnrollOrContinue = async () => {
    if (!course) return;

    // If not authenticated, do a quick demo login as student so experience is seamless!
    if (!user) {
      await demoLogin('student');
    }

    if (course.isEnrolled) {
      // Find next or first lesson
      const firstLesson = course.modules?.[0]?.lessons?.[0];
      const targetLessonId = course.progress?.lastAccessedLesson || firstLesson?._id;
      if (targetLessonId) {
        router.push(`/learn/${course.slug}/${targetLessonId}`);
      }
      return;
    }

    setEnrolling(true);
    try {
      const res = await fetcher(`/courses/${course._id}/enroll`, { method: 'POST' });
      if (res.success) {
        const firstLesson = course.modules?.[0]?.lessons?.[0];
        if (firstLesson) {
          router.push(`/learn/${course.slug}/${firstLesson._id}`);
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="h-64 rounded-3xl bg-gray-900/50 animate-pulse border border-gray-800" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Course Not Found</h2>
        <p className="text-sm text-gray-400">The requested course could not be located.</p>
        <Link href="/courses" className="inline-block px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-semibold">
          Back to Courses
        </Link>
      </div>
    );
  }

  const firstLesson = course.modules?.[0]?.lessons?.[0];

  return (
    <div className="pb-24">
      {/* Course Hero Header */}
      <div className="relative bg-[#0b101c] border-b border-gray-800 overflow-hidden py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
            
            {/* Left Info */}
            <div className="lg:col-span-2 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 font-mono">
                  {course.category}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
                  {course.level}
                </span>
                {course.isEnrolled && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="text-base text-gray-300 leading-relaxed max-w-2xl">
                {course.tagline || course.description}
              </p>

              {/* Meta metrics */}
              <div className="flex flex-wrap items-center gap-6 text-xs text-gray-400 pt-2 border-t border-gray-800/80 font-mono">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-bold">{course.rating}</span>
                  <span>({course.ratingCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-brand-400" />
                  <span>{course.studentsCount} Students Enrolled</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>{course.estimatedHours} Hours of Content</span>
                </div>
              </div>

              {/* Instructor badge */}
              {course.instructor && (
                <div className="flex items-center space-x-3 pt-2">
                  <img
                    src={course.instructor.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={course.instructor.name}
                    className="w-10 h-10 rounded-full object-cover border border-gray-700"
                  />
                  <div>
                    <span className="text-xs text-gray-400 block">Lead Instructor</span>
                    <span className="text-sm font-semibold text-white">{course.instructor.name}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Card / CTA Box */}
            <div className="bg-[#101726] border border-gray-800 rounded-3xl p-6 shadow-2xl space-y-6">
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-gray-900 border border-gray-800">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-brand-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                    <Play className="w-5 h-5 ml-0.5 fill-white" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-extrabold text-white">
                    {course.price === 0 ? 'FREE' : `$${course.price}`}
                  </div>
                  <span className="text-xs text-emerald-400 font-mono">Instant Unlimited Access</span>
                </div>

                <button
                  onClick={handleEnrollOrContinue}
                  disabled={enrolling}
                  className="w-full py-3.5 px-6 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <span>
                    {course.isEnrolled
                      ? 'Continue Learning'
                      : enrolling
                      ? 'Enrolling...'
                      : 'Enroll in Course (Free)'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-gray-400 space-y-2 border-t border-gray-800 pt-4">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-brand-400" />
                  <span>In-browser live code sandbox</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  <span>{course.totalLessons} Comprehensive lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Certificate of completion included</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Course Content & Syllabus Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Syllabus Accordion */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Course Syllabus</h2>
              <p className="text-xs text-gray-400 mt-1">
                {course.modules?.length || 0} Modules • {course.totalLessons || 0} Lessons
              </p>
            </div>

            {/* Modules List */}
            <div className="space-y-4">
              {course.modules?.map((module, modIdx) => {
                const isOpen = !!expandedModules[modIdx];
                return (
                  <div
                    key={modIdx}
                    className="border border-gray-800 rounded-2xl bg-[#0d121f] overflow-hidden transition"
                  >
                    <button
                      onClick={() => toggleModule(modIdx)}
                      className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-800/40 transition"
                    >
                      <div>
                        <span className="text-[11px] font-mono text-brand-400 uppercase tracking-wider font-semibold">
                          Module {module.index}
                        </span>
                        <h3 className="font-bold text-base text-white mt-0.5">{module.title}</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 font-mono">
                          {module.lessons.length} {module.lessons.length === 1 ? 'lesson' : 'lessons'}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {/* Module Lessons */}
                    {isOpen && (
                      <div className="border-t border-gray-800/80 divide-y divide-gray-800/60 bg-[#090d16]">
                        {module.lessons.map((lesson) => {
                          const isDone = course.progress?.completedLessons?.includes(lesson._id);
                          return (
                            <div
                              key={lesson._id}
                              className="p-4 flex items-center justify-between hover:bg-gray-800/30 transition group"
                            >
                              <div className="flex items-center space-x-3">
                                {isDone ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                ) : lesson.type === 'video' ? (
                                  <Play className="w-4 h-4 text-brand-400 shrink-0" />
                                ) : lesson.type === 'exercise' ? (
                                  <Code2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                ) : lesson.type === 'quiz' ? (
                                  <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                                ) : (
                                  <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                                )}

                                <div>
                                  <span className="text-xs font-medium text-gray-200 group-hover:text-brand-300 transition block">
                                    {lesson.title}
                                  </span>
                                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-500 font-mono">
                                    <span className="uppercase">{lesson.type}</span>
                                    <span>•</span>
                                    <span>{lesson.duration || '10 min'}</span>
                                  </div>
                                </div>
                              </div>

                              <Link
                                href={`/learn/${course.slug}/${lesson._id}`}
                                className="px-3 py-1 rounded-lg text-xs font-semibold text-gray-300 hover:text-white bg-gray-800 hover:bg-brand-600 transition"
                              >
                                {isDone ? 'Review' : 'Start'}
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar / Outcomes */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#0f1424] border border-gray-800 space-y-4">
              <h3 className="font-bold text-base text-white">What You Will Learn</h3>
              <ul className="space-y-3 text-xs text-gray-300">
                {course.syllabusOverview?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructor Bio Box */}
            {course.instructor && (
              <div className="p-6 rounded-2xl bg-[#0f1424] border border-gray-800 space-y-3">
                <span className="text-xs font-mono font-semibold text-purple-400 uppercase">
                  About the Instructor
                </span>
                <div className="flex items-center space-x-3 pt-1">
                  <img
                    src={course.instructor.avatar}
                    alt={course.instructor.name}
                    className="w-12 h-12 rounded-full object-cover border border-gray-700"
                  />
                  <div>
                    <h4 className="font-bold text-white text-sm">{course.instructor.name}</h4>
                    <span className="text-xs text-gray-400">Course Creator & Author</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {course.instructor.bio}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
