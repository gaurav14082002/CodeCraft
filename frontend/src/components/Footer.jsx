'use client';

import React from 'react';
import Link from 'next/link';
import { Terminal, Github, Heart, Layers, Database, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-[#070a12] text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <Terminal className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-white text-lg tracking-tight">CodeCraft</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            The next-generation interactive programming learning platform with real in-browser execution, automated test runners, and developer certifications.
          </p>
          <div className="flex items-center space-x-2 text-xs text-gray-500 font-mono">
            <span>Powered by</span>
            <span className="text-gray-300">Next.js</span>
            <span>•</span>
            <span className="text-gray-300">Express.js</span>
            <span>•</span>
            <span className="text-gray-300">MongoDB</span>
          </div>
        </div>

        {/* Tracks */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-200 mb-4 font-mono">
            Learning Paths
          </h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/courses?category=Web+Development" className="hover:text-brand-400 transition">Modern JavaScript & Web</Link></li>
            <li><Link href="/courses?category=Python+%26+Data" className="hover:text-brand-400 transition">Python & Data Structures</Link></li>
            <li><Link href="/courses?category=Algorithms+%26+DSA" className="hover:text-brand-400 transition">Algorithms & Interview Prep</Link></li>
            <li><Link href="/courses?category=Backend+Engineering" className="hover:text-brand-400 transition">Backend Systems & APIs</Link></li>
          </ul>
        </div>

        {/* Features */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-200 mb-4 font-mono">
            Platform Features
          </h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-brand-400" /> In-Browser Code Sandboxes</li>
            <li className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-emerald-400" /> Automated Test Runners</li>
            <li className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-purple-400" /> Verified Course Certificates</li>
            <li className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-amber-400" /> Interactive Quizzes & Lessons</li>
          </ul>
        </div>

        {/* Quick Demo */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-200 mb-2 font-mono">
            Demo Credentials
          </h4>
          <div className="bg-[#0e1424] p-3 rounded-lg border border-gray-800 text-[11px] font-mono space-y-1.5">
            <div><span className="text-gray-500">Student:</span> <span className="text-brand-300">student@codecraft.dev</span></div>
            <div><span className="text-gray-500">Instructor:</span> <span className="text-purple-300">instructor@codecraft.dev</span></div>
            <div><span className="text-gray-500">Password:</span> <span className="text-emerald-400">password123</span></div>
          </div>
          <p className="text-[11px] text-gray-500">Or use the 1-click Demo Role Switcher at the top!</p>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
        <p>© 2026 CodeCraft Online Academy. Built with Next.js, Express & MongoDB.</p>
        <p className="flex items-center gap-1 mt-2 sm:mt-0">
          Crafted for high performance interactive coding education
        </p>
      </div>
    </footer>
  );
}
