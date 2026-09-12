import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../contexts/RouterContext';
import { AttemptHistoryItem } from '../types';
import { Clock, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';

export const MyTestsPage: React.FC = () => {
  const { navigate } = useRouter();
  const [attempts, setAttempts] = useState<AttemptHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'All' | 'Completed' | 'In Progress'>('All');

  useEffect(() => {
    async function loadAttempts() {
      try {
        const token = localStorage.getItem('abhi_token');
        if (!token) {
          navigate('/login?redirect=/my-tests');
          return;
        }

        const params = new URLSearchParams();
        if (activeTab !== 'All') params.set('status', activeTab);

        const res = await fetch(`/api/attempts?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const json = await res.json();
          setAttempts(json.attempts || []);
        }
      } catch (e) {
        console.error('Failed to load attempts:', e);
      } finally {
        setLoading(false);
      }
    }

    loadAttempts();
  }, [activeTab, navigate]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-[var(--line)] pb-5 space-y-1">
        <h1 className="font-serif text-3xl font-bold text-[var(--ink)]">My Examination Records</h1>
        <p className="text-xs text-[var(--ink)] opacity-70">
          Complete archive of your timed attempts, scores, and active in-progress sessions.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--line)] gap-6">
        {(['All', 'Completed', 'In Progress'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--ink)] opacity-60 hover:opacity-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-[var(--ink)] opacity-60">
          Loading attempt history...
        </div>
      ) : attempts.length === 0 ? (
        <div className="rounded border border-[var(--line)] bg-[var(--surface)] py-16 text-center space-y-3">
          <p className="font-semibold text-[var(--ink)]">No examination records found under this filter.</p>
          <Link
            href="/mock-tests"
            className="inline-block rounded bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white"
          >
            Browse Mock Tests
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded border border-[var(--line)] bg-[var(--surface)]">
          <table className="w-full text-left text-xs text-[var(--ink)]">
            <thead className="border-b border-[var(--line)] bg-[var(--paper)] text-[10px] font-bold uppercase tracking-wider opacity-70">
              <tr>
                <th className="py-3 px-4">Test Title</th>
                <th className="py-3 px-4">Exam / Subject</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] font-mono">
              {attempts.map((att) => (
                <tr key={att.id} className="hover:bg-[var(--paper)] transition-colors">
                  <td className="py-4 px-4 font-sans font-medium max-w-xs truncate">
                    {att.testTitle}
                  </td>
                  <td className="py-4 px-4 font-sans opacity-80">
                    <div>{att.examName}</div>
                    <div className="text-[10px] opacity-60">{att.subjectName}</div>
                  </td>
                  <td className="py-4 px-4">
                    {att.status === 'COMPLETED' ? (
                      <span className="rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                        COMPLETED
                      </span>
                    ) : (
                      <span className="rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                        IN PROGRESS
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 font-bold text-[var(--accent)]">
                    {att.status === 'COMPLETED' ? `${att.score} / ${att.totalMarks}` : '—'}
                  </td>
                  <td className="py-4 px-4">
                    {att.status === 'COMPLETED' ? `${att.accuracy}%` : '—'}
                  </td>
                  <td className="py-4 px-4 opacity-60 font-sans">
                    {new Date(att.startedAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4 text-right font-sans">
                    {att.status === 'COMPLETED' ? (
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/result/${att.id}`}
                          className="font-semibold text-[var(--accent)] hover:underline"
                        >
                          View Result
                        </Link>
                        <Link
                          href={`/test/${att.testId}/instructions`}
                          className="opacity-70 hover:opacity-100 hover:text-[var(--accent)]"
                        >
                          Retake
                        </Link>
                      </div>
                    ) : (
                      <Link
                        href={`/test/${att.id}`}
                        className="rounded bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700"
                      >
                        Resume →
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyTestsPage;
