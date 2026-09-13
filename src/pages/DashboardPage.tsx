import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Award,
  Target,
  Flame,
  Clock,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  BookX,
  Sliders,
  Zap,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { apiFetch } from '../lib/api';

export const DashboardPage: React.FC = () => {
  const { navigate } = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login?redirect=/dashboard');
      return;
    }

    async function loadDashboard() {
      try {
        const token = localStorage.getItem('abhi_token');
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await apiFetch('/api/dashboard', {
          headers,
          credentials: 'include',
        });

        let json: any = null;
        if (res.ok) {
          try {
            json = await res.json();
          } catch {}
        }

        // Merge locally completed attempts if available
        try {
          const localHistory = JSON.parse(localStorage.getItem('abhi_test_history') || '[]');
          if (Array.isArray(localHistory) && localHistory.length > 0) {
            if (!json) {
              json = {
                summary: { testsAttempted: 0, avgScore: 0, bestScore: 0, avgAccuracy: 0, streak: 1 },
                trendData: [],
                weakSubjects: [],
                recommendations: [],
                recentTests: [],
                activeAttempt: null,
              };
            }

            const existingIds = new Set(localHistory.map((h: any) => h.id));
            const formattedLocal = localHistory.map((h: any) => ({
              attemptId: h.id,
              testId: h.testId,
              title: h.testTitle || 'Mock Examination',
              examName: h.examName || 'Competitive Exam',
              score: h.score,
              totalMarks: h.totalMarks || 100,
              percentage: h.percentage,
              accuracy: h.accuracy,
              status: h.status || 'COMPLETED',
              submittedAt: h.submittedAt || new Date().toISOString(),
            }));

            const combinedRecent = [
              ...formattedLocal,
              ...(json.recentTests || []).filter((t: any) => !existingIds.has(t.attemptId)),
            ];

            const testsAttempted = combinedRecent.length;
            const totalScore = combinedRecent.reduce((acc: number, t: any) => acc + (t.score || 0), 0);
            const totalAcc = combinedRecent.reduce((acc: number, t: any) => acc + (t.accuracy || 0), 0);
            const avgScore = testsAttempted > 0 ? parseFloat((totalScore / testsAttempted).toFixed(1)) : 78.5;
            const avgAccuracy = testsAttempted > 0 ? parseFloat((totalAcc / testsAttempted).toFixed(1)) : 84.5;
            const bestScore = Math.max(...combinedRecent.map((t: any) => t.score || 0));

            json.summary = {
              testsAttempted,
              avgScore,
              bestScore,
              avgAccuracy,
              streak: Math.max(1, json.summary?.streak || 1),
            };

            json.recentTests = combinedRecent;
            json.trendData = combinedRecent.slice(0, 10).reverse().map((t: any, idx: number) => ({
              index: idx + 1,
              date: t.submittedAt ? new Date(t.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `T${idx + 1}`,
              title: t.title,
              score: t.score,
              accuracy: t.accuracy,
              percentage: t.percentage,
            }));
          }
        } catch {}

        if (json) {
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user, authLoading, navigate]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-sm text-[var(--ink)] opacity-60">
        Loading candidate performance dashboard and diagnostic engines...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[var(--ink)]">Dashboard Unavailable</h2>
        <p className="text-sm opacity-70">Please sign in to view your candidate dashboard.</p>
        <Link href="/login" className="inline-block rounded bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white">
          Sign In
        </Link>
      </div>
    );
  }

  const { summary, trendData, weakSubjects, recommendations, recentTests, activeAttempt } = data;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[var(--line)] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[var(--ink)]">
            Aspirant Dashboard
          </h1>
          <p className="text-xs text-[var(--ink)] opacity-70 mt-1">
            Real-time accuracy analytics, historical scoring curves, and automated weak-area detection for{' '}
            <span className="font-semibold text-[var(--accent)]">{user?.name}</span>.
          </p>
        </div>

        <Link
          href="/mock-tests"
          className="rounded bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors self-start sm:self-auto"
        >
          Attempt New Mock Test →
        </Link>
      </div>

      {/* Ongoing Attempt Alert Banner (§11) */}
      {activeAttempt && (
        <div className="rounded border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-3">
            <Clock size={20} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-bold text-sm">
                Unfinished Examination Session: {activeAttempt.testTitle}
              </div>
              <p className="text-xs opacity-85 mt-0.5">
                Started on {new Date(activeAttempt.startedAt).toLocaleDateString()}. Your saved answers and server-authoritative timer are active.
              </p>
            </div>
          </div>

          <Link
            href={`/test/${activeAttempt.attemptId}`}
            className="rounded bg-amber-600 dark:bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 transition-colors whitespace-nowrap"
          >
            Resume Test Now →
          </Link>
        </div>
      )}

      {/* 1. KEY METRICS STRIP (§11) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center font-mono">
        <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-5 space-y-1">
          <div className="text-[10px] uppercase opacity-60 font-sans">Tests Attempted</div>
          <div className="font-serif text-3xl font-bold text-[var(--ink)]">
            {summary.testsAttempted}
          </div>
        </div>

        <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-5 space-y-1">
          <div className="text-[10px] uppercase opacity-60 font-sans">Average Score</div>
          <div className="font-serif text-3xl font-bold text-[var(--ink)]">
            {summary.avgScore}
          </div>
        </div>

        <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-5 space-y-1">
          <div className="text-[10px] uppercase opacity-60 font-sans">Best Score</div>
          <div className="font-serif text-3xl font-bold text-[var(--accent)]">
            {summary.bestScore}
          </div>
        </div>

        <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-5 space-y-1">
          <div className="text-[10px] uppercase opacity-60 font-sans">Avg Accuracy</div>
          <div className="font-serif text-3xl font-bold text-[var(--ink)]">
            {summary.avgAccuracy}%
          </div>
        </div>

        <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-5 space-y-1 col-span-2 md:col-span-1">
          <div className="text-[10px] uppercase opacity-60 font-sans flex items-center justify-center gap-1">
            <Flame size={12} className="text-orange-500" /> Active Streak
          </div>
          <div className="font-serif text-3xl font-bold text-orange-500">
            {summary.streak} {summary.streak === 1 ? 'day' : 'days'}
          </div>
        </div>
      </div>

      {/* High-Yield Fast Action Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/daily-challenge"
          className="p-5 rounded-2xl border border-[var(--line)] bg-gradient-to-br from-amber-500/5 to-transparent hover:border-amber-500/40 transition-all flex flex-col justify-between group shadow-xs"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Flame size={18} className="fill-current animate-pulse" />
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                5-Min Drill
              </span>
            </div>
            <h3 className="text-sm font-bold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
              Daily Sprint Challenge
            </h3>
            <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
              Rapid 5-question mixed section quiz. Maintain your learning streak and boost retention.
            </p>
          </div>
          <div className="pt-4 flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
            <span>Start Daily Quiz</span>
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/wrong-questions"
          className="p-5 rounded-2xl border border-[var(--line)] bg-gradient-to-br from-rose-500/5 to-transparent hover:border-rose-500/40 transition-all flex flex-col justify-between group shadow-xs"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <BookX size={18} />
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                Retention
              </span>
            </div>
            <h3 className="text-sm font-bold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
              Mistake Notebook
            </h3>
            <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
              Review and re-attempt all previously missed questions with interactive drills and Gemini tutoring.
            </p>
          </div>
          <div className="pt-4 flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400">
            <span>Open Error Notebook</span>
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/custom-test"
          className="p-5 rounded-2xl border border-[var(--line)] bg-gradient-to-br from-[var(--accent)]/5 to-transparent hover:border-[var(--accent)]/40 transition-all flex flex-col justify-between group shadow-xs"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                <Sliders size={18} />
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-full">
                Custom Test
              </span>
            </div>
            <h3 className="text-sm font-bold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
              Custom Test Builder
            </h3>
            <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
              Create a personalized mock exam tailored to chosen topics, difficulty levels, and time constraints.
            </p>
          </div>
          <div className="pt-4 flex items-center gap-1 text-xs font-bold text-[var(--accent)]">
            <span>Design Custom Exam</span>
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* 2. WEAK-AREA FOCUS NOTICES (§11 & §13) */}
      {weakSubjects.length > 0 && (
        <div className="rounded border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
            <AlertCircle size={15} /> Weak Area Diagnostic Triggered
          </div>
          <p className="text-xs text-[var(--ink)] opacity-85 leading-relaxed">
            The platform flags any subject where your aggregate accuracy falls below 60%. Prioritize targeted topic practice in these domains:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {weakSubjects.map((ws: any) => (
              <div
                key={ws.subject}
                className="rounded border border-red-200 dark:border-red-900/40 bg-[var(--surface)] p-4 space-y-2"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[var(--ink)]">{ws.subject}</span>
                  <span className="font-mono font-bold text-red-600 dark:text-red-400">
                    {ws.accuracy}% Acc
                  </span>
                </div>
                <p className="text-[11px] opacity-70">
                  {ws.totalQuestions} questions attempted across exams.
                </p>
                <Link
                  href="/practice"
                  className="inline-block text-xs font-semibold text-[var(--accent)] hover:underline pt-1"
                >
                  Start Practice Drill →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. RULE-BASED RECOMMENDATIONS (§13) */}
      {recommendations.length > 0 && (
        <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              Personalized Practice Recommendations
            </h2>
            <span className="text-[11px] opacity-60 font-mono">Rule-Based Diagnostic</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec: any, i: number) => (
              <div
                key={i}
                className="rounded border border-[var(--line)] bg-[var(--paper)] p-4 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-[var(--ink)]">{rec.title}</h3>
                  <p className="text-xs opacity-75 leading-relaxed">{rec.reason}</p>
                </div>
                <Link
                  href={rec.link}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent)] hover:underline pt-2"
                >
                  {rec.action} <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. PERFORMANCE TREND CHART (§11) */}
      <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
          Score Progression Over Time
        </h2>

        {trendData.length > 1 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#1E4D3A"
                  strokeWidth={2}
                  name="Score"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#1B8A5A"
                  strokeWidth={2}
                  name="Accuracy %"
                  strokeDasharray="4 4"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-xs opacity-60">
            Complete at least 2 mock tests to generate your performance progression chart.
          </div>
        )}
      </div>

      {/* 5. RECENT TESTS HISTORY (§11) */}
      <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
            Recent Test Attempts
          </h2>
          <Link href="/my-tests" className="text-xs font-semibold text-[var(--accent)] hover:underline">
            View All History →
          </Link>
        </div>

        {recentTests.length === 0 ? (
          <div className="py-8 text-center text-xs opacity-60">
            No completed tests yet. Start with a free mock test to view analytics.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[var(--ink)]">
              <thead className="border-b border-[var(--line)] bg-[var(--paper)] text-[10px] font-bold uppercase tracking-wider opacity-70">
                <tr>
                  <th className="py-3 px-4">Test Title</th>
                  <th className="py-3 px-4">Exam</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Accuracy</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)] font-mono">
                {recentTests.map((t: any) => (
                  <tr key={t.attemptId} className="hover:bg-[var(--paper)] transition-colors">
                    <td className="py-3 px-4 font-sans font-medium">{t.testTitle}</td>
                    <td className="py-3 px-4 opacity-80">{t.examName}</td>
                    <td className="py-3 px-4 font-bold text-[var(--accent)]">
                      {t.score} / {t.totalMarks}
                    </td>
                    <td className="py-3 px-4">{t.accuracy}%</td>
                    <td className="py-3 px-4 opacity-60">
                      {new Date(t.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/result/${t.attemptId}`}
                        className="font-sans font-semibold text-[var(--accent)] hover:underline"
                      >
                        View Result
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
