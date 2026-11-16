'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Play, 
  Terminal, 
  Sparkles, 
  BookOpen, 
  Code2, 
  CheckCircle2, 
  Award, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Cpu, 
  Layers 
} from 'lucide-react';
import { fetcher } from '../lib/api';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { demoLogin } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Live sandbox demo on homepage
  const [demoCode, setDemoCode] = useState(`// Try running this live in your browser!
function findPrimes(max) {
  const primes = [];
  for (let num = 2; num <= max; num++) {
    let isPrime = true;
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) { isPrime = false; break; }
    }
    if (isPrime) primes.push(num);
  }
  return primes;
}

console.log("Primes up to 30:", findPrimes(30));
`);
  const [demoOutput, setDemoOutput] = useState('');
  const [isRunningDemo, setIsRunningDemo] = useState(false);

  useEffect(() => {
    fetcher('/courses')
      .then((res) => {
        if (res.success && res.courses) {
          setCourses(res.courses.slice(0, 3));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleRunDemo = async () => {
    setIsRunningDemo(true);
    setDemoOutput('Running code in sandbox...');
    try {
      const res = await fetcher('/runner/run', {
        method: 'POST',
        body: JSON.stringify({ code: demoCode, language: 'javascript' }),
      });
      if (res.success) {
        setDemoOutput(res.output || 'Code executed successfully with no output.');
      } else {
        setDemoOutput(`Error: ${res.error}`);
      }
    } catch (err) {
      setDemoOutput(`Error: ${err.message}`);
    } finally {
      setIsRunningDemo(false);
    }
  };

  return (
    <div className="space-y-24 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 lg:pt-20">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[250px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
            <span>Interactive Learning • Automated Test Runners • MERN Stack Architecture</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Learn Programming by <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
              Building & Testing Real Code
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Master full-stack JavaScript, Python, algorithms, and backend systems with instant automated test evaluations, structured video lessons, and verified developer certificates.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/courses"
              className="px-7 py-3.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-xl shadow-brand-500/25 flex items-center gap-2 transition group"
            >
              <span>Explore All Courses</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              onClick={() => demoLogin('student')}
              className="px-6 py-3.5 rounded-xl text-sm font-semibold text-gray-200 bg-gray-800/80 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 flex items-center gap-2 transition"
            >
              <Zap className="w-4 h-4 text-brand-400" />
              <span>One-Click Student Demo</span>
            </button>
          </div>

          {/* Platform Stat Strip */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto border-t border-gray-800/80 text-center font-mono">
            <div>
              <div className="text-2xl font-bold text-white">100%</div>
              <div className="text-xs text-gray-400 mt-0.5">Interactive Lessons</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-brand-400">&lt;50ms</div>
              <div className="text-xs text-gray-400 mt-0.5">Test Runner Latency</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">2 Languages</div>
              <div className="text-xs text-gray-400 mt-0.5">JavaScript & Python</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">Verified</div>
              <div className="text-xs text-gray-400 mt-0.5">Digital Certificates</div>
            </div>
          </div>

        </div>
      </section>

      {/* Live Interactive Code Playground Showcase */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0b101c] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-gray-800 gap-4">
            <div>
              <span className="text-xs font-mono text-brand-400 uppercase tracking-wider font-semibold">
                Live Playground Demo
              </span>
              <h3 className="text-xl font-bold text-white mt-1">Try the In-Browser Code Runner Right Now</h3>
              <p className="text-xs text-gray-400 mt-1">
                Execute safe sandboxed JavaScript or Python with captured stdout and instant runtime diagnostics.
              </p>
            </div>

            <button
              onClick={handleRunDemo}
              disabled={isRunningDemo}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-500/25 disabled:opacity-50 transition shrink-0"
            >
              <Play className={`w-4 h-4 ${isRunningDemo ? 'animate-spin' : ''}`} />
              {isRunningDemo ? 'Executing...' : 'Run Code Live'}
            </button>
          </div>

          {/* Interactive Code & Output Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            {/* Editor Area */}
            <div className="rounded-xl border border-gray-800 bg-[#070b13] overflow-hidden flex flex-col h-72">
              <div className="px-4 py-2 bg-[#101624] border-b border-gray-800 text-[11px] font-mono text-gray-400 flex items-center justify-between">
                <span>playground.js</span>
                <span className="text-brand-400">JavaScript Sandbox</span>
              </div>
              <textarea
                value={demoCode}
                onChange={(e) => setDemoCode(e.target.value)}
                className="flex-1 w-full p-4 bg-transparent text-gray-100 font-mono text-xs leading-5 resize-none focus:outline-none"
                spellCheck="false"
              />
            </div>

            {/* Output Console */}
            <div className="rounded-xl border border-gray-800 bg-[#070b13] overflow-hidden flex flex-col h-72">
              <div className="px-4 py-2 bg-[#101624] border-b border-gray-800 text-[11px] font-mono text-gray-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-brand-400" />
                  Terminal Output
                </span>
                <span className="text-emerald-400">stdout</span>
              </div>
              <div className="flex-1 p-4 font-mono text-xs overflow-auto">
                {demoOutput ? (
                  <pre className="text-emerald-300 whitespace-pre-wrap">{demoOutput}</pre>
                ) : (
                  <span className="text-gray-600 italic">
                    Output will stream here when you click &apos;Run Code Live&apos;.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-mono font-semibold text-brand-400 uppercase tracking-wider">
              Curated Curriculum
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Featured Coding Tracks
            </h2>
            <p className="text-sm text-gray-400 mt-1 max-w-xl">
              Engineered by experienced software architects with real-world programming exercises, automated test cases, and video masterclasses.
            </p>
          </div>

          <Link
            href="/courses"
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1.5 transition"
          >
            <span>View All Courses</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-96 rounded-2xl bg-gray-900/50 animate-pulse border border-gray-800" />
            ))
          ) : (
            courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))
          )}
        </div>
      </section>

      {/* Learning Architecture Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono font-semibold text-brand-400 uppercase tracking-wider">
            Why CodeCraft Works
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Designed for Active Developer Retention
          </h2>
          <p className="text-sm text-gray-400">
            Passive video watching leads to tutorial hell. CodeCraft forces you to write and test code at every step.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-[#0e1424] border border-gray-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white">Automated Test Runners</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Solve problems with instant unit test evaluations comparing expected vs actual output, including hidden edge case verification.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0e1424] border border-gray-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white">Structured Modular Syllabus</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Bite-sized modules featuring video lectures, markdown technical deep-dives, coding exercises, and knowledge check quizzes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0e1424] border border-gray-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white">Verifiable Certificates</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Earn digitally signed certificates upon completing all course lessons and passing exercises, shareable with recruiters and LinkedIn.
            </p>
          </div>
        </div>
      </section>

      {/* Instructor CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-brand-900/40 via-[#10182b] to-purple-900/40 border border-gray-700/80 p-8 sm:p-12 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-mono font-semibold text-purple-300 uppercase tracking-wider">
              Instructor Studio
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Teach Code & Publish Interactive Challenges
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Create rich courses with customized test suites, quizzes, and multimedia lessons in our dedicated instructor portal.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => demoLogin('instructor')}
              className="px-6 py-3 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30 transition flex items-center gap-2 justify-center"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore Instructor Studio</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
