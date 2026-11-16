'use client';

import React, { useState } from 'react';
import { Terminal, CheckCircle2, XCircle, Clock, AlertTriangle, EyeOff } from 'lucide-react';

export default function ConsoleOutput({ output, testResults, executionTime, error, activeTab, onTabChange }) {
  const [tab, setTab] = useState(activeTab || (testResults ? 'tests' : 'console'));

  const currentTab = activeTab !== undefined ? activeTab : tab;
  const handleTab = (newTab) => {
    if (onTabChange) onTabChange(newTab);
    setTab(newTab);
  };

  const passedCount = testResults ? testResults.filter((t) => t.passed).length : 0;
  const totalCount = testResults ? testResults.length : 0;
  const allPassed = totalCount > 0 && passedCount === totalCount;

  return (
    <div className="flex flex-col h-full bg-[#090d16] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#121826] border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleTab('console')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-medium transition ${
              currentTab === 'console'
                ? 'bg-gray-800 text-brand-400 border border-gray-700'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Console Output
          </button>

          {testResults && (
            <button
              onClick={() => handleTab('tests')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-medium transition ${
                currentTab === 'tests'
                  ? 'bg-gray-800 text-brand-400 border border-gray-700'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {allPassed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
              )}
              Test Cases ({passedCount}/{totalCount})
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-3 text-[11px] font-mono text-gray-400">
          {executionTime !== undefined && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-500" />
              {executionTime}ms
            </span>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 overflow-y-auto font-mono text-xs">
        {currentTab === 'console' && (
          <div className="space-y-2">
            {error ? (
              <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/40 text-rose-300">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Runtime / Syntax Error
                </div>
                <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed">{error}</pre>
              </div>
            ) : null}

            {output ? (
              <pre className="text-gray-200 whitespace-pre-wrap leading-relaxed">{output}</pre>
            ) : (
              !error && (
                <div className="text-gray-600 italic py-6 text-center">
                  Click &apos;Run&apos; to execute your code and see output here.
                </div>
              )
            )}
          </div>
        )}

        {currentTab === 'tests' && testResults && (
          <div className="space-y-3">
            {/* Banner */}
            <div
              className={`p-3 rounded-lg border flex items-center justify-between ${
                allPassed
                  ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                  : 'bg-amber-950/30 border-amber-800/50 text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {allPassed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-amber-400 shrink-0" />
                )}
                <span className="font-semibold text-sm">
                  {allPassed ? 'All test cases passed! Great job!' : `Passed ${passedCount} of ${totalCount} test cases`}
                </span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-black/40 font-mono">
                {Math.round((passedCount / totalCount) * 100)}%
              </span>
            </div>

            {/* List of test cases */}
            <div className="space-y-2">
              {testResults.map((tc, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border transition ${
                    tc.passed
                      ? 'bg-[#0f172a]/40 border-gray-800'
                      : 'bg-rose-950/20 border-rose-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-medium">
                      {tc.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                      <span className={tc.passed ? 'text-gray-200' : 'text-rose-200'}>
                        {tc.description || `Test Case #${idx + 1}`}
                      </span>
                    </div>

                    {tc.isHidden && (
                      <span className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-800/80 px-2 py-0.5 rounded border border-gray-700">
                        <EyeOff className="w-3 h-3" />
                        Hidden
                      </span>
                    )}
                  </div>

                  {!tc.isHidden ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] mt-2 pt-2 border-t border-gray-800/60">
                      <div>
                        <span className="text-gray-500 block">Input:</span>
                        <code className="text-gray-300 font-mono block bg-black/40 p-1.5 rounded mt-0.5">
                          {tc.input || 'N/A'}
                        </code>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Expected:</span>
                        <code className="text-emerald-400 font-mono block bg-black/40 p-1.5 rounded mt-0.5">
                          {tc.expectedOutput}
                        </code>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-gray-500 block">Your Output:</span>
                        <code
                          className={`font-mono block bg-black/40 p-1.5 rounded mt-0.5 ${
                            tc.passed ? 'text-emerald-300' : 'text-rose-400'
                          }`}
                        >
                          {tc.actualOutput !== undefined ? tc.actualOutput : tc.error || 'No output'}
                        </code>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-gray-500 italic mt-1">
                      {tc.passed ? 'Test inputs and outputs hidden for evaluation.' : 'Hidden test case failed. Check edge cases & constraints.'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
