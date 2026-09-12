import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../contexts/RouterContext';
import { ResultData, QuestionReviewItem } from '../types';
import {
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  BarChart2,
  Target,
  Users,
  FileText,
  Sparkles,
  X,
  Flag,
} from 'lucide-react';
import { QuestionReportModal } from '../components/QuestionReportModal';
import { useAuth } from '../contexts/AuthContext';
import { persistAttemptToFirestore } from '../lib/firebase';
import { GeminiChatbot } from '../components/GeminiChatbot';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const ResultPage: React.FC<{ attemptId: string }> = ({ attemptId }) => {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CORRECT' | 'WRONG' | 'UNANSWERED' | 'MARKED'>('ALL');
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [retaking, setRetaking] = useState(false);
  const [aiTutorQuestion, setAiTutorQuestion] = useState<QuestionReviewItem | null>(null);
  const [reportingQuestion, setReportingQuestion] = useState<QuestionReviewItem | null>(null);

  // Animated count-up score (§2 & §10)
  const [displayedScore, setDisplayedScore] = useState<number>(0);

  useEffect(() => {
    let timer: any = null;
    let isMounted = true;

    async function loadResult() {
      try {
        const token = localStorage.getItem('abhi_token');
        const res = await fetch(`/api/results/${attemptId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.ok && isMounted) {
          const json: ResultData = await res.json();
          setData(json);

          // Persist attempt to Firestore under user document if user is logged in
          if (user?.id) {
            persistAttemptToFirestore(user.id, {
              id: json.result.attemptId,
              userId: user.id,
              testId: json.result.testId,
              testTitle: json.result.testTitle,
              examName: json.result.examName,
              score: json.result.score,
              totalMarks: json.result.totalMarks,
              percentage: json.result.percentage,
              accuracy: json.result.accuracy,
              timeTaken: json.result.timeTaken,
              status: 'COMPLETED',
              startedAt: json.result.startedAt,
              submittedAt: json.result.submittedAt,
              correctCount: json.result.correctCount,
              wrongCount: json.result.wrongCount,
              unansweredCount: json.result.unansweredCount,
            });
          }

          // Animate score count-up
          const target = json.result.score;
          const duration = 1000;
          const steps = 40;
          const stepTime = duration / steps;
          const increment = target / steps;
          let current = 0;

          timer = setInterval(() => {
            if (!isMounted) return;
            current += increment;
            if ((increment >= 0 && current >= target) || (increment < 0 && current <= target)) {
              setDisplayedScore(target);
              if (timer) clearInterval(timer);
            } else {
              setDisplayedScore(parseFloat(current.toFixed(2)));
            }
          }, stepTime);
        }
      } catch (err) {
        console.error('Failed to load result:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadResult();
    return () => {
      isMounted = false;
      if (timer) clearInterval(timer);
    };
  }, [attemptId]);

  const toggleExpand = (qId: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  const handleToggleBookmark = async (qId: string) => {
    try {
      const token = localStorage.getItem('abhi_token');
      if (!token) return;
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ questionId: qId }),
      });
      if (res.ok) {
        const json = await res.json();
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            questions: prev.questions.map((q) =>
              q.questionId === qId ? { ...q, isBookmarked: json.bookmarked } : q
            ),
          };
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRetake = async () => {
    if (!data) return;
    setRetaking(true);
    try {
      const token = localStorage.getItem('abhi_token');
      const res = await fetch(`/api/tests/${data.result.testId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (res.ok && json.attemptId) {
        navigate(`/test/${json.attemptId}`);
      } else {
        alert(json.error || 'Could not restart test');
        setRetaking(false);
      }
    } catch (e) {
      alert('Error restarting test');
      setRetaking(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center text-sm text-[var(--ink)] opacity-60">
        Compiling scorecard, percentile cohort, and sectional diagnostics...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[var(--ink)]">Result Unavailable</h2>
        <p className="text-sm opacity-70">The score evaluation for this attempt could not be found.</p>
        <Link href="/dashboard" className="inline-block rounded bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const { result, subjectAnalysis, questions } = data;

  const filteredQuestions = questions.filter((q) => {
    if (activeFilter === 'CORRECT') return q.status === 'CORRECT';
    if (activeFilter === 'WRONG') return q.status === 'WRONG';
    if (activeFilter === 'UNANSWERED') return q.status === 'UNANSWERED';
    if (activeFilter === 'MARKED') return q.isMarked;
    return true;
  });

  const pieData = [
    { name: 'Correct', value: result.correctCount, color: '#1B8A5A' },
    { name: 'Wrong', value: result.wrongCount, color: '#C93B2B' },
    { name: 'Unanswered', value: result.unansweredCount, color: '#9CA3AF' },
  ].filter((d) => d.value > 0);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. SCORE HERO CARD (§10) */}
      <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--line)] pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] mb-1">
              <span>{result.examName}</span> • <span>{result.subjectName}</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--ink)]">
              {result.testTitle}
            </h1>
            <p className="text-xs opacity-60 mt-1">
              Submitted on {new Date(result.submittedAt).toLocaleDateString()} at{' '}
              {new Date(result.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleRetake}
              disabled={retaking}
              className="rounded border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2 text-xs font-bold text-[var(--ink)] hover:border-[var(--accent)] transition-colors flex items-center gap-1.5"
            >
              <RotateCcw size={14} /> {retaking ? 'Preparing...' : 'Retry Test'}
            </button>

            <Link
              href="/practice"
              className="rounded border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2 text-xs font-bold text-[var(--ink)] hover:border-[var(--accent)] transition-colors flex items-center gap-1.5"
            >
              <Target size={14} className="text-[var(--accent)]" />
              Practice Weak Areas
            </Link>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('question-review-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="rounded border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2 text-xs font-bold text-[var(--ink)] hover:border-[var(--accent)] transition-colors flex items-center gap-1.5"
            >
              <FileText size={14} className="text-[var(--accent)]" />
              Review Answers
            </button>

            <Link
              href="/dashboard"
              className="rounded bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white hover:bg-[var(--accent-hover)] transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* Big Score Counter Display (§2 & §10) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          {/* Main Score Hero */}
          <div className="md:col-span-1 rounded border border-[var(--line)] bg-[var(--paper)] p-6 text-center space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--ink)] opacity-60">
              Total Score
            </div>
            <div className="font-serif text-5xl sm:text-6xl font-bold text-[var(--accent)] tracking-tight">
              {displayedScore}
            </div>
            <div className="font-mono text-xs opacity-70">out of {result.totalMarks} marks</div>
            <div className="pt-2 text-xs font-mono font-semibold text-[var(--ink)]">
              Percentage: {result.percentage}%
            </div>
          </div>

          {/* Key Metric Blocks */}
          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
            <div className="rounded border border-[var(--line)] bg-[var(--paper)] p-4 space-y-1">
              <div className="text-[10px] uppercase opacity-60 font-sans">Accuracy</div>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-[var(--ink)]">
                {result.accuracy}%
              </div>
              <div className="text-[10px] opacity-60">
                {result.correctCount} of {result.correctCount + result.wrongCount} attempted
              </div>
            </div>

            <div className="rounded border border-[var(--line)] bg-[var(--paper)] p-4 space-y-1">
              <div className="text-[10px] uppercase opacity-60 font-sans">Time Taken</div>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-[var(--ink)]">
                {formatSeconds(result.timeTaken)}
              </div>
              <div className="text-[10px] opacity-60">Limit: {result.durationMinutes} mins</div>
            </div>

            <div className="rounded border border-[var(--line)] bg-[var(--paper)] p-4 space-y-1">
              <div className="text-[10px] uppercase opacity-60 font-sans">Cohort Rank</div>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-[var(--accent)]">
                {result.totalTakers > 1 ? `#${result.rank}` : '--'}
              </div>
              <div className="text-[10px] opacity-60">
                {result.totalTakers > 1 ? `of ${result.totalTakers} candidates` : 'Pending attempts'}
              </div>
            </div>

            <div className="rounded border border-[var(--line)] bg-[var(--paper)] p-4 space-y-1">
              <div className="text-[10px] uppercase opacity-60 font-sans">Percentile</div>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-[var(--accent)]">
                {result.totalTakers > 1 ? `${result.percentile}%` : '--'}
              </div>
              <div className="text-[10px] opacity-60">
                {result.totalTakers > 1 ? 'Scored higher than cohort' : 'Pending attempts'}
              </div>
            </div>
          </div>
        </div>

        {/* Insufficient Cohort Data Notice (§8) */}
        {result.totalTakers <= 1 && (
          <div className="rounded border border-[var(--line)] bg-[var(--paper)] px-4 py-2.5 text-xs text-center opacity-80">
            Rank/percentile becomes available after enough attempts are recorded.
          </div>
        )}

        {/* Tally Breakdown Strip */}
        <div className="grid grid-cols-3 gap-4 border-t border-[var(--line)] pt-4 text-center text-xs">
          <div className="flex items-center justify-center gap-2 text-[var(--signal-correct)]">
            <CheckCircle2 size={16} />
            <span className="font-bold">{result.correctCount} Correct</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-[var(--signal-wrong)]">
            <XCircle size={16} />
            <span className="font-bold">{result.wrongCount} Incorrect</span>
          </div>
          <div className="flex items-center justify-center gap-2 opacity-60">
            <HelpCircle size={16} />
            <span className="font-bold">{result.unansweredCount} Unanswered</span>
          </div>
        </div>
      </div>

      {/* 2. ANALYTICAL CHARTS & COMPARISON */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Benchmark Chart */}
        <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
            Score Benchmark Comparison
          </h2>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Your Score', score: result.score, fill: '#1E4D3A' },
                  { name: 'Cohort Avg', score: result.avgScore, fill: '#7A766E' },
                  { name: 'Highest', score: result.highestScore, fill: '#1B8A5A' },
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="score" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Response Distribution Pie */}
        <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
            Response Ratio Breakdown
          </h2>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. SUBJECT-WISE ANALYSIS TABLE (§10) */}
      <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
          Subject-Wise Sectional Performance
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--ink)]">
            <thead className="border-b border-[var(--line)] bg-[var(--paper)] text-[10px] font-bold uppercase tracking-wider opacity-70">
              <tr>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Total Qs</th>
                <th className="py-3 px-4">Correct</th>
                <th className="py-3 px-4">Wrong</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] font-mono">
              {subjectAnalysis.map((sub) => (
                <tr key={sub.subjectName} className="hover:bg-[var(--paper)] transition-colors">
                  <td className="py-3 px-4 font-sans font-medium">{sub.subjectName}</td>
                  <td className="py-3 px-4 opacity-80">{sub.totalQuestions}</td>
                  <td className="py-3 px-4 text-[var(--signal-correct)] font-bold">{sub.correct}</td>
                  <td className="py-3 px-4 text-[var(--signal-wrong)] font-bold">{sub.wrong}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                        sub.accuracy >= 70
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : sub.accuracy < 50
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {sub.accuracy}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold">{sub.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. QUESTION-WISE DETAILED REVIEW (§10) */}
      <div id="question-review-section" className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-[var(--ink)]">
              Question-by-Question Solution Review
            </h2>
            <p className="text-xs opacity-70 mt-0.5">
              Inspect full step-by-step mathematical explanations, correct options, and marks deducted.
            </p>
          </div>

          {/* Filter Pills (§9: All, Correct, Incorrect, Skipped, Marked) */}
          <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
            {(
              [
                { key: 'ALL', label: 'All Questions' },
                { key: 'CORRECT', label: `Correct (${result.correctCount})` },
                { key: 'WRONG', label: `Incorrect (${result.wrongCount})` },
                { key: 'UNANSWERED', label: `Skipped (${result.unansweredCount})` },
                { key: 'MARKED', label: `Marked (${questions.filter((q) => q.isMarked).length})` },
              ] as const
            ).map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`rounded border px-3 py-1 transition-colors ${
                  activeFilter === f.key
                    ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                    : 'border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] opacity-80 hover:opacity-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Questions Accordion List */}
        <div className="space-y-4">
          {filteredQuestions.map((q) => {
            const isExpanded = expandedQuestions.has(q.questionId);

            return (
              <div
                key={q.questionId}
                className="rounded border border-[var(--line)] bg-[var(--paper)] p-4 sm:p-5 space-y-3"
              >
                {/* Accordion Top Header */}
                <div
                  onClick={() => toggleExpand(q.questionId)}
                  className="flex items-start justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                        q.status === 'CORRECT'
                          ? 'bg-[var(--signal-correct)]'
                          : q.status === 'WRONG'
                          ? 'bg-[var(--signal-wrong)]'
                          : 'bg-gray-400'
                      }`}
                    >
                      {q.index}
                    </span>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                        <span className="font-bold text-[var(--accent)]">{q.subjectName}</span>
                        <span className="opacity-60">• {q.topicName}</span>
                        <span
                          className={`font-semibold px-1.5 py-0.2 rounded text-[10px] ${
                            q.status === 'CORRECT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : q.status === 'WRONG'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          {q.status}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-[var(--ink)] line-clamp-2 leading-relaxed">
                        {q.questionText}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleBookmark(q.questionId);
                      }}
                      className="text-[var(--accent)] opacity-70 hover:opacity-100 p-1"
                      title="Bookmark for revision"
                    >
                      {q.isBookmarked ? (
                        <BookmarkCheck size={17} className="fill-current text-[var(--accent)]" />
                      ) : (
                        <Bookmark size={17} />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReportingQuestion(q);
                      }}
                      className="text-amber-500 opacity-70 hover:opacity-100 p-1"
                      title="Report question error"
                    >
                      <Flag size={16} />
                    </button>

                    {isExpanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                  </div>
                </div>

                {/* Expanded Details: Full Text, Options & Explanation */}
                {isExpanded && (
                  <div className="border-t border-[var(--line)] pt-4 space-y-4 text-xs text-[var(--ink)]">
                    <div className="text-sm leading-relaxed font-sans">{q.questionText}</div>

                    {/* Options list */}
                    <div className="space-y-2">
                      {q.options.map((opt) => {
                        const isUserChoice = q.selectedOption === opt.optionKey;
                        const isCorrectOption = opt.isCorrect;

                        let borderClass = 'border-[var(--line)] bg-[var(--surface)]';
                        if (isCorrectOption) {
                          borderClass =
                            'border-[var(--signal-correct)] bg-emerald-50/50 dark:bg-emerald-950/20 font-semibold';
                        } else if (isUserChoice && !isCorrectOption) {
                          borderClass =
                            'border-[var(--signal-wrong)] bg-red-50/50 dark:bg-red-950/20';
                        }

                        return (
                          <div
                            key={opt.optionKey}
                            className={`flex items-center justify-between rounded border p-3 ${borderClass}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-xs">{opt.optionKey}.</span>
                              <span>{opt.optionText}</span>
                            </div>

                            <div className="text-[11px] font-mono">
                              {isCorrectOption && (
                                <span className="text-[var(--signal-correct)] font-bold">
                                  ✓ Correct Answer
                                </span>
                              )}
                              {isUserChoice && !isCorrectOption && (
                                <span className="text-[var(--signal-wrong)] font-bold">
                                  ✗ Your Choice
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation Box */}
                    <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                          Detailed Solution & Explanation
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setReportingQuestion(q)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-colors text-[11px] font-semibold"
                          >
                            <Flag size={12} />
                            <span>Report Error</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setAiTutorQuestion(q)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 border border-[var(--accent)]/20 transition-colors text-[11px] font-semibold"
                          >
                            <Sparkles size={12} />
                            <span>Ask Gemini AI Tutor</span>
                          </button>
                        </div>
                      </div>
                      <p className="text-xs opacity-90 leading-relaxed font-sans">
                        {q.explanation}
                      </p>
                      <div className="flex items-center gap-4 pt-2 text-[11px] font-mono opacity-70 border-t border-[var(--line)]">
                        <span>Time Spent: {q.timeSpent}s</span>
                        <span>Marks: +{q.marks.toFixed(2)}</span>
                        <span>Negative: -{q.negativeMarks.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Gemini AI Tutor Question Dissector Modal */}
      {aiTutorQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-3xl rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--paper)] px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-[var(--ink)]">
                    Gemini AI Question Assistant
                  </h3>
                  <p className="text-[10px] text-[var(--ink)] opacity-60">
                    Question #{aiTutorQuestion.index} ({aiTutorQuestion.subjectName} • {aiTutorQuestion.topicName})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAiTutorQuestion(null)}
                className="rounded p-1 text-[var(--ink)] opacity-60 hover:opacity-100 hover:bg-[var(--line)]/50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden p-2">
              <GeminiChatbot
                initialPersona="question-explainer"
                initialQuestionContext={`Question: "${aiTutorQuestion.questionText}". Options: ${aiTutorQuestion.options
                  .map((o) => `${o.optionKey}: ${o.optionText}`)
                  .join(' | ')}. Correct Answer is: ${aiTutorQuestion.correctOptionKey} (${
                  aiTutorQuestion.correctOptionText
                }). Candidate chose: ${aiTutorQuestion.selectedOption || 'Unanswered'}. Explanation: ${
                  aiTutorQuestion.explanation
                }`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Question Error Reporting Modal */}
      {reportingQuestion && (
        <QuestionReportModal
          isOpen={!!reportingQuestion}
          onClose={() => setReportingQuestion(null)}
          questionId={reportingQuestion.questionId}
          testId={data?.result?.testId}
          questionText={reportingQuestion.questionText}
        />
      )}
    </div>
  );
};
