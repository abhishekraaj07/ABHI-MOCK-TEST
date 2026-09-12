import React, { useState, useEffect } from 'react';
import { Link, useRouter } from '../contexts/RouterContext';
import { Exam } from '../types';
import { Search, X, BookOpen, Layers } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { FALLBACK_EXAMS } from '../lib/fallbackData';

export const ExamsPage: React.FC = () => {
  const { queryParams } = useRouter();
  const [exams, setExams] = useState<Exam[]>(FALLBACK_EXAMS);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>(queryParams.get('search') || '');
  const [category, setCategory] = useState<string>(queryParams.get('category') || 'All');
  const [difficulty, setDifficulty] = useState<string>(queryParams.get('difficulty') || 'All');

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
        console.warn('Could not refresh exams list, using cached catalog:', err);
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

  const categories = ['All', 'Banking', 'SSC', 'Regulatory'];
  const difficulties = ['All', 'Easy', 'Moderate', 'Hard'];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[var(--line)] pb-6 space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[var(--ink)]">
          Target Examinations
        </h1>
        <p className="text-sm text-[var(--ink)] opacity-75 max-w-3xl">
          Structured syllabus roadmaps and official examination patterns for all major national banking, SSC, and regulatory body selections.
        </p>
      </div>

      {/* Filter Controls */}
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

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[var(--ink)] opacity-60 uppercase mr-1">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded border px-3 py-1 text-xs font-semibold transition-colors ${
                category === cat
                  ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                  : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] opacity-80 hover:opacity-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Difficulty Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[var(--ink)] opacity-60 uppercase mr-1">
            Difficulty:
          </span>
          {difficulties.map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficulty(diff)}
              className={`rounded border px-2.5 py-1 text-xs font-semibold transition-colors ${
                difficulty === diff
                  ? 'border-[var(--ink)] bg-[var(--ink)] text-white dark:bg-white dark:text-[var(--paper)]'
                  : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] opacity-70 hover:opacity-100'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Exam Cards Grid */}
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="flex flex-col justify-between rounded border border-[var(--line)] bg-[var(--surface)] p-6 hover:border-[var(--accent)] transition-colors shadow-sm"
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
                  <h2 className="font-serif text-2xl font-bold text-[var(--ink)]">
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
                  className="rounded bg-[var(--accent)] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
                >
                  View Tests →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamsPage;
