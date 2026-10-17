import React, { useState, useEffect } from 'react';
import { useRouter } from '../contexts/RouterContext';
import { Award, Trophy, Medal } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { FALLBACK_EXAMS } from '../lib/fallbackData';
import { logger } from '../lib/logger';
import { Exam, LeaderboardEntry } from '../types';

export const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<string>('All-Time');
  const [exam, setExam] = useState<string>('All');
  const [examsList, setExamsList] = useState<Exam[]>(FALLBACK_EXAMS);

  useEffect(() => {
    let isMounted = true;
    async function loadExams() {
      try {
        const res = await apiFetch('/api/exams');
        if (res.ok && isMounted) {
          const json = await res.json();
          if (json.exams) {
            setExamsList(json.exams);
          }
        }
      } catch (e) {}
    }
    loadExams();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (period !== 'All-Time') params.set('period', period);
        if (exam !== 'All') params.set('exam', exam);

        const res = await apiFetch(`/api/leaderboard?${params.toString()}`);
        if (res.ok && isMounted) {
          const json = await res.json();
          setLeaderboard(json.leaderboard || []);
        }
      } catch (e) {
        logger.warn('Leaderboard fetch deferred:', e);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    fetchLeaderboard();
    return () => {
      isMounted = false;
    };
  }, [period, exam]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-[var(--line)] pb-5 space-y-1">
        <h1 className="font-serif text-3xl font-bold text-[var(--ink)]">
          National Candidate Leaderboard
        </h1>
        <p className="text-xs text-[var(--ink)] opacity-70">
          Rankings computed from verified mock test attempts under strict negative marking and server-synchronized timers.
        </p>
      </div>

      {/* Filter controls */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        {/* Period Pills */}
        <div className="flex items-center gap-2">
          {(['Weekly', 'Monthly', 'All-Time'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded border px-3 py-1.5 text-xs font-semibold transition-colors ${
                period === p
                  ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                  : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] opacity-75 hover:opacity-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Exam Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase opacity-60">Filter by Exam:</span>
          <select
            value={exam}
            onChange={(e) => setExam(e.target.value)}
            className="rounded border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
          >
            <option value="All">All Examinations</option>
            {examsList.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leaderboard Table */}
      {loading ? (
        <div className="py-20 text-center text-sm opacity-60">Computing rank percentiles...</div>
      ) : leaderboard.length === 0 ? (
        <div className="rounded border border-[var(--line)] bg-[var(--surface)] py-16 text-center text-xs opacity-60">
          No test completions recorded for this timeframe yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded border border-[var(--line)] bg-[var(--surface)]">
          <table className="w-full text-left text-xs text-[var(--ink)]">
            <thead className="border-b border-[var(--line)] bg-[var(--paper)] text-[10px] font-bold uppercase tracking-wider opacity-70">
              <tr>
                <th className="py-3 px-4 text-center w-16">Rank</th>
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3 px-4">Total Score</th>
                <th className="py-3 px-4">Average Score</th>
                <th className="py-3 px-4">Best Score</th>
                <th className="py-3 px-4">Avg Accuracy</th>
                <th className="py-3 px-4 text-right">Tests Attempted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] font-mono">
              {leaderboard.map((u) => (
                <tr
                  key={u.userId}
                  className={`hover:bg-[var(--paper)] transition-colors ${
                    u.rank === 1 ? 'bg-amber-50/40 dark:bg-amber-950/10 font-bold' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        u.rank === 1
                          ? 'bg-amber-400 text-amber-950'
                          : u.rank === 2
                          ? 'bg-gray-300 text-gray-900'
                          : u.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'opacity-70'
                      }`}
                    >
                      {u.rank}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-sans font-semibold text-[var(--ink)]">
                    {u.displayName}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[var(--accent)]">{u.totalScore}</td>
                  <td className="py-3.5 px-4">{u.averageScore}</td>
                  <td className="py-3.5 px-4 font-bold">{u.bestScore}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-[var(--signal-correct)]">{u.averageAccuracy}%</span>
                  </td>
                  <td className="py-3.5 px-4 text-right opacity-80">{u.testsAttempted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
