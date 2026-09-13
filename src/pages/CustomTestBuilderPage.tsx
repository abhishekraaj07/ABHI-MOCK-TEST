import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../contexts/RouterContext';
import {
  Sliders,
  Play,
  Clock,
  HelpCircle,
  Award,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface ExamOption {
  id: string;
  name: string;
  category: string;
  subjects: { id: string; name: string }[];
  _count: { questions: number };
}

export const CustomTestBuilderPage: React.FC = () => {
  const { navigate } = useRouter();
  const { user, guestLogin } = useAuth();

  const [exams, setExams] = useState<ExamOption[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('All');
  const [difficulty, setDifficulty] = useState<string>('All');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [duration, setDuration] = useState<number>(15);
  const [customTitle, setCustomTitle] = useState<string>('');

  useEffect(() => {
    async function loadExams() {
      try {
        const res = await apiFetch('/api/exams');
        if (res.ok) {
          const json = await res.json();
          setExams(json.exams || []);
          if (json.exams?.length > 0) {
            setSelectedExamId(json.exams[0].id);
          }
        }
      } catch (e) {
        console.error('Failed to load exams list:', e);
      } finally {
        setLoadingExams(false);
      }
    }
    loadExams();
  }, []);

  const currentExam = exams.find((e) => e.id === selectedExamId);
  const availableSubjects = currentExam?.subjects || [];

  const handleGenerateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      await guestLogin();
    }

    if (!selectedExamId) {
      setError('Please select a target examination.');
      return;
    }

    setCreating(true);

    try {
      const token = localStorage.getItem('abhi_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await apiFetch('/api/tests/custom', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          examId: selectedExamId,
          subjectId: selectedSubjectId !== 'All' ? selectedSubjectId : undefined,
          difficulty: difficulty !== 'All' ? difficulty : undefined,
          questionCount,
          duration,
          title: customTitle.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate custom test.');
      }

      // Navigate to instructions of newly created test
      navigate(`/tests/${data.testId}/instructions`);
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating custom test.');
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[var(--line)] pb-5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider">
          <Sliders size={14} /> Adaptive Exam Generator
        </div>
        <h1 className="font-serif text-3xl font-bold text-[var(--ink)]">
          Custom Test Builder
        </h1>
        <p className="text-xs text-[var(--ink-muted)]">
          Generate targeted mock tests tailored to your weak areas, preferred difficulty, and custom time limits.
        </p>
      </div>

      {loadingExams ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--accent)]" />
          <p className="text-sm text-[var(--ink-muted)]">Loading exam syllabus and question catalog...</p>
        </div>
      ) : (
        <form onSubmit={handleGenerateTest} className="space-y-8">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Choose Target Exam */}
          <div className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
              Step 1: Select Target Examination
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {exams.map((exam) => {
                const isSelected = exam.id === selectedExamId;
                return (
                  <button
                    key={exam.id}
                    type="button"
                    onClick={() => {
                      setSelectedExamId(exam.id);
                      setSelectedSubjectId('All');
                    }}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 ring-1 ring-[var(--accent)] shadow-xs'
                        : 'border-[var(--line)] bg-[var(--surface-sunken)] hover:border-[var(--line)]/80'
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold text-[var(--accent)] uppercase block mb-1">
                      {exam.category}
                    </span>
                    <h4 className="text-sm font-bold text-[var(--ink)]">{exam.name}</h4>
                    <span className="text-[11px] text-[var(--ink-muted)] mt-1 block">
                      {exam._count?.questions || 0} questions available
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Subject & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Subject Selector */}
            <div className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Step 2: Section / Subject Focus
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[var(--surface-sunken)] border border-[var(--line)] rounded-xl text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
              >
                <option value="All">All Subjects (Mixed Full-Syllabus)</option>
                {availableSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[var(--ink-muted)]">
                Leave as All Subjects to create a balanced multi-section sprint.
              </p>
            </div>

            {/* Difficulty Selector */}
            <div className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Step 3: Question Difficulty
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['All', 'EASY', 'MEDIUM', 'HARD'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      difficulty === d
                        ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                        : 'border-[var(--line)] bg-[var(--surface-sunken)] text-[var(--ink)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    {d === 'All' ? 'Mixed' : d.charAt(0) + d.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[var(--ink-muted)]">
                Target challenging questions to prepare for tough paper shifts.
              </p>
            </div>
          </div>

          {/* Section 3: Parameters (Questions & Duration) */}
          <div className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] space-y-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
              Step 4: Test Length & Duration
            </label>

            {/* Questions count presets */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[var(--ink)]">Number of Questions:</span>
                <span className="font-mono font-bold text-[var(--accent)]">{questionCount} Questions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[5, 10, 15, 20, 25, 30].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCount(num)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      questionCount === num
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] font-mono'
                        : 'border-[var(--line)] bg-[var(--surface-sunken)] text-[var(--ink)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    {num} Qs
                  </button>
                ))}
              </div>
            </div>

            {/* Duration presets */}
            <div className="space-y-2 pt-2 border-t border-[var(--line)]">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[var(--ink)]">Time Limit:</span>
                <span className="font-mono font-bold text-[var(--accent)]">{duration} Minutes</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[5, 10, 15, 20, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDuration(mins)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      duration === mins
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] font-mono'
                        : 'border-[var(--line)] bg-[var(--surface-sunken)] text-[var(--ink)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    {mins} mins
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Title (Optional) */}
            <div className="space-y-2 pt-2 border-t border-[var(--line)]">
              <label className="block text-xs font-semibold text-[var(--ink)]">
                Custom Test Name <span className="text-[var(--ink-muted)] font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={`e.g. My ${currentExam?.name || 'Exam'} Speed Sprint`}
                className="w-full px-3.5 py-2.5 bg-[var(--surface-sunken)] border border-[var(--line)] rounded-xl text-xs text-[var(--ink)] placeholder-[var(--ink-muted)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          {/* Section 4: Summary Card & Action */}
          <div className="p-6 rounded-2xl border border-[var(--accent)]/30 bg-gradient-to-r from-[var(--surface)] via-[var(--accent)]/5 to-[var(--surface)] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-bold">
                <Sparkles size={14} /> Ready to Generate
              </div>
              <p className="text-sm font-bold text-[var(--ink)]">
                {questionCount} Questions • {duration} Minutes • Negative Marking: 0.25
              </p>
              <p className="text-xs text-[var(--ink-muted)]">
                Questions will be drawn randomly from the verified question bank for {currentExam?.name}.
              </p>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full sm:w-auto px-8 py-3.5 bg-[var(--accent)] hover:opacity-90 active:scale-98 text-white rounded-xl text-xs font-bold shadow-lg shadow-[var(--accent)]/20 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Building Test...</span>
                </>
              ) : (
                <>
                  <Play size={14} className="fill-current" />
                  <span>Generate & Start Exam</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CustomTestBuilderPage;
