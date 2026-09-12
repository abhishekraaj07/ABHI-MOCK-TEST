import React, { useState, useEffect, useRef } from 'react';
import { useRouter, Link } from '../contexts/RouterContext';
import {
  Flame,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  Sparkles,
  Zap,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Users,
  Flag,
  X,
  Loader2,
  Share2,
} from 'lucide-react';
import { apiFetch } from '../lib/api';
import { GeminiChatbot } from '../components/GeminiChatbot';
import { QuestionReportModal } from '../components/QuestionReportModal';

interface DailyChallengeData {
  challenge: {
    id: string;
    date: string;
    title: string;
    description: string;
    durationMinutes: number;
    totalQuestions: number;
    totalParticipants: number;
  };
  questions: {
    id: string;
    order: number;
    questionText: string;
    difficulty: string;
    subjectName: string;
    topicName: string;
    options: {
      id?: string;
      optionKey: string;
      optionText: string;
      isCorrect?: boolean;
    }[];
    correctOptionKey?: string;
    explanation?: string;
    shortcut?: string | null;
  }[];
  userAttempt?: {
    id: string;
    score: number;
    accuracy: number;
    timeTaken: number;
    streak: number;
    completedAt: string;
  } | null;
}

export const DailyChallengePage: React.FC = () => {
  const { navigate } = useRouter();
  const [data, setData] = useState<DailyChallengeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Engine state: 'LOBBY' | 'RUNNING' | 'COMPLETED'
  const [engineState, setEngineState] = useState<'LOBBY' | 'RUNNING' | 'COMPLETED'>('LOBBY');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(300); // 5 mins
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<any>(null);

  // Modals
  const [aiTutorQuestion, setAiTutorQuestion] = useState<any | null>(null);
  const [reportingQuestion, setReportingQuestion] = useState<any | null>(null);

  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(Date.now());

  const fetchChallenge = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('abhi_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await apiFetch('/api/daily-challenge', { headers });
      if (!res.ok) {
        throw new Error('Could not load today’s daily challenge.');
      }

      const json: DailyChallengeData = await res.json();
      setData(json);

      if (json.userAttempt) {
        setEngineState('COMPLETED');
        setSubmitResult({
          score: json.userAttempt.score,
          totalPossible: json.questions.length,
          accuracy: json.userAttempt.accuracy,
          timeTaken: json.userAttempt.timeTaken,
          streak: json.userAttempt.streak,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load challenge.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenge();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (engineState === 'RUNNING') {
      timerRef.current = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [engineState]);

  const startChallenge = () => {
    const token = localStorage.getItem('abhi_token');
    if (!token) {
      navigate('/login?redirect=/daily-challenge');
      return;
    }
    setTimeLeftSeconds((data?.challenge.durationMinutes || 5) * 60);
    startTimeRef.current = Date.now();
    setEngineState('RUNNING');
    setCurrentIndex(0);
  };

  const handleSelectOption = (questionId: string, optionKey: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleSubmit = async () => {
    if (!data || submitting) return;
    const token = localStorage.getItem('abhi_token');
    if (!token) {
      navigate('/login?redirect=/daily-challenge');
      return;
    }

    setSubmitting(true);
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    const formattedAnswers = data.questions.map((q) => ({
      questionId: q.id,
      selectedOption: selectedAnswers[q.id] || null,
    }));

    try {
      const res = await apiFetch('/api/daily-challenge/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          challengeId: data.challenge.id,
          answers: formattedAnswers,
          timeTaken: elapsedSeconds,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to submit challenge.');
      }

      setSubmitResult(resData.result);
      setEngineState('COMPLETED');
      // Reload full challenge to reveal solutions
      await fetchChallenge();
    } catch (err: any) {
      alert(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    handleSubmit();
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--accent)]" />
        <p className="text-sm text-[var(--ink-muted)]">Loading today’s sprint challenge...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-md py-20 text-center space-y-4">
        <p className="text-sm text-rose-500 font-medium">{error || 'Challenge not found'}</p>
        <Link
          href="/mock-tests"
          className="inline-block px-4 py-2 bg-[var(--accent)] text-white text-xs font-semibold rounded-xl"
        >
          Explore Other Tests
        </Link>
      </div>
    );
  }

  const currentQ = data.questions[currentIndex];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. LOBBY VIEW */}
      {engineState === 'LOBBY' && (
        <div className="space-y-8 animate-fade-in">
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-gradient-to-br from-[var(--surface)] via-[var(--surface-sunken)] to-[var(--surface)] p-8 sm:p-12 text-center space-y-6 shadow-md">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold font-mono uppercase tracking-wider">
              <Flame size={15} className="fill-current animate-pulse" />
              <span>Daily High-Yield Sprint</span>
            </div>

            <div className="space-y-2 max-w-2xl mx-auto">
              <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[var(--ink)]">
                {data.challenge.title}
              </h1>
              <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
                {data.challenge.description}
              </p>
            </div>

            {/* Quick Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs font-mono text-[var(--ink-muted)]">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[var(--accent)]" />
                <span>
                  <strong>{data.challenge.durationMinutes} Minutes</strong> Timer
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-amber-500" />
                <span>
                  <strong>{data.challenge.totalQuestions} Questions</strong> Rapid Fire
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-emerald-500" />
                <span>
                  <strong>{data.challenge.totalParticipants} Candidates</strong> Competed Today
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <button
                onClick={startChallenge}
                className="px-8 py-3.5 bg-[var(--accent)] hover:opacity-90 active:scale-98 text-white rounded-2xl font-bold text-sm shadow-lg shadow-[var(--accent)]/20 transition-all inline-flex items-center gap-2"
              >
                <Zap size={16} className="fill-current" />
                <span>Start Daily Sprint Quiz</span>
              </button>
            </div>
          </div>

          {/* Rules & Guidelines */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-bold font-mono text-sm">
                1
              </div>
              <h4 className="text-sm font-bold text-[var(--ink)]">Mixed Exam Syllabus</h4>
              <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                Covers reasoning, quantitative aptitude, and general awareness curated across popular tests.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold font-mono text-sm">
                2
              </div>
              <h4 className="text-sm font-bold text-[var(--ink)]">Maintain Daily Streak</h4>
              <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                Complete the sprint every 24 hours to grow your learning streak and climb national ranks.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold font-mono text-sm">
                3
              </div>
              <h4 className="text-sm font-bold text-[var(--ink)]">Detailed Explanations</h4>
              <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                Instant solution reveal and Gemini AI tutoring available immediately upon submission.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. RUNNING TEST ENGINE */}
      {engineState === 'RUNNING' && currentQ && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Bar with Countdown */}
          <div className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-2.5 py-1 rounded-lg">
                Question {currentIndex + 1} / {data.questions.length}
              </span>
              <span className="text-xs text-[var(--ink-muted)] hidden sm:inline">
                {currentQ.subjectName} • {currentQ.topicName}
              </span>
            </div>

            {/* Countdown Badge */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold ${
                timeLeftSeconds < 60
                  ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30 animate-pulse'
                  : 'bg-[var(--surface-sunken)] border border-[var(--line)] text-[var(--ink)]'
              }`}
            >
              <Clock size={14} />
              <span>{formatTimer(timeLeftSeconds)}</span>
            </div>
          </div>

          {/* Question Card */}
          <div className="p-6 sm:p-8 rounded-3xl border border-[var(--line)] bg-[var(--surface)] space-y-6 shadow-sm">
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--accent)] font-semibold">
                {currentQ.difficulty} Difficulty
              </span>
              <p className="text-base sm:text-lg font-medium text-[var(--ink)] leading-relaxed font-sans">
                {currentQ.questionText}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((opt) => {
                const isSelected = selectedAnswers[currentQ.id] === opt.optionKey;
                return (
                  <label
                    key={opt.optionKey}
                    onClick={() => handleSelectOption(currentQ.id, opt.optionKey)}
                    className={`flex items-center gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--ink)] font-semibold shadow-xs ring-1 ring-[var(--accent)]'
                        : 'border-[var(--line)] bg-[var(--surface-sunken)] text-[var(--ink)] hover:border-[var(--line)]/80'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`daily-q-${currentQ.id}`}
                      checked={isSelected}
                      onChange={() => handleSelectOption(currentQ.id, opt.optionKey)}
                      className="text-[var(--accent)] focus:ring-[var(--accent)] shrink-0"
                    />
                    <span className="w-6 h-6 rounded-full border border-current/30 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                      {opt.optionKey}
                    </span>
                    <span className="text-sm leading-relaxed">{opt.optionText}</span>
                  </label>
                );
              })}
            </div>

            {/* Footer Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--line)]">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
                className="flex items-center gap-1 px-4 py-2 border border-[var(--line)] rounded-xl text-xs font-semibold text-[var(--ink)] disabled:opacity-40"
              >
                <ArrowLeft size={13} />
                <span>Previous</span>
              </button>

              {currentIndex < data.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  className="flex items-center gap-1 px-5 py-2 bg-[var(--accent)] text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  <span>Next Question</span>
                  <ArrowRight size={13} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Sprint Quiz</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. COMPLETED VIEW (SCORECARD + SOLUTION DISSECTOR) */}
      {engineState === 'COMPLETED' && submitResult && (
        <div className="space-y-8 animate-fade-in">
          {/* Scorecard Hero */}
          <div className="p-8 rounded-3xl border border-[var(--line)] bg-gradient-to-br from-[var(--surface)] via-[var(--surface-sunken)] to-[var(--surface)] text-center space-y-6 shadow-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              <CheckCircle2 size={14} />
              <span>Sprint Completed!</span>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider font-mono text-[var(--ink-muted)]">
                Today's Daily Score
              </p>
              <h2 className="text-4xl sm:text-5xl font-extrabold font-mono text-[var(--ink)] mt-1">
                {submitResult.score}{' '}
                <span className="text-2xl text-[var(--ink-muted)] font-normal">
                  / {submitResult.totalPossible || 5}
                </span>
              </h2>
            </div>

            {/* Metrics Pills */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
              <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)]">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--ink-muted)] block">
                  Accuracy
                </span>
                <span className="text-lg font-bold font-mono text-[var(--accent)]">
                  {submitResult.accuracy}%
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)]">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--ink-muted)] block">
                  Time
                </span>
                <span className="text-lg font-bold font-mono text-[var(--ink)]">
                  {submitResult.timeTaken}s
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)]">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--ink-muted)] block">
                  Streak
                </span>
                <span className="text-lg font-bold font-mono text-amber-500 flex items-center justify-center gap-1">
                  <Flame size={16} className="fill-current" />
                  {submitResult.streak}d
                </span>
              </div>
            </div>
          </div>

          {/* Solutions Accordion / List */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-bold text-[var(--ink)]">
              Today's Sprint Solutions & Explanations
            </h3>

            <div className="space-y-5">
              {data.questions.map((q, idx) => {
                const correctOpt = q.options.find((o) => o.isCorrect) || {
                  optionKey: q.correctOptionKey,
                };

                return (
                  <div
                    key={q.id}
                    className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] space-y-4 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded">
                          {q.subjectName}
                        </span>
                        <span className="text-[var(--ink-muted)] font-sans">• {q.topicName}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setReportingQuestion(q)}
                          className="text-xs text-amber-500 hover:text-amber-600 flex items-center gap-1 p-1"
                          title="Report question error"
                        >
                          <Flag size={13} />
                          <span>Report</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-sm font-medium text-[var(--ink)] leading-relaxed">
                      <span className="font-mono font-bold text-[var(--accent)] mr-1.5">
                        #{idx + 1}.
                      </span>
                      {q.questionText}
                    </p>

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      {q.options.map((opt) => (
                        <div
                          key={opt.optionKey}
                          className={`p-3 rounded-xl border flex items-center justify-between ${
                            opt.isCorrect || opt.optionKey === q.correctOptionKey
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                              : 'border-[var(--line)] bg-[var(--surface-sunken)] text-[var(--ink)]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold">{opt.optionKey}.</span>
                            <span>{opt.optionText}</span>
                          </div>
                          {(opt.isCorrect || opt.optionKey === q.correctOptionKey) && (
                            <span className="text-emerald-500 font-bold font-mono text-[10px]">
                              ✓ Correct
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="p-3.5 rounded-xl bg-[var(--surface-sunken)] border border-[var(--line)] space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold uppercase tracking-wider text-[10px] text-[var(--accent)]">
                            Solution & Formula
                          </span>
                          <button
                            onClick={() => setAiTutorQuestion(q)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-colors text-[11px] font-semibold"
                          >
                            <Sparkles size={12} />
                            <span>Ask Gemini AI Tutor</span>
                          </button>
                        </div>
                        <p className="text-[var(--ink)] opacity-90 leading-relaxed font-sans">
                          {q.explanation}
                        </p>
                        {q.shortcut && (
                          <div className="pt-1.5 text-[11px] font-mono text-amber-600 dark:text-amber-400">
                            ⚡ Shortcut: {q.shortcut}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Gemini AI Dissector Modal */}
      {aiTutorQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-3xl rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--paper)] px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-[var(--ink)]">
                    Gemini AI Daily Challenge Tutor
                  </h3>
                  <p className="text-[10px] text-[var(--ink-muted)]">
                    {aiTutorQuestion.subjectName} • {aiTutorQuestion.topicName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAiTutorQuestion(null)}
                className="rounded p-1 text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--line)]/50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden p-2">
              <GeminiChatbot
                initialPersona="question-explainer"
                initialQuestionContext={`Question: "${aiTutorQuestion.questionText}". Options: ${aiTutorQuestion.options
                  ?.map((o: any) => `${o.optionKey}: ${o.optionText}`)
                  .join(' | ')}. Explanation: ${aiTutorQuestion.explanation || 'None provided'}`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Question Error Reporting Modal */}
      {reportingQuestion && (
        <QuestionReportModal
          isOpen={!!reportingQuestion}
          onClose={() => setReportingQuestion(null)}
          questionId={reportingQuestion.id}
          questionText={reportingQuestion.questionText}
        />
      )}
    </div>
  );
};
