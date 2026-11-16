'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Clock, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Sparkles, 
  Play, 
  Layers 
} from 'lucide-react';
import { fetcher } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function DashboardPage() {
  const { user, loading: authLoading, demoLogin } = useAuth();
  const router = useRouter();
  const [progresses, setProgresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      demoLogin('student');
    }
  }, [authLoading, user]);

  useEffect(() => {
    fetcher('/progress/my-courses')
      .then((res) => {
        if (res.success && res.progresses) {
          setProgresses(res.progresses);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="h-64 rounded-3xl bg-gray-900/50 animate-pulse border border-gray-800" />
      </div>
    );
  }

  // Calculate summary metrics
  const totalEnrolled = progresses.length;
  const completedCourses = progresses.filter((p) => p.isCompleted || p.completionPercentage >= 100);
  const certificatesEarned = progresses.filter((p) => p.certificateId);
  const totalCompletedLessons = progresses.reduce((acc, p) => acc + (p.completedLessons?.length || 0), 0);

  // Find most recently accessed course
  const activeCourse = progresses.length > 0 ? progresses[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#0d1527] via-[#0f1b33] to-[#121429] border border-gray-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-500/50 shadow-md"
          />
          <div className="space-y-1">
            <span className="text-xs font-mono text-brand-400 font-semibold uppercase">
              Student Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user?.name || 'Developer'}!
            </h1>
            <p className="text-xs text-gray-400">
              Keep building momentum. Practice code daily to retain algorithmic patterns.
            </p>
          </div>
        </div>

        <Link
          href="/courses"
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-500/25 flex items-center gap-2 transition"
        >
          <BookOpen className="w-4 h-4" />
          <span>Browse More Courses</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0f1424] border border-gray-800 space-y-1">
          <span className="text-xs text-gray-400 font-mono">Enrolled Courses</span>
          <div className="text-2xl font-extrabold text-white">{totalEnrolled}</div>
        </div>
        <div className="p-5 rounded-2xl bg-[#0f1424] border border-gray-800 space-y-1">
          <span className="text-xs text-gray-400 font-mono">Lessons Completed</span>
          <div className="text-2xl font-extrabold text-brand-400">{totalCompletedLessons}</div>
        </div>
        <div className="p-5 rounded-2xl bg-[#0f1424] border border-gray-800 space-y-1">
          <span className="text-xs text-gray-400 font-mono">Completed Tracks</span>
          <div className="text-2xl font-extrabold text-emerald-400">{completedCourses.length}</div>
        </div>
        <div className="p-5 rounded-2xl bg-[#0f1424] border border-gray-800 space-y-1">
          <span className="text-xs text-gray-400 font-mono">Certificates Earned</span>
          <div className="text-2xl font-extrabold text-purple-400">{certificatesEarned.length}</div>
        </div>
      </div>

      {/* Quick Resume Card */}
      {activeCourse && (
        <div className="p-6 rounded-2xl bg-[#0b101c] border border-brand-500/30 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-brand-400" />
              Continue Learning
            </span>
            <span className="text-xs text-gray-400 font-mono">
              {activeCourse.completionPercentage}% Completed
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <img
                src={activeCourse.course?.thumbnail}
                alt={activeCourse.course?.title}
                className="w-16 h-16 rounded-xl object-cover border border-gray-800 shrink-0"
              />
              <div>
                <h3 className="font-bold text-base text-white">{activeCourse.course?.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Next up: {activeCourse.lastAccessedLesson?.title || 'Next Lesson'}
                </p>
              </div>
            </div>

            <Link
              href={
                activeCourse.lastAccessedLesson
                  ? `/learn/${activeCourse.course?.slug}/${activeCourse.lastAccessedLesson._id}`
                  : `/courses/${activeCourse.course?.slug}`
              }
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-md flex items-center gap-2 transition shrink-0"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Resume Classroom</span>
            </Link>
          </div>

          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden mt-2">
            <div
              className="bg-brand-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${activeCourse.completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Enrolled Courses Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">My Courses</h2>

        {progresses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {progresses.map((p) => {
              const c = p.course;
              if (!c) return null;
              return (
                <div
                  key={p._id}
                  className="p-5 rounded-2xl bg-[#0f1424] border border-gray-800 hover:border-gray-700 flex flex-col justify-between space-y-4 transition"
                >
                  <div className="flex items-start space-x-4">
                    <img
                      src={c.thumbnail}
                      alt={c.title}
                      className="w-20 h-20 rounded-xl object-cover border border-gray-800 shrink-0"
                    />
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-brand-300">
                          {c.category}
                        </span>
                        {p.isCompleted && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                            Completed
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-white line-clamp-1">{c.title}</h3>
                      <p className="text-xs text-gray-400 font-mono">
                        {p.completedLessons?.length || 0} Lessons Completed
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] text-gray-400 font-mono">
                      <span>Progress</span>
                      <span className="text-brand-400">{p.completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-brand-500 h-1.5 rounded-full"
                        style={{ width: `${p.completionPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-800/80">
                    {p.certificateId ? (
                      <Link
                        href={`/certificate/${p.certificateId}`}
                        className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1.5"
                      >
                        <Award className="w-4 h-4" />
                        <span>View Certificate</span>
                      </Link>
                    ) : (
                      <span className="text-[11px] text-gray-500">Certificate at 100%</span>
                    )}

                    <Link
                      href={
                        p.lastAccessedLesson
                          ? `/learn/${c.slug}/${p.lastAccessedLesson._id}`
                          : `/courses/${c.slug}`
                      }
                      className="px-4 py-1.5 bg-gray-800 hover:bg-brand-600 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-[#0f1424] border border-gray-800 space-y-3">
            <BookOpen className="w-10 h-10 text-gray-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No active enrollments yet</h3>
            <p className="text-xs text-gray-400">
              Browse our course catalog and enroll in your first programming track!
            </p>
            <Link
              href="/courses"
              className="inline-block px-5 py-2.5 bg-brand-600 text-white text-xs font-semibold rounded-xl"
            >
              Explore Courses
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}
