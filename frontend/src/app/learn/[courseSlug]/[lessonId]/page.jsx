'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Play, 
  Code2, 
  FileText, 
  HelpCircle, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X, 
  ArrowLeft, 
  Sparkles, 
  Award, 
  Lightbulb, 
  MessageSquare, 
  Send 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetcher } from '../../../../lib/api';
import { useAuth } from '../../../../context/AuthContext';
import CodeEditor from '../../../../components/CodeEditor';
import ConsoleOutput from '../../../../components/ConsoleOutput';
import QuizRunner from '../../../../components/QuizRunner';

export default function ClassroomPage() {
  const params = useParams();
  const router = useRouter();
  const { user, demoLogin } = useAuth();

  const courseSlug = params?.courseSlug;
  const lessonId = params?.lessonId;

  const [lessonData, setLessonData] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Exercise State
  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [consoleError, setConsoleError] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [executionTime, setExecutionTime] = useState(undefined);
  const [consoleTab, setConsoleTab] = useState('console');

  // Quiz State
  const [quizResults, setQuizResults] = useState(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  // Lesson completion state
  const [isCompleted, setIsCompleted] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);

  // Discussion state
  const [discussions, setDiscussions] = useState([]);
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestionContent, setNewQuestionContent] = useState('');
  const [replyContent, setReplyContent] = useState({});
  const [activeTab, setActiveTab] = useState('content'); // 'content' or 'discussion'

  // Load lesson & course data
  useEffect(() => {
    if (!lessonId) return;

    setLoading(true);
    setTestResults(null);
    setConsoleOutput('');
    setConsoleError(null);
    setQuizResults(null);

    // Fetch lesson details
    fetcher(`/lessons/${lessonId}`)
      .then((res) => {
        if (res.success && res.lesson) {
          setLessonData(res);
          setIsCompleted(res.isCompleted || false);
          
          if (res.lesson.type === 'exercise' && res.lesson.exercise) {
            setCode(res.lesson.exercise.starterCode || '');
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    // Fetch discussions for this lesson
    fetcher(`/discussions/lesson/${lessonId}`)
      .then((res) => {
        if (res.success && res.discussions) {
          setDiscussions(res.discussions);
        }
      })
      .catch(() => {});
  }, [lessonId]);

  // Load Course syllabus for sidebar
  useEffect(() => {
    if (!courseSlug) return;
    fetcher(`/courses/${courseSlug}`)
      .then((res) => {
        if (res.success && res.course) {
          setCourse(res.course);
        }
      })
      .catch((err) => console.error(err));
  }, [courseSlug, isCompleted]);

  // Handle Run Code (plain test/logs)
  const handleRunCode = async () => {
    setIsRunning(true);
    setConsoleTab('console');
    setConsoleError(null);
    try {
      const language = lessonData?.lesson?.exercise?.language || 'javascript';
      const res = await fetcher('/runner/run', {
        method: 'POST',
        body: JSON.stringify({ code, language }),
      });
      if (res.success) {
        setConsoleOutput(res.output || 'Code executed successfully with no output.');
        setExecutionTime(res.executionTime);
      } else {
        setConsoleError(res.error || 'Execution failed');
        setExecutionTime(res.executionTime);
      }
    } catch (err) {
      setConsoleError(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  // Handle Submit Code (evaluate against test cases)
  const handleTestAndSubmit = async () => {
    if (!user) {
      await demoLogin('student');
    }

    setIsSubmitting(true);
    setConsoleTab('tests');
    setConsoleError(null);
    try {
      const res = await fetcher(`/submissions/${lessonId}`, {
        method: 'POST',
        body: JSON.stringify({ code }),
      });

      if (res.success) {
        setTestResults(res.testResults || []);
        setExecutionTime(res.executionTime);

        if (res.allPassed) {
          setIsCompleted(true);
          try {
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 },
            });
          } catch (_) {}
        }
      } else {
        setConsoleError(res.message || 'Submission failed');
      }
    } catch (err) {
      setConsoleError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Toggle Mark Complete
  const handleToggleComplete = async () => {
    if (!user) {
      await demoLogin('student');
    }

    setMarkingComplete(true);
    try {
      const res = await fetcher(`/lessons/${lessonId}/complete`, { method: 'POST' });
      if (res.success) {
        setIsCompleted(true);
        if (res.progress?.isCompleted) {
          try {
            confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
          } catch (_) {}
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMarkingComplete(false);
    }
  };

  // Handle Quiz Submit
  const handleQuizSubmit = async (answers) => {
    if (!user) {
      await demoLogin('student');
    }

    setIsSubmittingQuiz(true);
    try {
      const res = await fetcher(`/quizzes/${lessonId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      });

      if (res.success) {
        setQuizResults(res);
        if (res.passed) {
          setIsCompleted(true);
        }
        return res;
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  // Handle Post Discussion Question
  const handlePostQuestion = async (e) => {
    e.preventDefault();
    if (!user) await demoLogin('student');
    if (!newQuestionTitle.trim() || !newQuestionContent.trim()) return;

    try {
      const res = await fetcher(`/discussions/lesson/${lessonId}`, {
        method: 'POST',
        body: JSON.stringify({ title: newQuestionTitle, content: newQuestionContent }),
      });
      if (res.success && res.discussion) {
        setDiscussions([res.discussion, ...discussions]);
        setNewQuestionTitle('');
        setNewQuestionContent('');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle Post Reply
  const handlePostReply = async (discId) => {
    const text = replyContent[discId];
    if (!text || !text.trim()) return;
    if (!user) await demoLogin('student');

    try {
      const res = await fetcher(`/discussions/${discId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ content: text }),
      });
      if (res.success && res.discussion) {
        setDiscussions(discussions.map((d) => (d._id === discId ? res.discussion : d)));
        setReplyContent({ ...replyContent, [discId]: '' });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#090d16] text-gray-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono">Loading Classroom Workspace...</span>
        </div>
      </div>
    );
  }

  const lesson = lessonData?.lesson;
  const nav = lessonData?.navigation;

  return (
    <div className="flex h-screen overflow-hidden bg-[#090d16]">
      
      {/* Left Sidebar: Syllabus Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-80 bg-[#0d121f] border-r border-gray-800 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <Link
            href={`/courses/${courseSlug}`}
            className="flex items-center gap-2 text-xs font-medium text-gray-300 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4 text-gray-400" />
            <span className="truncate max-w-[180px] font-semibold">{course?.title || 'Course Details'}</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-gray-400 hover:text-white rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Course Progress Mini Bar */}
        {course?.progress && (
          <div className="px-4 py-3 bg-[#0a0e18] border-b border-gray-800/80">
            <div className="flex justify-between text-[11px] text-gray-400 font-mono mb-1">
              <span>Your Progress</span>
              <span className="text-brand-400">{course.progress.completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-brand-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${course.progress.completionPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Syllabus Lessons List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-800/50">
          {course?.modules?.map((mod, mIdx) => (
            <div key={mIdx} className="py-2">
              <div className="px-4 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500">
                {mod.title}
              </div>
              <div className="space-y-0.5 mt-1">
                {mod.lessons.map((l) => {
                  const isActive = l._id === lessonId;
                  const isDone = course?.progress?.completedLessons?.includes(l._id);
                  return (
                    <Link
                      key={l._id}
                      href={`/learn/${courseSlug}/${l._id}`}
                      className={`px-4 py-2 text-xs flex items-center justify-between transition ${
                        isActive
                          ? 'bg-brand-500/15 text-brand-300 font-semibold border-l-2 border-brand-500'
                          : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate pr-2">
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : l.type === 'video' ? (
                          <Play className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                        ) : l.type === 'exercise' ? (
                          <Code2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : l.type === 'quiz' ? (
                          <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        )}
                        <span className="truncate">{l.title}</span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono shrink-0">
                        {l.duration}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Classroom Area */}
      <div
        className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-80' : 'ml-0'
        }`}
      >
        {/* Top Header Bar */}
        <header className="h-14 bg-[#0d121f] border-b border-gray-800 flex items-center justify-between px-4 z-30 shrink-0">
          <div className="flex items-center space-x-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
                title="Open Syllabus"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-300 uppercase">
                {lesson?.type}
              </span>
              <h1 className="text-xs sm:text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
                {lesson?.title}
              </h1>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-2">
            {/* Mark as Complete Toggle */}
            <button
              onClick={handleToggleComplete}
              disabled={markingComplete}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                isCompleted
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? 'text-emerald-400' : 'text-gray-400'}`} />
              <span className="hidden sm:inline">{isCompleted ? 'Completed' : 'Mark Complete'}</span>
            </button>

            {/* Previous Lesson */}
            {nav?.prevLesson ? (
              <Link
                href={`/learn/${courseSlug}/${nav.prevLesson._id}`}
                className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 transition"
                title="Previous Lesson"
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
            ) : null}

            {/* Next Lesson */}
            {nav?.nextLesson ? (
              <Link
                href={`/learn/${courseSlug}/${nav.nextLesson._id}`}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href={`/courses/${courseSlug}`}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition"
              >
                <Award className="w-4 h-4" />
                <span>Finish Course</span>
              </Link>
            )}
          </div>
        </header>

        {/* Content View Based on Lesson Type */}
        <div className="flex-1 overflow-hidden flex flex-col">
          
          {/* Tabs: Lesson vs Q&A Discussion */}
          <div className="px-6 py-2 bg-[#090d16] border-b border-gray-800/80 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('content')}
                className={`text-xs font-medium pb-1 border-b-2 transition ${
                  activeTab === 'content'
                    ? 'border-brand-500 text-brand-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                Lesson Content
              </button>
              <button
                onClick={() => setActiveTab('discussion')}
                className={`text-xs font-medium pb-1 border-b-2 flex items-center gap-1.5 transition ${
                  activeTab === 'discussion'
                    ? 'border-brand-500 text-brand-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Discussion & Q&A ({discussions.length})
              </button>
            </div>
          </div>

          {/* Tab 1: Lesson View */}
          {activeTab === 'content' && (
            <div className="flex-1 overflow-hidden flex flex-col">
              
              {/* Type: Video */}
              {lesson?.type === 'video' && (
                <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-6">
                  {/* YouTube Embed Player */}
                  {lesson.videoUrl && (
                    <div className="relative rounded-2xl overflow-hidden aspect-video bg-black border border-gray-800 shadow-2xl">
                      <iframe
                        src={lesson.videoUrl}
                        title={lesson.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  {/* Lecture Notes */}
                  {lesson.content && (
                    <div className="p-6 rounded-2xl bg-[#0f1424] border border-gray-800 prose prose-invert max-w-none text-xs leading-relaxed">
                      <pre className="whitespace-pre-wrap font-sans text-gray-200 leading-relaxed">
                        {lesson.content}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Type: Article */}
              {lesson?.type === 'article' && (
                <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-6">
                  <div className="p-8 rounded-2xl bg-[#0f1424] border border-gray-800 prose prose-invert max-w-none text-xs leading-relaxed">
                    <pre className="whitespace-pre-wrap font-sans text-gray-200 leading-relaxed">
                      {lesson.content}
                    </pre>
                  </div>
                </div>
              )}

              {/* Type: Coding Exercise (IDE Split Pane) */}
              {lesson?.type === 'exercise' && (
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
                  
                  {/* Left: Problem statement & instructions (5 cols) */}
                  <div className="lg:col-span-5 h-full overflow-y-auto p-6 border-r border-gray-800 bg-[#090d16] space-y-5">
                    <div>
                      <span className="text-[11px] font-mono font-semibold text-emerald-400 uppercase tracking-wider">
                        Coding Challenge
                      </span>
                      <h2 className="text-xl font-bold text-white mt-1">{lesson.title}</h2>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0d121f] border border-gray-800 text-xs text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">
                      {lesson.content}
                    </div>

                    {/* Hints Accordion */}
                    {lesson.exercise?.hints?.length > 0 && (
                      <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/30 text-xs text-amber-200 space-y-2">
                        <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                          <Lightbulb className="w-4 h-4" />
                          <span>Hints & Strategy</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-[11px]">
                          {lesson.exercise.hints.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Right: Code Editor & Console Output (7 cols) */}
                  <div className="lg:col-span-7 h-full flex flex-col overflow-hidden bg-[#070a12] p-3 gap-3">
                    {/* Top 60%: Editor */}
                    <div className="flex-1 overflow-hidden min-h-[300px]">
                      <CodeEditor
                        code={code}
                        onChange={setCode}
                        onRun={handleRunCode}
                        onSubmit={handleTestAndSubmit}
                        onReset={() => setCode(lesson.exercise?.starterCode || '')}
                        isRunning={isRunning}
                        isSubmitting={isSubmitting}
                        language={lesson.exercise?.language || 'javascript'}
                        hasTestCases={lesson.exercise?.testCases?.length > 0}
                      />
                    </div>

                    {/* Bottom 40%: Terminal & Test Results */}
                    <div className="h-64 shrink-0 overflow-hidden">
                      <ConsoleOutput
                        output={consoleOutput}
                        testResults={testResults}
                        executionTime={executionTime}
                        error={consoleError}
                        activeTab={consoleTab}
                        onTabChange={setConsoleTab}
                      />
                    </div>
                  </div>

                </div>
              )}

              {/* Type: Quiz */}
              {lesson?.type === 'quiz' && (
                <div className="flex-1 overflow-y-auto p-6">
                  <QuizRunner
                    quiz={lesson.quiz}
                    onSubmit={handleQuizSubmit}
                    isSubmitting={isSubmittingQuiz}
                    results={quizResults}
                    onReset={() => setQuizResults(null)}
                  />
                </div>
              )}

            </div>
          )}

          {/* Tab 2: Discussion & Q&A Thread */}
          {activeTab === 'discussion' && (
            <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-6">
              {/* Ask Question Form */}
              <form onSubmit={handlePostQuestion} className="p-5 rounded-2xl bg-[#0f1424] border border-gray-800 space-y-3">
                <h3 className="text-sm font-bold text-white">Ask a Question about this Lesson</h3>
                <input
                  type="text"
                  placeholder="Summary of your question or issue..."
                  value={newQuestionTitle}
                  onChange={(e) => setNewQuestionTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#090d16] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                />
                <textarea
                  rows={3}
                  placeholder="Explain in detail what you are experiencing or what concepts need clarity..."
                  value={newQuestionContent}
                  onChange={(e) => setNewQuestionContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#090d16] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 resize-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-lg shadow-md transition"
                >
                  Post Question
                </button>
              </form>

              {/* Discussions List */}
              <div className="space-y-4">
                {discussions.map((disc) => (
                  <div key={disc._id} className="p-5 rounded-2xl bg-[#0d121f] border border-gray-800 space-y-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={disc.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={disc.user?.name}
                        className="w-8 h-8 rounded-full border border-gray-700 object-cover"
                      />
                      <div>
                        <span className="text-xs font-semibold text-white block">{disc.user?.name}</span>
                        <span className="text-[10px] text-gray-500">{new Date(disc.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white">{disc.title}</h4>
                      <p className="text-xs text-gray-300 mt-1 leading-relaxed">{disc.content}</p>
                    </div>

                    {/* Replies */}
                    {disc.replies?.length > 0 && (
                      <div className="pl-4 border-l-2 border-brand-500/40 space-y-3 pt-2">
                        {disc.replies.map((reply, rIdx) => (
                          <div key={rIdx} className="p-3 rounded-lg bg-gray-900/60 border border-gray-800/80 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-brand-300">{reply.user?.name || 'Peer'}</span>
                              <span className="text-[10px] text-gray-500">{new Date(reply.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-gray-300">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply box */}
                    <div className="flex gap-2 pt-2 border-t border-gray-800">
                      <input
                        type="text"
                        placeholder="Write a helpful reply..."
                        value={replyContent[disc._id] || ''}
                        onChange={(e) => setReplyContent({ ...replyContent, [disc._id]: e.target.value })}
                        className="flex-1 px-3 py-1.5 text-xs bg-[#090d16] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
                      />
                      <button
                        onClick={() => handlePostReply(disc._id)}
                        className="p-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
