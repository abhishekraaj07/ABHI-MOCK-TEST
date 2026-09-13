import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';
import {
  TrendingUp,
  Award,
  Target,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Sparkles,
  BarChart2,
  Loader2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

interface AnalyticsData {
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  averageAccuracy: number;
  averageTimePerQuestion: number;
  scoreTrend: Array<{
    index: number;
    testTitle: string;
    examName: string;
    date: string;
    score: number;
    totalMarks: number;
    percentage: number;
  }>;
  accuracyTrend: Array<{
    index: number;
    testTitle: string;
    date: string;
    accuracy: number;
  }>;
  subjectPerformance: Array<{
    subjectName: string;
    attempted: number;
    correct: number;
    wrong: number;
    accuracy: number;
    totalScore: number;
    avgTimePerQuestion: number;
  }>;
  topicPerformance: Array<{
    topicName: string;
    subjectName: string;
    attempted: number;
    correct: number;
    wrong: number;
    accuracy: number;
  }>;
  weakAreas: Array<{
    topicName: string;
    subjectName: string;
    attempted: number;
    correct: number;
    wrong: number;
    accuracy: number;
  }>;
  strongAreas: Array<{
    topicName: string;
    subjectName: string;
    attempted: number;
    correct: number;
    wrong: number;
    accuracy: number;
  }>;
  insights: string[];
}

import { apiFetch } from '../lib/api';

export const AnalyticsPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { navigate } = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login?redirect=/analytics');
      return;
    }

    async function loadAnalytics() {
      try {
        const token = localStorage.getItem('abhi_token');
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await apiFetch('/api/analytics', {
          headers,
          credentials: 'include',
        });

        if (res.ok) {
          const json: AnalyticsData = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [user, authLoading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-[var(--ink)] opacity-70">
          <Loader2 className="animate-spin text-[var(--accent)]" size={20} />
          <span>Analyzing historical performance records...</span>
        </div>
      </div>
    );
  }

  if (!data || data.totalAttempts === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center space-y-6">
        <div className="mx-auto h-14 w-14 rounded-full bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center text-[var(--accent)]">
          <BarChart2 size={28} />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold">No Examination Records Found</h1>
          <p className="text-sm opacity-75 max-w-md mx-auto">
            Deep analytics, score trends, and topic-wise accuracy insights are generated after you complete your first timed mock test.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/mock-tests"
            className="inline-flex items-center gap-2 rounded bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            <span>Attempt a Mock Test</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      {/* Header */}
      <section className="border-b border-[var(--line)] bg-[var(--surface)] py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
                <TrendingUp size={14} /> Performance Analytics
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
                Candidate Progress & Diagnostics
              </h1>
              <p className="text-xs sm:text-sm opacity-75">
                Evaluation metrics derived across {data.totalAttempts} completed examination attempt{data.totalAttempts !== 1 ? 's' : ''}.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/my-tests"
                className="rounded border border-[var(--line)] bg-[var(--paper)] px-4 py-2 text-xs font-semibold hover:border-[var(--accent)] transition-colors"
              >
                View Attempt History
              </Link>
              <Link
                href="/mock-tests"
                className="rounded bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
              >
                New Mock Test
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Metric Overview Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-5 space-y-1">
            <div className="text-[11px] uppercase tracking-wider opacity-60 font-medium">
              Average Score
            </div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-[var(--ink)]">
              {data.averageScore}
            </div>
            <div className="text-[10px] opacity-60">across all tests</div>
          </div>

          <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-5 space-y-1">
            <div className="text-[11px] uppercase tracking-wider opacity-60 font-medium">
              Best Score
            </div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-[var(--accent)]">
              {data.bestScore}
            </div>
            <div className="text-[10px] opacity-60">highest single attempt</div>
          </div>

          <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-5 space-y-1">
            <div className="text-[11px] uppercase tracking-wider opacity-60 font-medium">
              Overall Accuracy
            </div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-[var(--ink)]">
              {data.averageAccuracy}%
            </div>
            <div className="text-[10px] opacity-60">correct / attempted</div>
          </div>

          <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-5 space-y-1">
            <div className="text-[11px] uppercase tracking-wider opacity-60 font-medium">
              Average Speed
            </div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-[var(--ink)]">
              {data.averageTimePerQuestion}s
            </div>
            <div className="text-[10px] opacity-60">per question attempted</div>
          </div>

          <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-5 space-y-1 col-span-2 sm:col-span-1">
            <div className="text-[11px] uppercase tracking-wider opacity-60 font-medium">
              Tests Attempted
            </div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-[var(--ink)]">
              {data.totalAttempts}
            </div>
            <div className="text-[10px] opacity-60">full & sectional</div>
          </div>
        </div>

        {/* Real Actionable Insights Panel (§10) */}
        {data.insights && data.insights.length > 0 && (
          <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              <Sparkles size={15} />
              Algorithmic Performance Insights
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {data.insights.map((insight, idx) => (
                <div
                  key={idx}
                  className="rounded border border-[var(--line)] bg-[var(--paper)] p-3.5 flex items-start gap-3 text-xs leading-relaxed"
                >
                  <CheckCircle2 size={16} className="text-[var(--accent)] flex-shrink-0 mt-0.5" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts: Score Trend and Accuracy Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Trend Chart */}
          <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold">Score Progression Trend</h3>
                <p className="text-xs opacity-70">Marks obtained in chronological order</p>
              </div>
            </div>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.scoreTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" opacity={0.5} />
                  <XAxis dataKey="date" stroke="var(--ink)" opacity={0.6} fontSize={11} />
                  <YAxis stroke="var(--ink)" opacity={0.6} fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--line)',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#scoreColor)"
                    name="Score"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Accuracy Trend Chart */}
          <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold">Accuracy Trend (%)</h3>
                <p className="text-xs opacity-70">Percentage of attempted questions answered correctly</p>
              </div>
            </div>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.accuracyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" opacity={0.5} />
                  <XAxis dataKey="date" stroke="var(--ink)" opacity={0.6} fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="var(--ink)" opacity={0.6} fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--line)',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    name="Accuracy %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Subject Performance Grid */}
        <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4">
          <div>
            <h3 className="font-serif text-lg font-bold">Subject-Wise Breakdown</h3>
            <p className="text-xs opacity-70">Overall accuracy, marks, and time efficiency across subjects</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--line)] opacity-60 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 pr-4">Subject</th>
                  <th className="py-2.5 px-3">Attempted</th>
                  <th className="py-2.5 px-3">Correct</th>
                  <th className="py-2.5 px-3">Incorrect</th>
                  <th className="py-2.5 px-3">Accuracy</th>
                  <th className="py-2.5 px-3">Total Score</th>
                  <th className="py-2.5 pl-3">Avg Speed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]/50 font-sans">
                {data.subjectPerformance.map((sub) => (
                  <tr key={sub.subjectName} className="hover:bg-[var(--paper)]/50 transition-colors">
                    <td className="py-3 pr-4 font-semibold text-sm">{sub.subjectName}</td>
                    <td className="py-3 px-3">{sub.attempted}</td>
                    <td className="py-3 px-3 text-green-600 font-semibold">{sub.correct}</td>
                    <td className="py-3 px-3 text-red-600 font-semibold">{sub.wrong}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-[var(--paper)] overflow-hidden border border-[var(--line)]">
                          <div
                            className={`h-full rounded-full ${
                              sub.accuracy >= 75
                                ? 'bg-green-600'
                                : sub.accuracy >= 60
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, sub.accuracy)}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold">{sub.accuracy}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[var(--accent)]">
                      {sub.totalScore}
                    </td>
                    <td className="py-3 pl-3 font-mono text-[var(--ink)] opacity-80">
                      {sub.avgTimePerQuestion}s / Q
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Weak Areas vs Strong Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weak Areas Card */}
          <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded bg-red-100 dark:bg-red-950 flex items-center justify-center text-red-600">
                  <AlertTriangle size={15} />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold">Weak Diagnostic Areas</h3>
                  <p className="text-[11px] opacity-70">Accuracy below 60% threshold</p>
                </div>
              </div>
            </div>

            {data.weakAreas.length === 0 ? (
              <div className="rounded border border-[var(--line)] bg-[var(--paper)] p-4 text-xs text-center opacity-75">
                No weak areas detected! All tested topics currently meet or exceed 60% accuracy.
              </div>
            ) : (
              <div className="space-y-2.5">
                {data.weakAreas.map((w) => (
                  <div
                    key={`${w.subjectName}-${w.topicName}`}
                    className="rounded border border-[var(--line)] bg-[var(--paper)] p-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold">{w.topicName}</div>
                      <div className="text-[10px] opacity-60">{w.subjectName} • {w.attempted} Qs attempted</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded bg-red-100 dark:bg-red-950 px-2 py-0.5 font-mono font-bold text-red-700 dark:text-red-300">
                        {w.accuracy}%
                      </span>
                      <Link
                        href="/practice"
                        className="rounded border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1 text-[11px] font-semibold hover:border-[var(--accent)] transition-colors"
                      >
                        Drill
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Strong Areas Card */}
          <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded bg-green-100 dark:bg-green-950 flex items-center justify-center text-green-600">
                  <Award size={15} />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold">Strong Mastery Areas</h3>
                  <p className="text-[11px] opacity-70">Accuracy 75% or higher</p>
                </div>
              </div>
            </div>

            {data.strongAreas.length === 0 ? (
              <div className="rounded border border-[var(--line)] bg-[var(--paper)] p-4 text-xs text-center opacity-75">
                Complete more sectional tests to establish high-confidence mastery topics.
              </div>
            ) : (
              <div className="space-y-2.5">
                {data.strongAreas.map((s) => (
                  <div
                    key={`${s.subjectName}-${s.topicName}`}
                    className="rounded border border-[var(--line)] bg-[var(--paper)] p-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold">{s.topicName}</div>
                      <div className="text-[10px] opacity-60">{s.subjectName} • {s.attempted} Qs attempted</div>
                    </div>
                    <span className="rounded bg-green-100 dark:bg-green-950 px-2 py-0.5 font-mono font-bold text-green-700 dark:text-green-300">
                      {s.accuracy}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
