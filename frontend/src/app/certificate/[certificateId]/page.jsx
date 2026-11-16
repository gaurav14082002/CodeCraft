'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Award, ShieldCheck, Printer, ArrowLeft, Terminal, CheckCircle2 } from 'lucide-react';
import { fetcher } from '../../../lib/api';

export default function CertificatePage() {
  const params = useParams();
  const certificateId = params?.certificateId;
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!certificateId) return;
    fetcher(`/progress/certificate/${certificateId}`)
      .then((res) => {
        if (res.success && res.certificate) {
          setCert(res.certificate);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [certificateId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span className="text-xs font-mono">Verifying Certificate Signature on Blockchain/DB...</span>
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
          <Award className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Certificate Not Found</h2>
        <p className="text-xs text-gray-400">
          The certificate ID &quot;{certificateId}&quot; could not be verified in our records.
        </p>
        <Link href="/courses" className="inline-block px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-semibold">
          Return to Academy
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      
      {/* Top action controls */}
      <div className="flex items-center justify-between no-print">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-750 text-white text-xs font-semibold rounded-xl border border-gray-700 shadow-sm transition"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Official Certificate Card */}
      <div className="relative rounded-3xl bg-[#0d1222] border-4 border-amber-500/30 p-8 sm:p-14 shadow-2xl overflow-hidden text-center space-y-8">
        
        {/* Decorative corner borders */}
        <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-400/50 pointer-events-none" />
        <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-400/50 pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-400/50 pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-400/50 pointer-events-none" />

        {/* Certificate Brand Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-mono">
            <Terminal className="w-3.5 h-3.5 text-brand-400" />
            <span>CodeCraft Online Learning Institute</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif tracking-wider text-amber-200 font-bold uppercase mt-3">
            Certificate of Completion
          </h1>
          <p className="text-xs text-gray-400 font-mono tracking-widest uppercase">
            Official Academic Record & Verification
          </p>
        </div>

        {/* Recipient */}
        <div className="space-y-2 py-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-mono">
            This is proudly presented to
          </p>
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {cert.studentName}
          </div>
          <p className="text-xs text-gray-300 max-w-lg mx-auto leading-relaxed pt-2">
            for successfully mastering all modules, technical coding challenges, algorithmic test runners, and quizzes in
          </p>
        </div>

        {/* Course Name */}
        <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/20 max-w-xl mx-auto">
          <span className="text-lg sm:text-xl font-bold text-brand-300 block">
            {cert.courseTitle}
          </span>
          <span className="text-xs text-gray-400 font-mono mt-1 block">
            Track: {cert.category} • Level: {cert.level}
          </span>
        </div>

        {/* Bottom Signatures & Seal */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-800/80 items-center">
          
          {/* Instructor signature */}
          <div className="space-y-1">
            <div className="font-serif italic text-base text-gray-200 border-b border-gray-700 pb-1 max-w-[160px] mx-auto">
              {cert.instructorName}
            </div>
            <span className="text-[10px] text-gray-400 font-mono block">Lead Instructor & Author</span>
          </div>

          {/* Official Golden Seal */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 p-0.5 shadow-xl shadow-amber-500/20">
              <div className="w-full h-full bg-[#0d1222] rounded-full flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-8 h-8" />
              </div>
            </div>
            <span className="text-[9px] text-amber-300 font-mono font-bold tracking-widest uppercase mt-2">
              Verified Credential
            </span>
          </div>

          {/* Issue Date & ID */}
          <div className="space-y-1">
            <div className="text-xs font-mono text-gray-200 border-b border-gray-700 pb-1 max-w-[160px] mx-auto">
              {new Date(cert.completedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <span className="text-[10px] text-gray-400 font-mono block">Date of Issue</span>
          </div>

        </div>

        {/* Credential Hash / Verify URL */}
        <div className="pt-4 text-[10px] font-mono text-gray-500">
          Certificate ID: <span className="text-gray-300 font-bold">{cert.certificateId}</span> • Verified online at CodeCraft PRO
        </div>

      </div>

    </div>
  );
}
