import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, Link } from '../contexts/RouterContext';
import {
  BookX,
  AlertOctagon,
  Sparkles,
  Search,
  Filter,
  Flame,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  ArrowRight,
  Flag,
  X,
  Clock,
  Layers,
} from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { QuestionReportModal } from '../components/QuestionReportModal';

interface WrongQuestion {
  questionId: string;
  questionText: string;
  difficulty: string;
  marks: number;
  negativeMarks: number;
  explanation: string;
  shortcut?: string | null;
  subjectName: string;
  topicName: string;
  examName: string;
  correctOptionKey: string;
  correctOptionText: string;
  lastChosenOption: string | null;
  missCount: number;
  lastAttemptDate: string;
  lastTestTitle: string;
  options: {
    optionKey: string;
    optionText: string;
    isCorrect: boolean;
  }[];
}

export const WrongQuestionsPage: React.FC = () => {
  const { navigate } = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [questions, setQuestions] = useState<WrongQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [sortBy, setSortBy] = useState<'missCount' | 'recent'>('missCount');

  // Interactive Drill Mode State
  const [drillMode, setDrillMode] = useState(false);
  const [drillIndex, setDrillIndex] = useState(0);
  const [drillAnswers, setDrillAnswers] = useState<Record<string, string>>({});
  const [drillScore, setDrillScore] = useState(0);

  // Modals
  const [reportingQuestion, setReportingQuestion] = useState<WrongQuestion | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login?redirect=/wrong-questions');
      return;
    }

    async function fetchMistakes() {
      try {
        const token = localStorage.getItem('abhi_token');
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await apiFetch('/api/analytics/wrong-questions', {
          headers,
          credentials: 'include',
        });

        let wrongList: WrongQuestion[] = [];
        if (res.ok) {
          try {
            const data = await res.json();
            wrongList = data.wrongQuestions || [];
          } catch {}
        }

        // Merge locally captured wrong questions from test engine
        try {
          const localWrongs = JSON.parse(localStorage.getItem('abhi_wrong_questions') || '[]');
          if (Array.isArray(localWrongs) && localWrongs.length > 0) {
            const localIds = new Set(localWrongs.map((w: any) => w.questionId));
            wrongList = [...localWrongs, ...wrongList.filter((q) => !localIds.has(q.questionId))];
          }
        } catch {}

        setQuestions(wrongList);
      } catch (err: any) {
        console.error('Error fetching mistake questions:', err);
        // Fallback to local wrongs if network fails
        try {
          const localWrongs = JSON.parse(localStorage.getItem('abhi_wrong_questions') || '[]');
          if (Array.isArray(localWrongs) && localWrongs.length > 0) {
            setQuestions(localWrongs);
            setError(null);
            return;
          }
        } catch {}
        setError(err.message || 'Failed to load mistake notebook.');
      } finally {
        setLoading(false);
      }
    }

    fetchMistakes();
  }, [user, authLoading, navigate]);

  // Unique subjects
  const subjects = useMemo(() => {
    const s = new Set<string>();
    questions.forEach((q) => {
      if (q.subjectName) s.add(q.subjectName);
    });
    return Array.from(s).sort();
  }, [questions]);

  // Filtered & Sorted questions
  const filteredQuestions = useMemo(() => {
    let result = questions.filter((q) => {
      if (selectedSubject !== 'All' && q.subjectName !== selectedSubject) return false;
      if (selectedDifficulty !== 'All' && q.difficulty !== selectedDifficulty) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const textMatch = q.questionText.toLowerCase().includes(query);
        const topicMatch = q.topicName.toLowerCase().includes(query);
        if (!textMatch && !topicMatch) return false;
      }
      return true;
    });

    if (sortBy === 'missCount') {
      result.sort((a, b) => b.missCount - a.missCount);
    } else {
      result.sort(
        (a, b) => new Date(b.lastAttemptDate).getTime() - new Date(a.lastAttemptDate).getTime()
      );
    }

    return result;
  }, [questions, selectedSubject, selectedDifficulty, searchQuery, sortBy]);

  // Drill Mode Logic
  const activeDrillQuestion = filteredQuestions[drillIndex];
  const currentDrillChoice = activeDrillQuestion ? drillAnswers[activeDrillQuestion.questionId] : null;

  const handleDrillSelect = (optKey: string) => {
    if (!activeDrillQuestion || currentDrillChoice) return; // locked after choice
    setDrillAnswers((prev) => ({ ...prev, [activeDrillQuestion.questionId]: optKey }));
    if (optKey === activeDrillQuestion.correctOptionKey) {
      setDrillScore((prev) => prev + 1);
    }
  };

  const startDrillMode = () => {
    setDrillMode(true);
    setDrillIndex(0);
    setDrillAnswers({});
    setDrillScore(0);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[var(--line)] pb-5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-rose-500 font-semibold uppercase tracking-wider">
          <BookX size={15} /> Error Notebook & Retention System
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[var(--ink)]">
              Mistake Notebook
            </h1>
            <p className="text-xs text-[var(--ink-muted)] mt-0.5">
              Review, master, and re-attempt all questions you previously answered incorrectly.
            </p>
          </div>

          {filteredQuestions.length > 0 && !drillMode && (
            <button
              onClick={startDrillMode}
              className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] hover:opacity-90 text-white rounded-xl text-xs font-bold shadow-sm transition-all shrink-0"
            >
              <Play size={14} className="fill-current" />
              <span>Practice Mistakes Drill ({filteredQuestions.length})</span>
            </button>
          )}

          {drillMode && (
            <button
              onClick={() => setDrillMode(false)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[var(--surface-sunken)] border border-[var(--line)] text-[var(--ink)] rounded-xl text-xs font-medium hover:bg-[var(--surface-hover)] transition-colors shrink-0"
            >
              <RotateCcw size={13} />
              <span>Exit Drill Mode</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-[var(--ink-muted)]">
          Scanning completed exam records for mistakes...
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-sm">
          {error}
        </div>
      ) : questions.length === 0 ? (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] py-16 text-center space-y-3">
          <CheckCircle2 size={40} className="mx-auto text-emerald-500 opacity-70" />
          <p className="font-semibold text-[var(--ink)]">Zero Mistakes Logged!</p>
          <p className="text-xs text-[var(--ink-muted)] max-w-sm mx-auto">
            You have not answered any questions incorrectly in completed tests yet, or haven't taken an exam.
          </p>
          <Link
            href="/mock-tests"
            className="inline-block rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white mt-2"
          >
            Take an Exam Simulation
          </Link>
        </div>
      ) : drillMode && activeDrillQuestion ? (
        /* INTERACTIVE DRILL MODE INTERFACE */
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 space-y-6 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded">
                {activeDrillQuestion.subjectName}
              </span>
              <span className="text-[var(--ink-muted)]">• {activeDrillQuestion.topicName}</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-[var(--ink-muted)]">
              <span>
                Score: <strong className="text-emerald-500">{drillScore}</strong> / {drillIndex + (currentDrillChoice ? 1 : 0)}
              </span>
              <span>•</span>
              <span>
                Card {drillIndex + 1} of {filteredQuestions.length}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
              <Flame size={14} />
              <span>Previously Missed {activeDrillQuestion.missCount} Time(s)</span>
            </div>
            <p className="text-base sm:text-lg font-medium text-[var(--ink)] leading-relaxed">
              {activeDrillQuestion.questionText}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-2.5 pt-2">
            {activeDrillQuestion.options.map((opt) => {
              const isSelected = currentDrillChoice === opt.optionKey;
              const isCorrect = opt.optionKey === activeDrillQuestion.correctOptionKey;

              let style =
                'border-[var(--line)] bg-[var(--surface-sunken)] hover:border-[var(--accent)]/50 text-[var(--ink)]';
              if (currentDrillChoice) {
                if (isCorrect) {
                  style =
                    'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold';
                } else if (isSelected && !isCorrect) {
                  style =
                    'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold';
                }
              }

              return (
                <div
                  key={opt.optionKey}
                  onClick={() => handleDrillSelect(opt.optionKey)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${style}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full border border-current/30 flex items-center justify-center text-xs font-mono font-bold">
                      {opt.optionKey}
                    </span>
                    <span className="text-sm">{opt.optionText}</span>
                  </div>
                  {currentDrillChoice && isCorrect && (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-500">
                      <CheckCircle2 size={14} /> Correct
                    </span>
                  )}
                  {currentDrillChoice && isSelected && !isCorrect && (
                    <span className="flex items-center gap-1 text-xs font-bold text-rose-500">
                      <XCircle size={14} /> Incorrect
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Explanation revealed on choice */}
          {currentDrillChoice && (
            <div className="p-4 rounded-xl bg-[var(--surface-sunken)] border border-[var(--line)] space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                  Explanation & Concept
                </span>
              </div>
              <p className="text-xs text-[var(--ink)] opacity-90 leading-relaxed font-sans">
                {activeDrillQuestion.explanation}
              </p>
              {activeDrillQuestion.shortcut && (
                <div className="pt-2 text-xs font-mono text-amber-600 dark:text-amber-400">
                  ⚡ Shortcut: {activeDrillQuestion.shortcut}
                </div>
              )}
            </div>
          )}

          {/* Drill Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--line)]">
            <button
              disabled={drillIndex === 0}
              onClick={() => setDrillIndex((prev) => prev - 1)}
              className="px-4 py-2 border border-[var(--line)] rounded-xl text-xs font-semibold text-[var(--ink)] disabled:opacity-40"
            >
              Previous Card
            </button>

            {drillIndex < filteredQuestions.length - 1 ? (
              <button
                onClick={() => setDrillIndex((prev) => prev + 1)}
                className="flex items-center gap-1.5 px-5 py-2 bg-[var(--accent)] text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
              >
                <span>Next Question</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={() => setDrillMode(false)}
                className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
              >
                Finish Drill
              </button>
            )}
          </div>
        </div>
      ) : (
        /* STANDARD NOTEBOOK VIEW */
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-1">
              <span className="text-[11px] font-medium text-[var(--ink-muted)]">Total Mistakes</span>
              <p className="text-2xl font-bold font-mono text-rose-500">{questions.length}</p>
            </div>
            <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-1">
              <span className="text-[11px] font-medium text-[var(--ink-muted)]">Repeat Errors</span>
              <p className="text-2xl font-bold font-mono text-amber-500">
                {questions.filter((q) => q.missCount > 1).length}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-1">
              <span className="text-[11px] font-medium text-[var(--ink-muted)]">Subjects Affected</span>
              <p className="text-2xl font-bold font-mono text-[var(--accent)]">{subjects.length}</p>
            </div>
            <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-1">
              <span className="text-[11px] font-medium text-[var(--ink-muted)]">Highest Miss Count</span>
              <p className="text-2xl font-bold font-mono text-[var(--ink)]">
                {Math.max(...questions.map((q) => q.missCount), 0)}x
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search mistake questions or topics..."
                  className="w-full pl-9 pr-4 py-2 bg-[var(--surface-sunken)] border border-[var(--line)] rounded-lg text-xs text-[var(--ink)] placeholder-[var(--ink-muted)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              {/* Subject Filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-medium text-[var(--ink-muted)] shrink-0 flex items-center gap-1">
                  <Filter size={12} /> Subject:
                </span>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-2.5 py-1.5 bg-[var(--surface-sunken)] border border-[var(--line)] rounded-lg text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="All">All Subjects ({questions.length})</option>
                  {subjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-medium text-[var(--ink-muted)] shrink-0 flex items-center gap-1">
                  <Layers size={12} /> Difficulty:
                </span>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-2.5 py-1.5 bg-[var(--surface-sunken)] border border-[var(--line)] rounded-lg text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="All">All Difficulties</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-medium text-[var(--ink-muted)] shrink-0">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-[var(--surface-sunken)] border border-[var(--line)] rounded-lg text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="missCount">Most Missed</option>
                  <option value="recent">Recently Missed</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--ink-muted)] pt-1 border-t border-[var(--line)]">
              <span>
                Showing {filteredQuestions.length} of {questions.length} logged mistakes
              </span>
              {(selectedSubject !== 'All' || selectedDifficulty !== 'All' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedSubject('All');
                    setSelectedDifficulty('All');
                    setSearchQuery('');
                  }}
                  className="text-[var(--accent)] hover:underline font-medium"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Mistake Questions List */}
          {filteredQuestions.length === 0 ? (
            <div className="py-12 text-center text-sm text-[var(--ink-muted)]">
              No mistake questions matching the current filter.
            </div>
          ) : (
            <div className="space-y-5">
              {filteredQuestions.map((q, idx) => (
                <div
                  key={q.questionId}
                  className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4 shadow-sm hover:border-[var(--line)]/80 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                      <span className="font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded">
                        {q.subjectName}
                      </span>
                      <span className="text-[var(--ink-muted)] font-sans">• {q.topicName}</span>
                      <span className="text-[var(--ink-muted)] font-sans">• {q.examName}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          q.difficulty === 'HARD'
                            ? 'bg-rose-500/10 text-rose-500'
                            : q.difficulty === 'MEDIUM'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-emerald-500/10 text-emerald-500'
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          q.missCount > 1
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}
                      >
                        <Flame size={12} />
                        <span>Missed {q.missCount}x</span>
                      </span>

                      <button
                        onClick={() => setReportingQuestion(q)}
                        className="p-1.5 rounded-lg text-[var(--ink-muted)] hover:text-amber-500 transition-colors"
                        title="Report Question Error"
                      >
                        <Flag size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <p className="text-sm font-medium text-[var(--ink)] leading-relaxed">
                    <span className="font-bold font-mono text-[var(--accent)] mr-1.5">
                      #{idx + 1}.
                    </span>
                    {q.questionText}
                  </p>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    {q.options.map((opt) => {
                      const isCorrect = opt.optionKey === q.correctOptionKey;
                      const wasChosen = opt.optionKey === q.lastChosenOption;

                      let optStyle = 'border-[var(--line)] bg-[var(--surface-sunken)] text-[var(--ink)]';
                      if (isCorrect) {
                        optStyle =
                          'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold';
                      } else if (wasChosen) {
                        optStyle =
                          'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold';
                      }

                      return (
                        <div
                          key={opt.optionKey}
                          className={`p-3 rounded-xl border flex items-center justify-between ${optStyle}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold">{opt.optionKey}.</span>
                            <span>{opt.optionText}</span>
                          </div>
                          <div className="font-mono text-[10px]">
                            {isCorrect && (
                              <span className="text-emerald-500 font-bold">✓ Correct Answer</span>
                            )}
                            {wasChosen && !isCorrect && (
                              <span className="text-rose-500 font-bold">✗ Your Last Answer</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Box */}
                  <div className="p-3.5 rounded-xl bg-[var(--surface-sunken)] border border-[var(--line)] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase tracking-wider text-[10px] text-[var(--accent)]">
                        Detailed Solution
                      </span>
                    </div>
                    <p className="text-[var(--ink)] opacity-90 leading-relaxed font-sans">
                      {q.explanation}
                    </p>
                    {q.shortcut && (
                      <div className="pt-1.5 text-[11px] font-mono text-amber-600 dark:text-amber-400">
                        ⚡ Shortcut Technique: {q.shortcut}
                      </div>
                    )}
                  </div>

                  {/* Footer Meta */}
                  <div className="flex items-center justify-between pt-1 text-[11px] text-[var(--ink-muted)] font-mono">
                    <div className="flex items-center gap-1">
                      <Clock size={11} />
                      <span>Last seen in: {q.lastTestTitle}</span>
                    </div>
                    <span>
                      {new Date(q.lastAttemptDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Question Error Reporting Modal */}
      {reportingQuestion && (
        <QuestionReportModal
          isOpen={!!reportingQuestion}
          onClose={() => setReportingQuestion(null)}
          questionId={reportingQuestion.questionId}
          questionText={reportingQuestion.questionText}
        />
      )}
    </div>
  );
};

export default WrongQuestionsPage;
