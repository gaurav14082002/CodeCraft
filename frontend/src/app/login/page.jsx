'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Terminal, Lock, Mail, ArrowRight, Zap, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, demoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role) => {
    setError(null);
    setLoading(true);
    try {
      await demoLogin(role);
      if (role === 'instructor') {
        router.push('/instructor');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-16">
      <div className="max-w-md w-full rounded-3xl bg-[#0f1424] border border-gray-800 p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-500/30">
            <Terminal className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
          <p className="text-xs text-gray-400">
            Sign in to continue your programming curriculum
          </p>
        </div>

        {/* 1-Click Demo Logins */}
        <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-2.5">
          <span className="text-[11px] font-mono text-gray-400 font-semibold uppercase tracking-wider block text-center">
            Instant Demo Access
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemo('student')}
              className="py-2 px-3 text-xs bg-brand-600/15 hover:bg-brand-600/25 text-brand-300 border border-brand-500/30 rounded-xl font-medium transition flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-brand-400" />
              <span>Student Demo</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemo('instructor')}
              className="py-2 px-3 text-xs bg-purple-600/15 hover:bg-purple-600/25 text-purple-300 border border-purple-500/30 rounded-xl font-medium transition flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Author Demo</span>
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-gray-800 w-full" />
          <span className="bg-[#0f1424] px-3 text-[10px] text-gray-500 uppercase font-mono absolute">
            Or with email
          </span>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-400 font-medium mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-[#090d16] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 font-medium mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-[#090d16] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-brand-400 hover:underline font-semibold">
            Create an Account
          </Link>
        </p>

      </div>
    </div>
  );
}
