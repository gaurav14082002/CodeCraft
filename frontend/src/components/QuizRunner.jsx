'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, HelpCircle, RotateCcw, Award, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function QuizRunner({
  quiz = [],
  onSubmit,
  isSubmitting = false,
  results = null,
  onReset,
}) {
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const handleSelect = (qIdx, optIdx) => {
    if (results) return; // Locked once submitted
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIdx]: optIdx,
    }));
  };

  const handleSubmit = async () => {
    const answersArray = quiz.map((_, idx) => (selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : -1));
    const res = await onSubmit(answersArray);
    if (res && res.passed) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (_) {}
    }
  };

  const allAnswered = quiz.length > 0 && Object.keys(selectedAnswers).length === quiz.length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Quiz Header */}
      <div className="p-6 rounded-2xl bg-[#0f1424] border border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-medium text-brand-400 uppercase tracking-wider">
              Knowledge Check
            </span>
            <h2 className="text-xl font-bold text-white mt-1">Lesson Quiz</h2>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-400 font-mono">
              {quiz.length} Questions • Passing: 70%
            </span>
          </div>
        </div>

        {/* Results Banner if submitted */}
        {results && (
          <div
            className={`mt-4 p-4 rounded-xl border flex items-center justify-between ${
              results.passed
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                : 'bg-rose-950/40 border-rose-800/60 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {results.passed ? (
                <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-400">
                  <Award className="w-6 h-6" />
                </div>
              ) : (
                <div className="p-2 rounded-full bg-rose-500/20 text-rose-400">
                  <XCircle className="w-6 h-6" />
                </div>
              )}
              <div>
                <h4 className="font-bold text-base">
                  {results.passed ? 'Quiz Passed! Congratulations!' : 'Not quite there yet. Keep studying!'}
                </h4>
                <p className="text-xs text-gray-300">
                  You scored {results.score} / {results.total} ({results.percentage}%)
                </p>
              </div>
            </div>

            {onReset && (
              <button
                onClick={() => {
                  setSelectedAnswers({});
                  onReset();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-black/40 hover:bg-black/60 rounded-lg transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retake Quiz
              </button>
            )}
          </div>
        )}
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {quiz.map((q, qIdx) => {
          const reviewItem = results?.review ? results.review[qIdx] : null;
          const userAns = selectedAnswers[qIdx];

          return (
            <div
              key={qIdx}
              className={`p-6 rounded-2xl bg-[#0d121f] border transition-all ${
                reviewItem
                  ? reviewItem.isCorrect
                    ? 'border-emerald-800/60'
                    : 'border-rose-800/60'
                  : 'border-gray-800'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <span className="text-sm font-semibold text-white leading-relaxed">
                  <span className="text-brand-400 font-mono mr-2">{qIdx + 1}.</span>
                  {q.question}
                </span>
                {reviewItem && (
                  <span className="shrink-0">
                    {reviewItem.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    )}
                  </span>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2">
                {q.options.map((opt, optIdx) => {
                  const isSelected = userAns === optIdx;
                  let optStyle = 'border-gray-800 bg-gray-900/50 hover:bg-gray-800/70 text-gray-300';

                  if (reviewItem) {
                    if (optIdx === reviewItem.correctAnswer) {
                      optStyle = 'border-emerald-600 bg-emerald-950/40 text-emerald-200 font-medium';
                    } else if (isSelected && !reviewItem.isCorrect) {
                      optStyle = 'border-rose-600 bg-rose-950/40 text-rose-200';
                    } else {
                      optStyle = 'border-gray-800/40 bg-gray-900/20 text-gray-500 opacity-60';
                    }
                  } else if (isSelected) {
                    optStyle = 'border-brand-500 bg-brand-500/15 text-white font-medium ring-1 ring-brand-500/50';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={!!results}
                      onClick={() => handleSelect(qIdx, optIdx)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs leading-relaxed flex items-center justify-between transition-all ${optStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full border border-gray-600 flex items-center justify-center text-[10px] font-mono shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {reviewItem && optIdx === reviewItem.correctAnswer && (
                        <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider font-semibold">
                          Correct
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation in review mode */}
              {reviewItem && reviewItem.explanation && (
                <div className="mt-4 p-3 rounded-xl bg-gray-900/60 border border-gray-800 text-xs text-gray-300 leading-relaxed">
                  <span className="font-semibold text-brand-400 block mb-1">Explanation:</span>
                  {reviewItem.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      {!results && (
        <div className="flex items-center justify-between p-4 bg-[#0f1424] rounded-2xl border border-gray-800">
          <span className="text-xs text-gray-400 font-mono">
            {Object.keys(selectedAnswers).length} of {quiz.length} questions answered
          </span>

          <button
            onClick={handleSubmit}
            disabled={!allAnswered || isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-500/25 disabled:opacity-50 transition"
          >
            <span>{isSubmitting ? 'Evaluating...' : 'Submit Answers'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
