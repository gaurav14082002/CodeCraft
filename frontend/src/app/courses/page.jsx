'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Sparkles, SlidersHorizontal } from 'lucide-react';
import { fetcher } from '../../lib/api';
import CourseCard from '../../components/CourseCard';

const CATEGORIES = ['All', 'Web Development', 'Python & Data', 'Algorithms & DSA', 'Backend Engineering'];
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced', 'All Levels'];

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  const [sort, setSort] = useState('popular');

  const loadCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (category !== 'All') params.append('category', category);
      if (level !== 'All') params.append('level', level);
      if (sort) params.append('sort', sort);

      const res = await fetcher(`/courses?${params.toString()}`);
      if (res.success && res.courses) {
        setCourses(res.courses);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [category, level, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCourses();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="space-y-2">
        <span className="text-xs font-mono font-semibold text-brand-400 uppercase tracking-wider">
          Explore Academy
        </span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Explore Programming Courses
        </h1>
        <p className="text-sm text-gray-400 max-w-2xl">
          Deep-dive tracks covering frontend, backend, algorithms, and data structures with live code execution and automated test runners.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0f1424] border border-gray-800 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search courses by keyword, topic, or language (e.g. JavaScript, Python, Scope)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090d16] border border-gray-700/80 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-md transition"
          >
            Search
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-800/80">
          
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-gray-400 font-mono mr-2">Category:</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  category === cat
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Level & Sort Dropdowns */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400 font-mono">Level:</span>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="bg-[#090d16] border border-gray-700 text-xs text-gray-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-brand-500"
              >
                {LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400 font-mono">Sort:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-[#090d16] border border-gray-700 text-xs text-gray-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-brand-500"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-96 rounded-2xl bg-gray-900/40 animate-pulse border border-gray-800" />
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center rounded-2xl bg-[#0f1424] border border-gray-800 space-y-3">
          <BookOpen className="w-10 h-10 text-gray-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No courses found</h3>
          <p className="text-xs text-gray-400">
            Try adjusting your search keywords or removing selected filters.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setCategory('All');
              setLevel('All');
            }}
            className="mt-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white rounded-lg"
          >
            Reset Filters
          </button>
        </div>
      )}

    </div>
  );
}
