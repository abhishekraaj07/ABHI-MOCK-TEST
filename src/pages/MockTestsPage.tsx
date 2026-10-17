import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../contexts/RouterContext';
import { TestSummary } from '../types';
import { Search, X, Lock, Clock, Award, HelpCircle, ChevronRight } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { FALLBACK_EXAMS } from '../lib/fallbackData';
import { logger } from '../lib/logger';

export const MockTestsPage: React.FC = () => {
  const { queryParams } = useRouter();
  const initialTab = queryParams.get('tab') || 'All';
  const initialExam = queryParams.get('exam') || 'All';

  const [tests, setTests] = useState<TestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [search, setSearch] = useState<string>('');
  const [selectedExam, setSelectedExam] = useState<string>(initialExam);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  const [examsList, setExamsList] = useState<{ id: string; name: string; slug: string }[]>(
    FALLBACK_EXAMS.map((e) => ({ id: e.id, name: e.name, slug: e.slug }))
  );

  // Sync query parameters when navigating
  useEffect(() => {
    const qTab = queryParams.get('tab');
    if (qTab) {
      setActiveTab(qTab);
    }
    const qExam = queryParams.get('exam');
    if (qExam) {
      setSelectedExam(qExam);
    }
  }, [queryParams]);

  // Load exams for filter dropdown
  useEffect(() => {
    let isMounted = true;
    async function loadExams() {
      try {
        const res = await apiFetch('/api/exams');
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data.exams) {
            setExamsList(data.exams);
          }
        }
      } catch (e) {
        logger.warn('Could not refresh exam filter list, using fallback:', e);
      }
    }
    loadExams();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch tests with filters
  useEffect(() => {
    let isMounted = true;
    async function fetchTests() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (activeTab !== 'All') params.set('tab', activeTab);
        if (search.trim()) params.set('search', search.trim());
        if (selectedExam !== 'All') params.set('exam', selectedExam);
        if (selectedDifficulty !== 'All') params.set('difficulty', selectedDifficulty);

        const res = await apiFetch(`/api/tests?${params.toString()}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setTests(data.tests || []);
        }
      } catch (err) {
        logger.warn('Failed to load tests:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    const timer = setTimeout(() => {
      fetchTests();
    }, 200);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [activeTab, search, selectedExam, selectedDifficulty]);

  const tabs = ['All', 'Full Tests', 'Sectional', 'Free', 'Premium', 'Practice'];
  const difficulties = ['All', 'Easy', 'Moderate', 'Hard'];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[var(--line)] pb-6 space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[var(--ink)]">
          Mock Test Library
        </h1>
        <p className="text-sm text-[var(--ink)] opacity-75 max-w-3xl">
          Simulated full-length examination sets, sectional speed drills, and topic-specific practice tests with official negative-marking parameters.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--line)] gap-2 sm:gap-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--ink)] opacity-60 hover:opacity-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-3 text-[var(--ink)] opacity-50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tests by title or exam..."
            className="w-full rounded border border-[var(--line)] bg-[var(--surface)] pl-9 pr-8 py-2 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 text-[var(--ink)] opacity-50 hover:opacity-100"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase opacity-60">Exam:</span>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="rounded border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
            >
              <option value="All">All Exams</option>
              {examsList.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase opacity-60">Difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="rounded border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
            >
              {difficulties.map((diff) => (
                <option key={diff} value={diff}>
                  {diff}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tests Grid */}
      {loading ? (
        <div className="py-20 text-center text-sm text-[var(--ink)] opacity-60">
          Loading mock tests...
        </div>
      ) : tests.length === 0 ? (
        <div className="rounded border border-[var(--line)] bg-[var(--paper)] py-16 text-center space-y-3">
          <p className="font-semibold text-[var(--ink)]">No tests found matching your criteria.</p>
          <button
            onClick={() => {
              setActiveTab('All');
              setSearch('');
              setSelectedExam('All');
              setSelectedDifficulty('All');
            }}
            className="text-xs font-semibold text-[var(--accent)] hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <div
              key={test.id}
              className="flex flex-col justify-between rounded border border-[var(--line)] bg-[var(--surface)] p-6 hover:border-[var(--accent)] transition-colors shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-[var(--paper)] border border-[var(--line)] px-2 py-0.5 text-[11px] font-semibold text-[var(--accent)]">
                    {test.examName}
                  </span>
                  {test.isPremium ? (
                    <span className="flex items-center gap-1 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                      <Lock size={10} /> PREMIUM
                    </span>
                  ) : (
                    <span className="rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                      FREE
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="font-serif text-lg font-bold text-[var(--ink)]">
                    {test.title}
                  </h2>
                  <div className="text-xs opacity-70 mt-0.5">{test.subjectName}</div>
                </div>

                <p className="text-xs text-[var(--ink)] opacity-75 line-clamp-2">
                  {test.description}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 border-y border-[var(--line)] py-2 text-center font-mono text-xs">
                  <div>
                    <div className="opacity-60 text-[10px] uppercase">Duration</div>
                    <div className="font-semibold">{test.duration} mins</div>
                  </div>
                  <div>
                    <div className="opacity-60 text-[10px] uppercase">Questions</div>
                    <div className="font-semibold">{test.questionCount} Qs</div>
                  </div>
                  <div>
                    <div className="opacity-60 text-[10px] uppercase">Marks</div>
                    <div className="font-semibold">{test.totalMarks}</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-[var(--line)] pt-4 mt-5 flex items-center justify-between">
                <span className="text-xs font-mono opacity-60">
                  {test.attemptCount} completed
                </span>

                <Link
                  href={`/test/${test.id}/instructions`}
                  id={`instructions-btn-${test.id}`}
                  className="rounded bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors flex items-center gap-1"
                >
                  Start Test <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MockTestsPage;
