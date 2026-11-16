'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { 
  Terminal, 
  BookOpen, 
  LayoutDashboard, 
  Sparkles, 
  LogOut, 
  User, 
  Menu, 
  X, 
  Code2, 
  ChevronDown 
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, demoLogin, isInstructor } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // If inside full-screen classroom view, hide standard navbar or keep it minimal
  const isClassroom = pathname.startsWith('/learn/');

  const handleDemoSwitch = async (role) => {
    try {
      await demoLogin(role);
      setDemoDropdownOpen(false);
      setMobileMenuOpen(false);
      if (role === 'instructor') {
        router.push('/instructor');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isClassroom) {
    return null; // Classroom has its own specialized topbar
  }

  return (
    <header className="sticky top-0 z-50 bg-[#090d16]/90 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition">
                <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-brand-400 group-hover:scale-110 transition duration-200" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
                  CodeCraft <span className="text-xs px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 font-mono font-medium border border-brand-500/30">PRO</span>
                </span>
                <span className="text-[10px] text-gray-400 tracking-wider font-mono">INTERACTIVE ACADEMY</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 ml-8">
              <Link
                href="/courses"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  pathname.startsWith('/courses')
                    ? 'text-brand-400 bg-brand-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Courses
              </Link>

              {user && (
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                    pathname === '/dashboard'
                      ? 'text-brand-400 bg-brand-500/10'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  My Dashboard
                </Link>
              )}

              {isInstructor && (
                <Link
                  href="/instructor"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                    pathname.startsWith('/instructor')
                      ? 'text-purple-400 bg-purple-500/10'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Instructor Studio
                </Link>
              )}
            </nav>
          </div>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Quick Demo Login Pill */}
            <div className="relative">
              <button
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full bg-gray-800/80 hover:bg-gray-800 text-gray-300 border border-gray-700 transition"
              >
                <Code2 className="w-3.5 h-3.5 text-brand-400" />
                <span>Demo Role Switcher</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {demoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#131b2c] border border-gray-700 shadow-xl py-2 z-50">
                  <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Instant Demo Login
                  </div>
                  <button
                    onClick={() => handleDemoSwitch('student')}
                    className="w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-brand-500/20 hover:text-white flex items-center justify-between"
                  >
                    <span>🎓 Sarah Miller (Student)</span>
                    <span className="text-[10px] text-brand-400 font-mono">Student</span>
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('instructor')}
                    className="w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-purple-500/20 hover:text-white flex items-center justify-between"
                  >
                    <span>👨‍🏫 Alex Chen (Instructor)</span>
                    <span className="text-[10px] text-purple-400 font-mono">Author</span>
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center space-x-3 pl-2 border-l border-gray-800">
                <Link href="/dashboard" className="flex items-center space-x-2 group">
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-gray-700 object-cover group-hover:border-brand-500 transition"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-white group-hover:text-brand-400 transition">{user.name}</span>
                    <span className="text-[10px] text-gray-400 capitalize">{user.role}</span>
                  </div>
                </Link>

                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800/60 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/60 rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-lg shadow-brand-500/25 transition"
                >
                  Start Learning
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-[#0d1322] px-4 pt-3 pb-5 space-y-3">
          <Link
            href="/courses"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-200 hover:bg-gray-800"
          >
            Explore Courses
          </Link>

          {user && (
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-gray-200 hover:bg-gray-800"
            >
              My Dashboard
            </Link>
          )}

          {isInstructor && (
            <Link
              href="/instructor"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-purple-300 hover:bg-gray-800"
            >
              Instructor Studio
            </Link>
          )}

          <div className="pt-2 border-t border-gray-800 space-y-2">
            <div className="text-xs text-gray-400 font-semibold px-2">Quick Demo Access:</div>
            <div className="flex gap-2">
              <button
                onClick={() => handleDemoSwitch('student')}
                className="flex-1 py-1.5 px-2 text-xs bg-gray-800 rounded border border-gray-700 text-gray-300"
              >
                🎓 Student View
              </button>
              <button
                onClick={() => handleDemoSwitch('instructor')}
                className="flex-1 py-1.5 px-2 text-xs bg-gray-800 rounded border border-gray-700 text-purple-300"
              >
                👨‍🏫 Instructor View
              </button>
            </div>
          </div>

          {user ? (
            <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
              <span className="text-sm text-gray-300">{user.name} ({user.role})</span>
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="text-xs text-red-400 hover:underline"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-gray-800 grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm bg-gray-800 rounded-lg text-gray-200"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm bg-brand-600 rounded-lg text-white font-medium"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
