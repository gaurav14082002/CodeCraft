'use client';

import React, { useRef } from 'react';
import { Play, Send, RotateCcw, Copy, Check, Terminal } from 'lucide-react';

export default function CodeEditor({
  code,
  onChange,
  onRun,
  onSubmit,
  onReset,
  isRunning = false,
  isSubmitting = false,
  language = 'javascript',
  hasTestCases = false,
}) {
  const [copied, setCopied] = React.useState(false);
  const textareaRef = useRef(null);

  // Handle Tab key for proper 2-space indentation
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      onChange(newCode);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = (code || '').split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 12) }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Editor Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs font-mono font-medium text-gray-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
            solution.{language === 'python' ? 'py' : 'js'}
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-400 uppercase">
            {language}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {onReset && (
            <button
              onClick={onReset}
              title="Reset code"
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleCopy}
            title="Copy code"
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Run Code Button */}
          <button
            onClick={onRun}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-gray-200 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg disabled:opacity-50 transition"
          >
            <Play className={`w-3.5 h-3.5 text-brand-400 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Running...' : 'Run'}
          </button>

          {/* Submit / Test Button */}
          {hasTestCases && onSubmit && (
            <button
              onClick={onSubmit}
              disabled={isSubmitting || isRunning}
              className="flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md shadow-emerald-600/30 disabled:opacity-50 transition"
            >
              <Send className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-pulse' : ''}`} />
              {isSubmitting ? 'Evaluating...' : 'Submit & Test'}
            </button>
          )}
        </div>
      </div>

      {/* Editor Body */}
      <div className="relative flex-1 flex overflow-hidden font-mono text-[13px] leading-relaxed bg-[#0d1117]">
        {/* Line Numbers */}
        <div className="py-4 pl-3 pr-3 text-right select-none text-gray-600 bg-[#0d1117] border-r border-gray-800/60 font-mono text-xs w-12 shrink-0">
          {lineNumbers.map((num) => (
            <div key={num} className="leading-6">
              {num}
            </div>
          ))}
        </div>

        {/* Textarea code container */}
        <div className="relative flex-1 h-full">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck="false"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className="w-full h-full p-4 bg-transparent text-gray-100 font-mono text-[13px] leading-6 resize-none focus:outline-none focus:ring-0 selection:bg-brand-500/30 whitespace-pre overflow-auto"
            placeholder={`// Write your ${language} code here...`}
          />
        </div>
      </div>
    </div>
  );
}
