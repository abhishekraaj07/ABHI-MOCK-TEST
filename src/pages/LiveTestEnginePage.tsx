import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from '../contexts/RouterContext';
import { LiveAttemptState, ActiveQuestion } from '../types';
import { Wordmark } from '../components/Wordmark';
import { PaletteLegend } from '../components/PaletteLegend';
import {
  Clock,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Menu,
  X,
  Send,
  RotateCcw,
  CheckCircle2,
  Loader2,
  CloudOff,
  BarChart2,
  ChevronDown,
  ChevronUp,
  Flag,
} from 'lucide-react';
import { QuestionReportModal } from '../components/QuestionReportModal';

interface QuestionAnswerState {
  selectedOption: string | null;
  isMarked: boolean;
  visited: boolean;
  timeSpent: number;
}

export const LiveTestEnginePage: React.FC<{ attemptId: string }> = ({ attemptId }) => {
  const { navigate } = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LiveAttemptState | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reportingQuestion, setReportingQuestion] = useState<ActiveQuestion | null>(null);

  // Local state for all questions responses
  const [userAnswers, setUserAnswers] = useState<Map<string, QuestionAnswerState>>(new Map());

  // Bookmark toggles
  const [bookmarkedSet, setBookmarkedSet] = useState<Set<string>>(new Set());

  // Debounced auto-save & crash prevention state/refs
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingAnswerRef = useRef<{
    questionId: string;
    selectedOption: string | null;
    isMarked: boolean;
    timeSpent: number;
  } | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(new Date());
  const [progressFloatingMinimized, setProgressFloatingMinimized] = useState<boolean>(false);

  // Server countdown timer in seconds
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load attempt state from backend
  useEffect(() => {
    async function loadAttempt() {
      try {
        const token = localStorage.getItem('abhi_token');
        const res = await fetch(`/api/attempts/${attemptId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errData = await res.json();
          setErrorMessage(errData.error || 'Failed to load test attempt.');
          setLoading(false);
          return;
        }

        const json: LiveAttemptState = await res.json();
        setData(json);

        // If already completed, redirect directly to result!
        if (json.attempt.status === 'COMPLETED') {
          navigate(`/result/${attemptId}`);
          return;
        }

        // Initialize user answers state map
        const answersMap = new Map<
          string,
          { selectedOption: string | null; isMarked: boolean; visited: boolean; timeSpent: number }
        >();
        const bSet = new Set<string>();

        json.questions.forEach((q, idx) => {
          answersMap.set(q.questionId, {
            selectedOption: q.selectedOption,
            isMarked: q.isMarked,
            visited: idx === 0 || q.selectedOption !== null || q.isMarked,
            timeSpent: q.timeSpent || 0,
          });
          if (q.isBookmarked) {
            bSet.add(q.questionId);
          }
        });

        // Check for local crash-recovery draft in localStorage
        try {
          const rawDraft = localStorage.getItem(`abhi_attempt_draft_${attemptId}`);
          if (rawDraft) {
            const draftList: Array<{
              questionId: string;
              selectedOption: string | null;
              isMarked: boolean;
              timeSpent: number;
            }> = JSON.parse(rawDraft);

            let hasUnsynced = false;
            draftList.forEach((draft) => {
              const current = answersMap.get(draft.questionId);
              if (
                draft.selectedOption &&
                (!current || current.selectedOption !== draft.selectedOption)
              ) {
                answersMap.set(draft.questionId, {
                  selectedOption: draft.selectedOption,
                  isMarked: draft.isMarked,
                  visited: true,
                  timeSpent: Math.max(draft.timeSpent || 0, current?.timeSpent || 0),
                });
                hasUnsynced = true;
              }
            });

            // Resync recovered responses to server in the background
            if (hasUnsynced) {
              const token = localStorage.getItem('abhi_token');
              draftList.forEach((d) => {
                if (d.selectedOption) {
                  fetch(`/api/attempts/${attemptId}/answer`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(d),
                  }).catch(() => {});
                }
              });
            }
          }
        } catch (e) {
          console.warn('Error reading local draft recovery:', e);
        }

        setUserAnswers(answersMap);
        setBookmarkedSet(bSet);
        setRemainingTime(json.attempt.remainingSeconds);
        setLoading(false);
      } catch (err: any) {
        setErrorMessage(err.message || 'Error connecting to test server.');
        setLoading(false);
      }
    }

    loadAttempt();
  }, [attemptId, navigate]);

  // Countdown timer effect
  useEffect(() => {
    if (loading || !data || data.attempt.isPracticeMode) return;

    timerRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          // Time expired! Auto-submit
          clearInterval(timerRef.current!);
          handleFinalSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, data]);

  // Auto-record time spent on current question
  useEffect(() => {
    if (loading || !data || data.questions.length === 0) return;
    const currentQ = data.questions[currentIndex];
    if (!currentQ) return;

    // Mark current as visited
    setUserAnswers((prev) => {
      const next = new Map<string, QuestionAnswerState>(prev);
      const prevAns = next.get(currentQ.questionId);
      next.set(currentQ.questionId, {
        selectedOption: prevAns ? prevAns.selectedOption : null,
        isMarked: prevAns ? prevAns.isMarked : false,
        visited: true,
        timeSpent: prevAns ? prevAns.timeSpent : 0,
      });
      return next;
    });

    const secondTracker = setInterval(() => {
      setUserAnswers((prev) => {
        const next = new Map<string, QuestionAnswerState>(prev);
        const existing = next.get(currentQ.questionId);
        if (existing) {
          next.set(currentQ.questionId, {
            selectedOption: existing.selectedOption,
            isMarked: existing.isMarked,
            visited: existing.visited,
            timeSpent: existing.timeSpent + 1,
          });
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(secondTracker);
  }, [currentIndex, loading, data]);

  // Immediate snapshot to localStorage to guarantee zero data loss if browser/tab crashes
  const saveDraftToLocalStorage = (map: Map<string, QuestionAnswerState>) => {
    try {
      const list: Array<{
        questionId: string;
        selectedOption: string | null;
        isMarked: boolean;
        timeSpent: number;
      }> = [];
      map.forEach((val, qId) => {
        if (val.selectedOption !== null || val.isMarked || val.visited) {
          list.push({
            questionId: qId,
            selectedOption: val.selectedOption,
            isMarked: val.isMarked,
            timeSpent: val.timeSpent,
          });
        }
      });
      localStorage.setItem(`abhi_attempt_draft_${attemptId}`, JSON.stringify(list));
    } catch {
      // Ignore quota errors
    }
  };

  // Immediate flush of any pending debounced auto-save to server
  const flushPendingSave = async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const pending = pendingAnswerRef.current;
    if (!pending) return;

    // Reset pending ref before network call so concurrent events queue safely
    pendingAnswerRef.current = null;
    setSaveStatus('saving');

    try {
      const token = localStorage.getItem('abhi_token');
      const res = await fetch(`/api/attempts/${attemptId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionId: pending.questionId,
          selectedOption: pending.selectedOption,
          isMarked: pending.isMarked,
          timeSpent: pending.timeSpent,
        }),
        keepalive: true,
      });

      if (res.ok) {
        setSaveStatus('saved');
        setLastSavedAt(new Date());
      } else {
        setSaveStatus('error');
      }
    } catch (err) {
      console.warn('Auto-save network error, response preserved in local storage:', err);
      setSaveStatus('error');
    }
  };

  // Debounced auto-save trigger: debounces by 400ms to avoid flooding on rapid clicks
  const triggerDebouncedSave = (
    questionId: string,
    selectedOption: string | null,
    isMarked: boolean,
    timeSpent: number
  ) => {
    pendingAnswerRef.current = {
      questionId,
      selectedOption,
      isMarked,
      timeSpent,
    };
    setSaveStatus('saving');

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      flushPendingSave();
    }, 400);
  };

  // Window unload / visibility listeners to prevent data loss on tab close or crash
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingAnswerRef.current) {
        const { questionId, selectedOption, isMarked, timeSpent } = pendingAnswerRef.current;
        const token = localStorage.getItem('abhi_token');
        fetch(`/api/attempts/${attemptId}/answer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ questionId, selectedOption, isMarked, timeSpent }),
          keepalive: true,
        }).catch(() => {});
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushPendingSave();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      flushPendingSave();
    };
  }, [attemptId]);

  // Option select handler with debounced auto-save & crash prevention
  const handleOptionChange = (optionKey: string) => {
    if (!data) return;
    const currentQ = data.questions[currentIndex];
    const prev = userAnswers.get(currentQ.questionId);

    const updated: QuestionAnswerState = {
      selectedOption: optionKey,
      isMarked: prev?.isMarked || false,
      visited: true,
      timeSpent: prev?.timeSpent || 0,
    };

    const nextMap = new Map<string, QuestionAnswerState>(userAnswers).set(currentQ.questionId, updated);
    setUserAnswers(nextMap);

    // 1. Instantaneous local persistence
    saveDraftToLocalStorage(nextMap);

    // 2. Debounced auto-save to server
    triggerDebouncedSave(currentQ.questionId, optionKey, updated.isMarked, updated.timeSpent);
  };

  // Clear response handler
  const handleClearResponse = () => {
    if (!data) return;
    const currentQ = data.questions[currentIndex];
    const prev = userAnswers.get(currentQ.questionId);

    const updated: QuestionAnswerState = {
      selectedOption: null,
      isMarked: prev?.isMarked || false,
      visited: true,
      timeSpent: prev?.timeSpent || 0,
    };

    const nextMap = new Map<string, QuestionAnswerState>(userAnswers).set(currentQ.questionId, updated);
    setUserAnswers(nextMap);

    saveDraftToLocalStorage(nextMap);
    triggerDebouncedSave(currentQ.questionId, null, updated.isMarked, updated.timeSpent);
  };

  // Mark for review toggle
  const handleToggleMark = () => {
    if (!data) return;
    const currentQ = data.questions[currentIndex];
    const prev = userAnswers.get(currentQ.questionId);
    const newMarked = !prev?.isMarked;

    const updated: QuestionAnswerState = {
      selectedOption: prev?.selectedOption || null,
      isMarked: newMarked,
      visited: true,
      timeSpent: prev?.timeSpent || 0,
    };

    const nextMap = new Map<string, QuestionAnswerState>(userAnswers).set(currentQ.questionId, updated);
    setUserAnswers(nextMap);

    saveDraftToLocalStorage(nextMap);
    triggerDebouncedSave(currentQ.questionId, updated.selectedOption, newMarked, updated.timeSpent);
  };

  // Navigate to specific question index (ensures pending save is flushed)
  const navigateToQuestion = (newIndex: number) => {
    flushPendingSave();
    setCurrentIndex(newIndex);
    setPaletteOpen(false);
  };

  // Save & Next
  const handleSaveAndNext = () => {
    flushPendingSave();
    if (!data) return;
    if (currentIndex < data.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowSubmitModal(true);
    }
  };

  // Previous
  const handlePrevious = () => {
    flushPendingSave();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Bookmark toggle
  const handleToggleBookmark = async () => {
    if (!data) return;
    const currentQ = data.questions[currentIndex];
    const token = localStorage.getItem('abhi_token');

    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ questionId: currentQ.questionId }),
      });
      if (res.ok) {
        const json = await res.json();
        setBookmarkedSet((prev) => {
          const next = new Set(prev);
          if (json.bookmarked) next.add(currentQ.questionId);
          else next.delete(currentQ.questionId);
          return next;
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit test (Idempotent submission §8 & §9)
  const handleFinalSubmit = async (auto = false) => {
    setSubmitting(true);
    await flushPendingSave();
    try {
      const token = localStorage.getItem('abhi_token');
      const res = await fetch(`/api/attempts/${attemptId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        try {
          localStorage.removeItem(`abhi_attempt_draft_${attemptId}`);
        } catch {
          // Ignore
        }
        navigate(`/result/${attemptId}`);
      } else {
        const json = await res.json();
        alert(json.error || 'Failed to submit test. Please check connection.');
        setSubmitting(false);
      }
    } catch (err) {
      alert('Network error while submitting. Please retry.');
      setSubmitting(false);
    }
  };

  // Format time (mm:ss)
  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--paper)] text-sm text-[var(--ink)]">
        Synchronizing official exam paper and timer...
      </div>
    );
  }

  if (errorMessage || !data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[var(--ink)]">Examination Session Error</h2>
        <p className="text-sm text-[var(--signal-wrong)]">{errorMessage}</p>
        <button
          onClick={() => navigate('/mock-tests')}
          className="rounded bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white"
        >
          Return to Mock Tests
        </button>
      </div>
    );
  }

  const currentQ: ActiveQuestion = data.questions[currentIndex];
  const curAnswer = userAnswers.get(currentQ?.questionId);

  // Compute status for question in palette
  const getQuestionState = (qId: string) => {
    const ans = userAnswers.get(qId);
    if (!ans || !ans.visited) return 'NOT_VISITED';
    if (ans.selectedOption && ans.isMarked) return 'ANSWERED_AND_MARKED';
    if (ans.isMarked) return 'MARKED';
    if (ans.selectedOption) return 'ANSWERED';
    return 'NOT_ANSWERED';
  };

  // Count tallies for summary and legend
  let answeredCount = 0;
  let notAnsweredCount = 0;
  let notVisitedCount = 0;
  let markedCount = 0;
  let answeredAndMarkedCount = 0;

  data.questions.forEach((q) => {
    const st = getQuestionState(q.questionId);
    if (st === 'ANSWERED') answeredCount++;
    else if (st === 'NOT_ANSWERED') notAnsweredCount++;
    else if (st === 'NOT_VISITED') notVisitedCount++;
    else if (st === 'MARKED') markedCount++;
    else if (st === 'ANSWERED_AND_MARKED') answeredAndMarkedCount++;
  });

  // Floating Progress Summary metrics
  const totalQuestions = data.questions.length;
  const totalAnswered = answeredCount + answeredAndMarkedCount;
  const totalUnanswered = notAnsweredCount + notVisitedCount + markedCount;
  const answeredPercent = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;
  const unansweredPercent = 100 - answeredPercent;

  const handleJumpToNextUnanswered = () => {
    if (!data) return;
    const total = data.questions.length;
    for (let offset = 1; offset <= total; offset++) {
      const idx = (currentIndex + offset) % total;
      const q = data.questions[idx];
      const ans = userAnswers.get(q.questionId);
      if (!ans || !ans.selectedOption) {
        navigateToQuestion(idx);
        return;
      }
    }
  };

  // Timer urgency states (§8)
  const isTimerCritical = remainingTime <= 60 && !data.attempt.isPracticeMode;
  const isTimerWarning = remainingTime <= 300 && remainingTime > 60 && !data.attempt.isPracticeMode;

  return (
    <div className="flex h-screen flex-col bg-[var(--paper)] select-none overflow-hidden">
      {/* 1. TOP EXAM HEADER (§8) */}
      <header className="flex h-14 w-full flex-shrink-0 items-center justify-between border-b border-[var(--line)] bg-[var(--surface)] px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Wordmark size="sm" />
          <div className="hidden sm:block border-l border-[var(--line)] pl-4">
            <h1 className="text-xs font-bold text-[var(--ink)] truncate max-w-sm">
              {data.attempt.testTitle}
            </h1>
            <p className="text-[10px] opacity-60 truncate">
              {data.attempt.examName} — {data.attempt.subjectName}
            </p>
          </div>
        </div>

        {/* Center: Question Counter */}
        <div className="text-xs font-semibold text-[var(--ink)]">
          Question <span className="text-[var(--accent)] font-bold">{currentIndex + 1}</span> of{' '}
          {data.questions.length}
        </div>

        {/* Right: Debounced Auto-Save Indicator, Countdown Clock & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Small Top-Right 'Saving...' or 'Saved' Indicator */}
          <div
            id="autosave-indicator"
            role="status"
            aria-live="polite"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold border transition-all duration-200 select-none ${
              saveStatus === 'saving'
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 animate-pulse'
                : saveStatus === 'error'
                ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700 cursor-pointer'
                : 'bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            }`}
            onClick={() => {
              if (saveStatus === 'error') {
                flushPendingSave();
              }
            }}
            title={
              saveStatus === 'saving'
                ? 'Saving answer to server...'
                : saveStatus === 'error'
                ? 'Server sync issue. Your answer is protected locally. Click to retry sync.'
                : lastSavedAt
                ? `Saved to server (${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})`
                : 'All answers saved to server'
            }
          >
            {saveStatus === 'saving' ? (
              <>
                <Loader2 size={12} className="animate-spin text-amber-600 dark:text-amber-400" />
                <span>Saving...</span>
              </>
            ) : saveStatus === 'error' ? (
              <>
                <CloudOff size={12} className="text-red-600 dark:text-red-400" />
                <span>Save Error</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
                <span>Saved</span>
              </>
            )}
          </div>

          {data.attempt.isPracticeMode ? (
            <div className="rounded border border-[var(--line)] bg-[var(--paper)] px-3 py-1 text-xs font-mono font-bold text-[var(--accent)]">
              Practice Mode
            </div>
          ) : (
            <div
              id="test-timer"
              className={`flex items-center gap-1.5 rounded px-3 py-1 font-mono font-bold text-xs transition-all ${
                isTimerCritical
                  ? 'bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400 border border-red-500 animate-pulse text-sm'
                  : isTimerWarning
                  ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border border-amber-400 font-semibold'
                  : 'bg-[var(--paper)] text-[var(--accent)] border border-[var(--line)]'
              }`}
            >
              <Clock size={14} />
              <span>{formatTimer(remainingTime)}</span>
            </div>
          )}

          {/* Palette toggle button on smaller screens */}
          <button
            type="button"
            onClick={() => setPaletteOpen(!paletteOpen)}
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded border border-[var(--line)] text-[var(--ink)]"
          >
            {paletteOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </header>

      {/* 2. BODY AREA: PALETTE (LEFT) + QUESTION (CENTER) */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left: Question Palette (§8) */}
        <aside
          className={`absolute lg:static top-0 bottom-0 left-0 z-30 w-72 sm:w-80 flex-shrink-0 flex-col border-r border-[var(--line)] bg-[var(--surface)] transition-transform duration-200 ease-in-out ${
            paletteOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } flex`}
        >
          {/* Palette Header */}
          <div className="border-b border-[var(--line)] p-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-2">
              Question Palette
            </h2>
            <PaletteLegend
              counts={{
                answered: answeredCount,
                notAnswered: notAnsweredCount,
                notVisited: notVisitedCount,
                marked: markedCount,
                answeredAndMarked: answeredAndMarkedCount,
              }}
            />
          </div>

          {/* Grid of Question Numbers */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-5 gap-2">
              {data.questions.map((q, idx) => {
                const st = getQuestionState(q.questionId);
                const isSelected = idx === currentIndex;

                let btnStyle = 'bg-[var(--surface)] border-[var(--line)] text-[var(--ink)] opacity-70';
                if (st === 'ANSWERED') {
                  btnStyle = 'bg-[var(--signal-correct)] text-white border-transparent';
                } else if (st === 'NOT_ANSWERED') {
                  btnStyle = 'bg-[var(--signal-wrong)] text-white border-transparent';
                } else if (st === 'MARKED') {
                  btnStyle = 'bg-[var(--signal-review)] text-white border-transparent';
                } else if (st === 'ANSWERED_AND_MARKED') {
                  btnStyle =
                    'bg-[var(--signal-review)] text-white border-transparent ring-2 ring-offset-1 ring-[var(--signal-review)]';
                }

                return (
                  <button
                    key={q.questionId}
                    id={`palette-q-${idx + 1}`}
                    type="button"
                    onClick={() => {
                      navigateToQuestion(idx);
                    }}
                    className={`h-9 rounded font-mono text-xs font-bold transition-all relative flex items-center justify-center border ${btnStyle} ${
                      isSelected ? 'ring-2 ring-[var(--ink)] scale-105 z-10' : 'hover:opacity-100'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Palette Footer Submit CTA */}
          <div className="border-t border-[var(--line)] p-4 bg-[var(--paper)]">
            <button
              type="button"
              id="palette-submit-btn"
              onClick={() => {
                flushPendingSave();
                setShowSubmitModal(true);
              }}
              className="w-full rounded bg-[var(--accent)] py-2 text-xs font-bold text-white hover:bg-[var(--accent-hover)] transition-colors flex items-center justify-center gap-1.5"
            >
              <Send size={13} /> Submit Examination
            </button>
          </div>
        </aside>

        {/* Center: Question Area (§8) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col justify-between">
          <div className="mx-auto max-w-3xl w-full space-y-6">
            {/* Question Meta Bar */}
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3 text-xs text-[var(--ink)]">
              <div className="flex items-center gap-2">
                <span className="rounded bg-[var(--surface)] border border-[var(--line)] px-2 py-0.5 font-semibold text-[var(--accent)]">
                  {currentQ.subjectName}
                </span>
                <span className="opacity-75 font-medium">{currentQ.topicName}</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-mono text-xs opacity-75">
                  +{currentQ.marks.toFixed(2)} / -{currentQ.negativeMarks.toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={handleToggleBookmark}
                  title="Bookmark question"
                  className="flex items-center gap-1 opacity-70 hover:opacity-100 text-[var(--accent)]"
                >
                  {bookmarkedSet.has(currentQ.questionId) ? (
                    <BookmarkCheck size={16} className="text-[var(--accent)] fill-current" />
                  ) : (
                    <Bookmark size={16} />
                  )}
                  <span className="text-[11px] hidden sm:inline">Bookmark</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReportingQuestion(currentQ)}
                  title="Report question error or typo"
                  className="flex items-center gap-1 opacity-70 hover:opacity-100 text-amber-600 dark:text-amber-400"
                >
                  <Flag size={15} />
                  <span className="text-[11px] hidden sm:inline">Report</span>
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-3">
              <div className="font-mono text-xs font-bold text-[var(--accent)]">
                QUESTION {currentIndex + 1}
              </div>
              <p className="text-base sm:text-lg font-medium text-[var(--ink)] leading-relaxed font-sans">
                {currentQ.questionText}
              </p>
            </div>

            {/* Options Radio Group (§8 - Standard Fieldset) */}
            <fieldset className="space-y-3 pt-2">
              <legend className="sr-only">Answer options for Question {currentIndex + 1}</legend>
              {currentQ.options.map((opt) => {
                const isChecked = curAnswer?.selectedOption === opt.optionKey;
                return (
                  <label
                    key={opt.optionKey}
                    id={`option-label-${opt.optionKey}`}
                    className={`flex items-center gap-3.5 rounded border p-4 cursor-pointer transition-all ${
                      isChecked
                        ? 'border-[var(--accent)] bg-[var(--surface)] ring-1 ring-[var(--accent)] font-medium text-[var(--ink)] shadow-xs'
                        : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQ.questionId}`}
                      value={opt.optionKey}
                      checked={isChecked}
                      onChange={() => handleOptionChange(opt.optionKey)}
                      className="h-4 w-4 accent-[var(--accent)] cursor-pointer"
                    />
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--paper)] border border-[var(--line)] font-mono text-xs font-bold">
                      {opt.optionKey}
                    </span>
                    <span className="text-sm leading-relaxed">{opt.optionText}</span>
                  </label>
                );
              })}
            </fieldset>
          </div>

          {/* Bottom Space for smooth scrolling */}
          <div className="h-6" />
        </main>
      </div>

      {/* 3. BOTTOM ACTION BAR (§8) */}
      <footer className="h-16 w-full flex-shrink-0 border-t border-[var(--line)] bg-[var(--surface)] px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="prev-question-btn"
            disabled={currentIndex === 0}
            onClick={handlePrevious}
            className={`rounded border border-[var(--line)] px-3.5 py-2 text-xs font-semibold flex items-center gap-1 ${
              currentIndex === 0
                ? 'opacity-40 cursor-not-allowed text-[var(--ink)]'
                : 'text-[var(--ink)] hover:bg-[var(--paper)] cursor-pointer'
            }`}
          >
            <ChevronLeft size={14} /> Previous
          </button>

          <button
            type="button"
            id="clear-response-btn"
            disabled={!curAnswer?.selectedOption}
            onClick={handleClearResponse}
            className={`rounded border border-[var(--line)] px-3.5 py-2 text-xs font-semibold flex items-center gap-1 ${
              !curAnswer?.selectedOption
                ? 'opacity-40 cursor-not-allowed text-[var(--ink)]'
                : 'text-[var(--signal-wrong)] hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer'
            }`}
          >
            <RotateCcw size={13} /> Clear Response
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            id="mark-review-btn"
            onClick={handleToggleMark}
            className={`rounded border px-3.5 py-2 text-xs font-semibold transition-colors ${
              curAnswer?.isMarked
                ? 'border-[var(--signal-review)] bg-[var(--signal-review)] text-white'
                : 'border-[var(--line)] text-[var(--ink)] hover:bg-[var(--paper)]'
            }`}
          >
            {curAnswer?.isMarked ? 'Unmark Review' : 'Mark for Review'}
          </button>

          <button
            type="button"
            id="save-next-btn"
            onClick={handleSaveAndNext}
            className="rounded bg-[var(--accent)] px-5 py-2 text-xs font-bold text-white hover:bg-[var(--accent-hover)] transition-colors flex items-center gap-1"
          >
            {currentIndex === data.questions.length - 1 ? 'Save & Review' : 'Save & Next'}
            <ChevronRight size={14} />
          </button>
        </div>
      </footer>

      {/* 4. FLOATING PROGRESS INDICATOR (Answered vs Unanswered Percentage) */}
      {progressFloatingMinimized ? (
        <div
          id="floating-progress-indicator-minimized"
          className="fixed bottom-20 right-4 sm:right-6 z-20"
        >
          <button
            type="button"
            id="expand-progress-btn"
            onClick={() => setProgressFloatingMinimized(false)}
            className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)]/95 px-3.5 py-1.5 shadow-lg backdrop-blur-md hover:bg-[var(--paper)] transition-all duration-200 group text-xs font-semibold text-[var(--ink)] cursor-pointer"
            title="Click to expand Answered vs Unanswered progress summary"
          >
            <BarChart2 size={13} className="text-[var(--accent)]" />
            <span className="text-[var(--signal-correct)] font-bold">{answeredPercent}% Answered</span>
            <span className="text-[var(--ink)] opacity-40">•</span>
            <span className="text-[var(--signal-wrong)] font-medium">{unansweredPercent}% Unanswered</span>
            <ChevronUp size={13} className="opacity-50 group-hover:opacity-100 transition-opacity ml-0.5" />
          </button>
        </div>
      ) : (
        <div
          id="floating-progress-indicator"
          className="fixed bottom-20 right-4 sm:right-6 z-20 w-72 sm:w-80 rounded-xl border border-[var(--line)] bg-[var(--surface)]/95 p-3.5 shadow-xl backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
        >
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[var(--line)]">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--ink)]">
              <BarChart2 size={14} className="text-[var(--accent)]" />
              <span>Exam Progress</span>
              <span className="rounded bg-[var(--paper)] border border-[var(--line)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--ink)] opacity-70">
                Q{currentIndex + 1}/{totalQuestions}
              </span>
            </div>
            <button
              type="button"
              id="minimize-progress-btn"
              onClick={() => setProgressFloatingMinimized(true)}
              className="p-1 rounded text-[var(--ink)] opacity-60 hover:opacity-100 hover:bg-[var(--paper)] transition-colors cursor-pointer"
              title="Minimize progress card"
            >
              <ChevronDown size={14} />
            </button>
          </div>

          <div className="space-y-2.5">
            {/* Percentage Summary Metrics */}
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-[var(--signal-correct)]">
                <span className="inline-block h-2 w-2 rounded-full bg-[var(--signal-correct)]" />
                <span>Answered: {answeredPercent}%</span>
                <span className="font-mono text-[11px] font-normal opacity-70">({totalAnswered})</span>
              </div>
              <div className="flex items-center gap-1.5 text-[var(--signal-wrong)]">
                <span className="inline-block h-2 w-2 rounded-full bg-[var(--signal-wrong)]" />
                <span>Unanswered: {unansweredPercent}%</span>
                <span className="font-mono text-[11px] font-normal opacity-70">({totalUnanswered})</span>
              </div>
            </div>

            {/* Dual Segment Progress Bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--paper)] border border-[var(--line)] flex">
              <div
                className="h-full bg-[var(--signal-correct)] transition-all duration-300"
                style={{ width: `${answeredPercent}%` }}
                title={`Answered: ${answeredPercent}% (${totalAnswered}/${totalQuestions})`}
              />
              <div
                className="h-full bg-[var(--signal-wrong)] opacity-60 transition-all duration-300"
                style={{ width: `${unansweredPercent}%` }}
                title={`Unanswered: ${unansweredPercent}% (${totalUnanswered}/${totalQuestions})`}
              />
            </div>

            {/* Helper Footer: Marked for Review count & Jump to Next Unanswered */}
            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <div className="text-[var(--ink)] opacity-70 text-[10px] sm:text-[11px]">
                {markedCount + answeredAndMarkedCount > 0 ? (
                  <span>
                    <span className="font-semibold text-[var(--signal-review)]">
                      {markedCount + answeredAndMarkedCount}
                    </span>{' '}
                    marked for review
                  </span>
                ) : (
                  <span>
                    {totalQuestions - totalAnswered === 0
                      ? 'All questions answered!'
                      : `${totalUnanswered} remaining`}
                  </span>
                )}
              </div>

              {totalUnanswered > 0 && (
                <button
                  type="button"
                  id="jump-next-unanswered-btn"
                  onClick={handleJumpToNextUnanswered}
                  className="font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] hover:underline flex items-center gap-0.5 cursor-pointer text-[11px] transition-colors"
                >
                  <span>Next Unanswered</span>
                  <ChevronRight size={12} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. SUBMISSION CONFIRMATION MODAL (§8) */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded border border-[var(--line)] bg-[var(--surface)] p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="space-y-1">
              <h3 className="font-serif text-xl font-bold text-[var(--ink)]">
                Confirm Examination Submission
              </h3>
              <p className="text-xs text-[var(--ink)] opacity-75">
                Review your response tally before submitting. Once submitted, your answers cannot be altered.
              </p>
            </div>

            {/* Tally Summary Table */}
            <div className="rounded border border-[var(--line)] bg-[var(--paper)] divide-y divide-[var(--line)] text-xs font-mono">
              <div className="flex justify-between p-2.5">
                <span className="opacity-80">Total Questions:</span>
                <span className="font-bold">{data.questions.length}</span>
              </div>
              <div className="flex justify-between p-2.5 text-[var(--signal-correct)]">
                <span>Total Answered:</span>
                <span className="font-bold">
                  {totalAnswered}
                  {answeredAndMarkedCount > 0 && (
                    <span className="text-[10px] font-normal opacity-80 ml-1">
                      ({answeredCount} saved, {answeredAndMarkedCount} marked for review)
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between p-2.5 text-[var(--signal-wrong)]">
                <span>Total Unanswered:</span>
                <span className="font-bold">
                  {totalUnanswered}
                  {markedCount > 0 && (
                    <span className="text-[10px] font-normal opacity-80 ml-1">
                      ({notAnsweredCount + notVisitedCount} skipped, {markedCount} marked)
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between p-2.5 text-[var(--signal-review)]">
                <span>Marked for Review:</span>
                <span className="font-bold">{markedCount + answeredAndMarkedCount}</span>
              </div>
            </div>

            {totalUnanswered > 0 && (
              <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-3 rounded border border-amber-300 dark:border-amber-800">
                <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" />
                <span>
                  You still have {totalUnanswered} unanswered question(s). Unanswered questions receive 0 marks.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowSubmitModal(false)}
                className="rounded border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--paper)]"
              >
                Return to Test
              </button>

              <button
                type="button"
                id="modal-confirm-submit"
                disabled={submitting}
                onClick={() => handleFinalSubmit(false)}
                className="rounded bg-[var(--accent)] px-5 py-2 text-xs font-bold text-white hover:bg-[var(--accent-hover)] transition-colors flex items-center gap-1.5"
              >
                {submitting ? 'Evaluating Score...' : 'Submit & View Result'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Error Reporting Modal */}
      {reportingQuestion && (
        <QuestionReportModal
          isOpen={!!reportingQuestion}
          onClose={() => setReportingQuestion(null)}
          questionId={reportingQuestion.questionId}
          testId={data?.attempt?.testId}
          questionText={reportingQuestion.questionText}
        />
      )}
    </div>
  );
};
