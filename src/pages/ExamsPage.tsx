import React, { useState, useEffect } from 'react';
import { Link, useRouter } from '../contexts/RouterContext';
import { Exam } from '../types';
import { Search, X, BookOpen, Layers, LayoutGrid, ListFilter, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { FALLBACK_EXAMS } from '../lib/fallbackData';
import { logger } from '../lib/logger';

interface CategoryMeta {
  id: string;
  name: string;
  icon: string;
  desc: string;
}

const CATEGORIES_META: CategoryMeta[] = [
  { id: 'All', name: 'All Streams', icon: '🌟', desc: 'Browse all national recruitment and university programs.' },
  { id: 'Railways', name: 'Railways Recruitment (RRB)', icon: '🚂', desc: 'RRB NTPC (UG) 2026 CEN 07/2026 official CBT-1 & sectional mocks.' },
  { id: 'University Degree', name: 'University Degree Examinations', icon: '🎓', desc: 'Chaudhary Charan Singh University (CCSU) BCA 5th Sem master subject suites.' },
  { id: 'Banking', name: 'Banking & Insurance', icon: '🏦', desc: 'SBI PO, IBPS PO, RRB PO & SBI Clerk national recruitment.' },
  { id: 'SSC', name: 'Staff Selection Commission (SSC)', icon: '🏛️', desc: 'Combined Graduate Level (CGL) central government posts.' },
  { id: 'Regulatory', name: 'Regulatory Body Officers', icon: '⚖️', desc: 'Reserve Bank of India Grade B Officers Phase 1 recruitment.' },
];

export const ExamsPage: React.FC = () => {
  const { queryParams } = useRouter();
  const [exams, setExams] = useState<Exam[]>(FALLBACK_EXAMS);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>(queryParams.get('search') || '');
  const [category, setCategory] = useState<string>(queryParams.get('category') || 'All');
  const [difficulty, setDifficulty] = useState<string>(queryParams.get('difficulty') || 'All');
  const [viewMode, setViewMode] = useState<'grouped' | 'grid'>('grouped');
  const [bankingExpanded, setBankingExpanded] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchExams() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set('search', search.trim());
        if (category !== 'All') params.set('category', category);
        if (difficulty !== 'All') params.set('difficulty', difficulty);

        const res = await apiFetch(`/api/exams?${params.toString()}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setExams(data.exams || []);
        }
      } catch (err) {
        logger.warn('Could not refresh exams list, using cached catalog:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    const timer = setTimeout(() => {
      fetchExams();
    }, 250);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [search, category, difficulty]);

  const difficulties = ['All', 'Easy', 'Moderate', 'Hard'];

  // Helper to render single exam card
  const renderExamCard = (exam: Exam) => (
    <div
      key={exam.id}
      className="flex flex-col justify-between rounded border border-[var(--line)] bg-[var(--surface)] p-6 hover:border-[var(--accent)] transition-all shadow-xs group"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="rounded bg-[var(--paper)] border border-[var(--line)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--accent)]">
            {exam.category}
          </span>
          <span className="text-xs font-mono text-[var(--ink)] opacity-60">
            Difficulty: {exam.difficulty}
          </span>
        </div>

        <div>
          <h2 className="font-serif text-2xl font-bold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
            {exam.name}
          </h2>
          <p className="text-xs text-[var(--ink)] opacity-75 mt-2 line-clamp-3 leading-relaxed">
            {exam.description}
          </p>
        </div>

        <div className="space-y-1.5 pt-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink)] opacity-60">
            Subjects Covered
          </div>
          <div className="flex flex-wrap gap-1.5">
            {exam.subjects.map((sub) => (
              <span
                key={sub}
                className="rounded border border-[var(--line)] bg-[var(--paper)] px-2 py-0.5 text-[11px] text-[var(--ink)] opacity-85"
              >
                {sub}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--line)] pt-4 mt-6 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs font-mono text-[var(--ink)] opacity-70">
          <span className="flex items-center gap-1">
            <Layers size={13} /> {exam.testCount} Tests
          </span>
          <span className="flex items-center gap-1">
            <BookOpen size={13} /> {exam.questionCount} Questions
          </span>
        </div>

        <Link
          href={`/exams/${exam.slug}`}
          id={`view-exam-${exam.slug}`}
          className="rounded bg-[var(--accent)] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors shadow-xs"
        >
          View Tests →
        </Link>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[var(--line)] pb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
          <Sparkles size={14} /> Organized Exam Categories
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[var(--ink)]">
          Target Examinations
        </h1>
        <p className="text-sm text-[var(--ink)] opacity-75 max-w-3xl">
          Browse structured syllabus roadmaps organized by recruitment stream. Select a specific category or use grouped mode to avoid cluttered screens.
        </p>
      </div>

      {/* Filter Controls & View Switcher */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-3 text-[var(--ink)] opacity-50" />
            <input
              id="exam-search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exams by name or keywords..."
              className="w-full rounded border border-[var(--line)] bg-[var(--surface)] pl-9 pr-8 py-2 text-sm text-[var(--ink)] placeholder-opacity-50 focus:border-[var(--accent)] focus:outline-none"
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

          {/* Difficulty & View Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Difficulty Pills */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[var(--ink)] opacity-60 uppercase mr-1">
                Difficulty:
              </span>
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`rounded border px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                    difficulty === diff
                      ? 'border-[var(--ink)] bg-[var(--ink)] text-white dark:bg-white dark:text-[var(--paper)]'
                      : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] opacity-70 hover:opacity-100'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="border-l border-[var(--line)] pl-3 flex items-center gap-1">
              <button
                onClick={() => setViewMode('grouped')}
                title="Group by Stream"
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border transition-colors cursor-pointer ${
                  viewMode === 'grouped'
                    ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                    : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] opacity-70 hover:opacity-100'
                }`}
              >
                <ListFilter size={13} />
                <span className="hidden sm:inline">Grouped</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Grid View"
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                    : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] opacity-70 hover:opacity-100'
                }`}
              >
                <LayoutGrid size={13} />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--line)] pb-4">
          <span className="text-xs font-semibold text-[var(--ink)] opacity-60 uppercase mr-1">
            Category:
          </span>
          {CATEGORIES_META.map((cat) => {
            const count = cat.id === 'All' ? exams.length : exams.filter((e) => e.category === cat.id).length;
            const isSelected = category === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[var(--accent)] bg-[var(--accent)] text-white shadow-xs'
                    : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] opacity-80 hover:opacity-100 hover:border-gray-400'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.id === 'All' ? 'All' : cat.name.split(' (')[0]}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[var(--paper)] text-[var(--ink)] opacity-70'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center text-sm text-[var(--ink)] opacity-60">
          Loading examinations...
        </div>
      ) : exams.length === 0 ? (
        <div className="rounded border border-[var(--line)] bg-[var(--paper)] py-16 text-center space-y-3">
          <p className="font-semibold text-[var(--ink)]">No examinations match your criteria.</p>
          <button
            onClick={() => {
              setSearch('');
              setCategory('All');
              setDifficulty('All');
            }}
            className="text-xs font-semibold text-[var(--accent)] hover:underline"
          >
            Reset all filters
          </button>
        </div>
      ) : viewMode === 'grouped' && category === 'All' && !search.trim() ? (
        /* ================= GROUPED CLUTTER-FREE STREAM VIEW ================= */
        <div className="space-y-12">
          {/* 1. Railways Recruitment */}
          {(() => {
            const railwayExams = exams.filter((e) => e.category === 'Railways');
            if (railwayExams.length === 0) return null;
            return (
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🚂</span>
                    <h2 className="font-serif text-xl font-bold text-[var(--ink)]">
                      Railways Recruitment Board (RRB)
                    </h2>
                    <span className="rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold px-2 py-0.5 border border-emerald-300 dark:border-emerald-800">
                      {railwayExams.length} Active Stream
                    </span>
                  </div>
                  <button
                    onClick={() => setCategory('Railways')}
                    className="text-xs font-medium text-[var(--accent)] hover:underline cursor-pointer"
                  >
                    View Railways Only →
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {railwayExams.map(renderExamCard)}
                </div>
              </section>
            );
          })()}

          {/* 2. University Degree Examinations */}
          {(() => {
            const universityExams = exams.filter((e) => e.category === 'University Degree');
            if (universityExams.length === 0) return null;
            return (
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎓</span>
                    <h2 className="font-serif text-xl font-bold text-[var(--ink)]">
                      University Degree Examinations (CCSU)
                    </h2>
                    <span className="rounded bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-[11px] font-semibold px-2 py-0.5 border border-blue-300 dark:border-blue-800">
                      {universityExams.length} Degree Suite
                    </span>
                  </div>
                  <button
                    onClick={() => setCategory('University Degree')}
                    className="text-xs font-medium text-[var(--accent)] hover:underline cursor-pointer"
                  >
                    View Degree Exams Only →
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {universityExams.map(renderExamCard)}
                </div>
              </section>
            );
          })()}

          {/* 3. Banking & Insurance — CLUTTER-FREE ACCORDION */}
          {(() => {
            const bankingExams = exams.filter((e) => e.category === 'Banking');
            if (bankingExams.length === 0) return null;

            const visibleBanking = bankingExpanded ? bankingExams : bankingExams.slice(0, 2);
            const hiddenCount = bankingExams.length - 2;

            return (
              <section className="space-y-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🏦</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-serif text-xl font-bold text-[var(--ink)]">
                          Banking & Insurance Examinations
                        </h2>
                        <span className="rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[11px] font-semibold px-2 py-0.5 border border-amber-300 dark:border-amber-800">
                          {bankingExams.length} Exams Hub
                        </span>
                      </div>
                      <p className="text-xs text-[var(--ink)] opacity-70 mt-0.5">
                        Grouped banking suite to avoid screen clutter: SBI PO, IBPS PO, RRB PO, and SBI Clerk.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBankingExpanded((prev) => !prev)}
                      className="inline-flex items-center gap-1.5 rounded border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--ink)] hover:border-[var(--accent)] transition-colors cursor-pointer"
                    >
                      {bankingExpanded ? (
                        <>
                          <ChevronUp size={14} />
                          <span>Show Compact (Top 2)</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown size={14} />
                          <span>Expand All {bankingExams.length} Exams</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setCategory('Banking')}
                      className="text-xs font-medium text-[var(--accent)] hover:underline whitespace-nowrap cursor-pointer ml-1"
                    >
                      Banking Only →
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visibleBanking.map(renderExamCard)}

                  {/* Compact Expansion Card when not expanded */}
                  {!bankingExpanded && hiddenCount > 0 && (
                    <div
                      onClick={() => setBankingExpanded(true)}
                      className="flex flex-col items-center justify-center rounded border border-dashed border-amber-400 dark:border-amber-700 bg-[var(--surface)] p-6 text-center space-y-3 cursor-pointer hover:bg-amber-50/60 dark:hover:bg-amber-950/30 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold">
                        +{hiddenCount}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
                          +{hiddenCount} More Banking Exams
                        </div>
                        <div className="text-xs text-[var(--ink)] opacity-70 mt-1">
                          RRB PO & SBI Clerk recruitment mocks
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] group-hover:underline">
                        <span>Click to expand all {bankingExams.length}</span>
                        <ChevronDown size={14} />
                      </span>
                    </div>
                  )}
                </div>
              </section>
            );
          })()}

          {/* 4. SSC & Regulatory Stream */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏛️</span>
                <h2 className="font-serif text-xl font-bold text-[var(--ink)]">
                  SSC & Regulatory Bodies (Central Govt)
                </h2>
                <span className="rounded bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 text-[11px] font-semibold px-2 py-0.5 border border-purple-300 dark:border-purple-800">
                  SSC CGL & RBI Grade B
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams
                .filter((e) => e.category === 'SSC' || e.category === 'Regulatory')
                .map(renderExamCard)}
            </div>
          </section>
        </div>
      ) : (
        /* ================= STANDARD GRID VIEW (OR SINGLE CATEGORY FILTERED) ================= */
        <div className="space-y-4">
          {category !== 'All' && (
            <div className="flex items-center justify-between bg-[var(--paper)] border border-[var(--line)] p-4 rounded-lg text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[var(--ink)]">
                  Filtered by Category: <span className="text-[var(--accent)] font-bold">{category}</span>
                </span>
                <span className="opacity-60">({exams.length} exams matching)</span>
              </div>
              <button
                onClick={() => setCategory('All')}
                className="text-xs font-semibold text-[var(--accent)] hover:underline cursor-pointer"
              >
                Clear Category Filter (Show All)
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map(renderExamCard)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamsPage;
