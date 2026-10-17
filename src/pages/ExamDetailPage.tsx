import React, { useEffect, useState } from 'react';
import { useRouter, Link } from '../contexts/RouterContext';
import { ExamDetail, SubjectDetail, TestSummary } from '../types';
import { HelpCircle, ChevronRight, Lock, ArrowLeft } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { logger } from '../lib/logger';

class ExamDetailErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('ExamDetail boundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-2xl px-4 py-20 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
            <HelpCircle size={24} />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[var(--ink)]">
            Examination Portal Notice
          </h2>
          <p className="text-sm text-[var(--ink)] opacity-75 max-w-md mx-auto">
            Unable to load examination details at this moment. You can view all available exams or retry.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => this.setState({ hasError: false })}
              className="rounded bg-[var(--surface)] border border-[var(--line)] px-4 py-2 text-xs font-bold text-[var(--ink)] hover:border-[var(--accent)]"
            >
              Retry
            </button>
            <Link
              href="/exams"
              className="rounded bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white hover:bg-[var(--accent-hover)]"
            >
              Back to all exams
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const ExamDetailInner: React.FC<{ examSlugOrId?: string; slug?: string }> = ({ examSlugOrId, slug }) => {
  const effectiveIdOrSlug = slug || examSlugOrId || '';
  const { navigate } = useRouter();
  const [data, setData] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Full Length' | 'Sectional' | 'Practice' | 'Previous Year'>('Full Length');

  useEffect(() => {
    let isMounted = true;
    async function loadExam() {
      if (!effectiveIdOrSlug) return;
      try {
        const res = await apiFetch(`/api/exams/${effectiveIdOrSlug}`);
        if (res.ok && isMounted) {
          const json = await res.json();
          setData(json.exam);
        }
      } catch (e) {
        logger.warn('Error fetching exam detail:', e);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadExam();
    return () => {
      isMounted = false;
    };
  }, [effectiveIdOrSlug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-sm text-[var(--ink)] opacity-60">
        Loading examination framework and tests...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[var(--ink)]">Examination Not Found</h2>
        <p className="text-sm opacity-70">The requested exam could not be located in the database.</p>
        <Link href="/exams" className="inline-block rounded bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white">
          Back to all exams
        </Link>
      </div>
    );
  }

  // Defensively ensure testsGrouped structure is never undefined
  const testsGrouped: Record<string, TestSummary[]> = {
    'Full Length': [],
    'Sectional': [],
    'Practice': [],
    'Previous Year': [],
    ...(data?.testsGrouped || {}),
  };

  // Safely normalize subjects whether they are strings or detailed objects
  const normalizedSubjects = (data.subjects || []).map((sub: string | Partial<SubjectDetail>, idx: number) => {
    if (typeof sub === 'string') {
      return {
        id: `sub-${idx + 1}`,
        name: sub,
        questionCount: 20,
        topics: ['Concept Drills', 'Previous Year Questions', 'Mock Practice'],
      };
    }
    return {
      id: sub.id || `sub-${idx + 1}`,
      name: sub.name || 'Subject Module',
      questionCount: sub.questionCount ?? 20,
      topics: Array.isArray(sub.topics) ? sub.topics : ['Concept Drills', 'Previous Year Questions', 'Mock Practice'],
    };
  });

  const currentTests: TestSummary[] = testsGrouped[activeTab] || [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/exams"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline"
        >
          <ArrowLeft size={14} /> Back to all exams
        </Link>
      </div>

      {/* Header Profile */}
      <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded bg-[var(--paper)] border border-[var(--line)] px-2.5 py-1 text-xs font-bold text-[var(--accent)]">
            {data.category}
          </span>
          <span className="text-xs font-mono opacity-70">
            Official Difficulty: {data.difficulty}
          </span>
          <span className="text-xs font-mono opacity-70">
            Bank Size: {data.questionCount} Questions
          </span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--ink)]">
          {data.name}
        </h1>

        <p className="text-sm text-[var(--ink)] opacity-80 max-w-3xl leading-relaxed">
          {data.description}
        </p>

        {/* Subjects & Topics Breakdown Accordion/Grid */}
        {normalizedSubjects.length > 0 && (
          <div className="border-t border-[var(--line)] pt-6 mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)] mb-3">
              Examination Syllabus & Subject Modules
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {normalizedSubjects.map((sub) => (
                <div key={sub.id} className="rounded border border-[var(--line)] bg-[var(--paper)] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[var(--ink)]">{sub.name}</h3>
                    <span className="text-[10px] font-mono opacity-60">{sub.questionCount} Qs</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {sub.topics.map((tp) => (
                      <span
                        key={tp}
                        className="rounded bg-[var(--surface)] border border-[var(--line)] px-1.5 py-0.5 text-[10px] opacity-80"
                      >
                        {tp}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Test Categories Tabs */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
          <div className="flex gap-2 sm:gap-4 overflow-x-auto">
            {(['Full Length', 'Sectional', 'Practice', 'Previous Year'] as const).map((tab) => {
              const count = testsGrouped[tab]?.length || 0;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === tab
                      ? 'border-[var(--accent)] text-[var(--accent)]'
                      : 'border-transparent text-[var(--ink)] opacity-60 hover:opacity-100'
                  }`}
                >
                  <span>{tab} Mocks</span>
                  <span className="rounded-full bg-[var(--paper)] border border-[var(--line)] px-2 py-0.2 text-[11px] font-mono">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tests List */}
        {currentTests.length === 0 ? (
          <div className="rounded border border-[var(--line)] bg-[var(--surface)] py-12 text-center text-sm opacity-60">
            No {activeTab} mock tests currently available for this examination.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentTests.map((test) => (
              <div
                key={test.id}
                className="flex flex-col justify-between rounded border border-[var(--line)] bg-[var(--surface)] p-6 hover:border-[var(--accent)] transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium opacity-70">
                      {test.subjectName}
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

                  <h3 className="font-serif text-lg font-bold text-[var(--ink)]">
                    {test.title}
                  </h3>

                  <p className="text-xs text-[var(--ink)] opacity-75 line-clamp-2">
                    {test.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 border-y border-[var(--line)] py-2 text-center font-mono text-xs">
                    <div>
                      <div className="opacity-60 text-[10px] uppercase">Time</div>
                      <div className="font-semibold">{test.duration}m</div>
                    </div>
                    <div>
                      <div className="opacity-60 text-[10px] uppercase">Marks</div>
                      <div className="font-semibold">{test.totalMarks}</div>
                    </div>
                    <div>
                      <div className="opacity-60 text-[10px] uppercase">Negative</div>
                      <div className="font-semibold">-{test.negativeMarks}</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[var(--line)] pt-4 mt-5 flex items-center justify-between">
                  <span className="text-xs font-mono opacity-60">
                    {test.attemptCount} attempts
                  </span>

                  <Link
                    href={`/test/${test.id}/instructions`}
                    id={`start-test-${test.id}`}
                    className="rounded bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors flex items-center gap-1"
                  >
                    Instructions <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const ExamDetailPage: React.FC<{ examSlugOrId?: string; slug?: string }> = (props) => {
  return (
    <ExamDetailErrorBoundary>
      <ExamDetailInner {...props} />
    </ExamDetailErrorBoundary>
  );
};

export default ExamDetailPage;
