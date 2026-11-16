'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, BookOpen, Star, Users, ArrowRight, Award } from 'lucide-react';

export default function CourseCard({ course }) {
  const isEnrolled = course.isEnrolled;
  const progressPercent = course.progress?.completionPercentage || 0;

  return (
    <div className="flex flex-col bg-[#0f1422] border border-gray-800 hover:border-brand-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/10 group">
      {/* Thumbnail */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-900">
        <img
          src={course.thumbnail || 'https://images.unsplash.com/photo-1516116211227-bbc14d489379?w=800'}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1422] via-transparent to-transparent opacity-80" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-brand-600/90 text-white backdrop-blur-md shadow-md">
            {course.category}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/60 text-gray-200 backdrop-blur-md border border-white/10">
            {course.level}
          </span>
        </div>

        {course.price === 0 && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/90 text-white uppercase tracking-wider">
              Free
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <Link href={`/courses/${course.slug}`}>
            <h3 className="font-bold text-lg text-white group-hover:text-brand-400 transition leading-snug line-clamp-1">
              {course.title}
            </h3>
          </Link>
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
            {course.tagline || course.description}
          </p>
        </div>

        {/* Instructor */}
        {course.instructor && (
          <div className="flex items-center space-x-2.5 pt-1">
            <img
              src={course.instructor.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={course.instructor.name}
              className="w-6 h-6 rounded-full object-cover border border-gray-700"
            />
            <span className="text-xs text-gray-300 font-medium">{course.instructor.name}</span>
          </div>
        )}

        {/* Course Meta Info */}
        <div className="grid grid-cols-3 gap-2 py-2.5 border-t border-b border-gray-800/80 text-[11px] text-gray-400">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-brand-400" />
            <span>{course.lessonCount || course.totalLessons || 5} Lessons</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{course.estimatedHours || 12}h</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span>{course.rating || 4.9}</span>
          </div>
        </div>

        {/* Progress Bar (if enrolled) */}
        {isEnrolled && (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-gray-400">
              <span>Course Progress</span>
              <span className="font-mono text-brand-400">{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-brand-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <div>
          <Link
            href={`/courses/${course.slug}`}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
              isEnrolled
                ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                : 'bg-gray-800 hover:bg-gray-750 text-white hover:bg-gray-700 border border-gray-700'
            }`}
          >
            <span>{isEnrolled ? 'Continue Course' : 'View Course & Syllabus'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
