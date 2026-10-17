import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';
import { TestInstruction } from '../types';
import { PaletteLegend } from '../components/PaletteLegend';
import { Clock, HelpCircle, Award, AlertCircle, ArrowLeft, CheckSquare, Square } from 'lucide-react';

export const TestInstructionsPage: React.FC<{ testId: string }> = ({ testId }) => {
  const { navigate } = useRouter();
  const { user, guestLogin } = useAuth();
  const [data, setData] = useState<TestInstruction | null>(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [starting, setStarting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadInstructions() {
      try {
        const res = await fetch(`/api/tests/${testId}`, { credentials: 'include' });
        if (res.ok) {
          const json = await res.json();
          setData(json.test);
        } else {
          // If not found in DB, try fallback data
          const fallbackData = await import('../lib/fallbackData');
          const fallbackTest = fallbackData.FALLBACK_TESTS_WITH_QUESTIONS.find((t) => t.id === testId) ||
            fallbackData.FALLBACK_TESTS_WITH_QUESTIONS[0];
          if (fallbackTest) {
            setData({
              id: fallbackTest.id,
              title: fallbackTest.title,
              description: fallbackTest.description,
              examId: fallbackTest.examId,
              examName: fallbackTest.examName || 'Competitive Exam',
              subjectId: fallbackTest.subjectId,
              subjectName: fallbackTest.subjectName || 'Full Syllabus',
              testType: fallbackTest.testType,
              duration: fallbackTest.duration,
              totalMarks: fallbackTest.totalMarks,
              negativeMarks: fallbackTest.negativeMarks,
              difficulty: fallbackTest.difficulty,
              isPremium: false,
              questionCount: fallbackTest.questionCount || 20,
              language: 'English',
              activeAttemptId: null,
              instructions: [
                `The examination comprises ${fallbackTest.questionCount || 20} questions worth ${fallbackTest.totalMarks} marks.`,
                `Total duration is strictly ${fallbackTest.duration} minutes.`,
                `Each correct response is awarded ${(fallbackTest.totalMarks / (fallbackTest.questionCount || 20)).toFixed(2)} marks.`,
                `Negative marking of ${fallbackTest.negativeMarks} marks will be deducted for incorrect answers.`,
                `Navigate between questions using the Question Palette or Next / Previous buttons.`,
              ],
            });
          } else {
            setErrorMessage('Test not found or unavailable.');
          }
        }
      } catch (err) {
        setErrorMessage('Failed to load examination instructions.');
      } finally {
        setLoading(false);
      }
    }
    loadInstructions();
  }, [testId]);

  const handleStart = async () => {
    if (!agreed) return;

    setStarting(true);
    setErrorMessage(null);

    try {
      // If user is not authenticated yet, automatically create a genuine guest session
      if (!user) {
        await guestLogin();
      }

      const token = localStorage.getItem('abhi_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/tests/${testId}/start`, {
        method: 'POST',
        headers,
        credentials: 'include',
      });

      let attemptId: string | null = null;
      if (res.ok) {
        const json = await res.json();
        attemptId = json.attemptId;
      }

      // If backend was unreachable or returned error on static hosts, generate client session
      if (!attemptId) {
        const fallback = (await import('../lib/fallbackData')).startFallbackTestAttempt(testId);
        attemptId = fallback.attemptId;
      }

      if (attemptId) {
        navigate(`/test/${attemptId}`);
      } else {
        setErrorMessage('Failed to initialize test session. Please try again.');
      }
    } catch (err: unknown) {
      // Offline / network fallback
      try {
        const fallback = (await import('../lib/fallbackData')).startFallbackTestAttempt(testId);
        if (fallback.attemptId) {
          navigate(`/test/${fallback.attemptId}`);
          return;
        }
      } catch {}
      setErrorMessage(err instanceof Error ? err.message : 'Network error.');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center text-sm text-[var(--ink)] opacity-60">
        Loading test rules and marking parameters...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[var(--ink)]">Test Unavailable</h2>
        <p className="text-sm opacity-70">{errorMessage || 'Unable to locate test instructions.'}</p>
        <Link href="/mock-tests" className="inline-block rounded bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white">
          Return to Test Library
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/mock-tests"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline"
        >
          <ArrowLeft size={14} /> Back to mock test library
        </Link>
      </div>

      {/* Main Instruction Card */}
      <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="border-b border-[var(--line)] pb-5 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-[var(--paper)] border border-[var(--line)] px-2.5 py-0.5 text-xs font-semibold text-[var(--accent)]">
              {data.examName}
            </span>
            <span className="text-xs font-mono opacity-70">
              Subject: {data.subjectName}
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--ink)]">
            {data.title}
          </h1>
          <p className="text-xs text-[var(--ink)] opacity-75">{data.description}</p>
        </div>

        {/* Parameters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded border border-[var(--line)] bg-[var(--paper)] p-4 text-center font-mono text-xs">
          <div>
            <div className="opacity-60 text-[10px] uppercase">Questions</div>
            <div className="font-bold text-sm text-[var(--ink)]">{data.questionCount}</div>
          </div>
          <div>
            <div className="opacity-60 text-[10px] uppercase">Duration</div>
            <div className="font-bold text-sm text-[var(--ink)]">{data.duration} Minutes</div>
          </div>
          <div>
            <div className="opacity-60 text-[10px] uppercase">Total Marks</div>
            <div className="font-bold text-sm text-[var(--ink)]">{data.totalMarks}</div>
          </div>
          <div>
            <div className="opacity-60 text-[10px] uppercase">Negative Marking</div>
            <div className="font-bold text-sm text-[var(--signal-wrong)]">-{data.negativeMarks}</div>
          </div>
        </div>

        {/* Ongoing Attempt Alert */}
        {data.activeAttemptId && (
          <div className="rounded border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <AlertCircle size={17} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold">You have an in-progress attempt for this test.</p>
              <p className="opacity-85 mt-0.5">
                Starting this test will automatically resume your ongoing attempt with all previously saved answers and remaining countdown time preserved.
              </p>
            </div>
          </div>
        )}

        {/* Instructions Body */}
        <div className="space-y-4 text-xs text-[var(--ink)] leading-relaxed">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--accent)] font-serif">
            Standard Examination Instructions
          </h2>

          <ol className="list-decimal pl-5 space-y-2 opacity-85">
            {data.instructions.map((inst, i) => (
              <li key={i}>{inst}</li>
            ))}
          </ol>
        </div>

        {/* Question Palette Symbol Legend (§7) */}
        <div className="rounded border border-[var(--line)] bg-[var(--paper)] p-4 space-y-2">
          <h3 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">
            Question Palette Reference
          </h3>
          <p className="text-[11px] opacity-75">
            The palette on the examination screen displays the real-time status of each question using the following symbols:
          </p>
          <div className="pt-2">
            <PaletteLegend />
          </div>
        </div>

        {/* Declaration & Checkbox */}
        <div className="border-t border-[var(--line)] pt-5 space-y-4">
          <label
            className="flex items-start gap-3 cursor-pointer select-none text-xs text-[var(--ink)]"
          >
            <input
              type="checkbox"
              id="declaration-checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 accent-[var(--accent)]"
            />
            <span className="leading-snug">
              I have read and understood all the instructions outlined above. I agree that the countdown clock will be synchronized with the server and that the examination will submit automatically upon expiration of time.
            </span>
          </label>

          {errorMessage && (
            <div className="rounded border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-700 dark:text-red-300">
              {errorMessage}
            </div>
          )}

          {!user && (
            <div className="rounded border border-[var(--line)] bg-[var(--paper)] p-3 text-xs text-[var(--ink)] opacity-80">
              Note: You are currently not signed in. Clicking start will redirect you to quick login so your score and accuracy history can be saved.
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/mock-tests"
              className="rounded border border-[var(--line)] px-4 py-2.5 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--paper)]"
            >
              Cancel
            </Link>

            <button
              id="begin-test-btn"
              type="button"
              disabled={!agreed || starting}
              onClick={handleStart}
              className={`rounded px-6 py-2.5 text-xs font-bold text-white transition-colors ${
                agreed && !starting
                  ? 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] cursor-pointer'
                  : 'bg-gray-400 opacity-50 cursor-not-allowed'
              }`}
            >
              {starting
                ? 'Initializing Test Session...'
                : data.activeAttemptId
                ? 'Resume Attempt'
                : 'I am Ready to Begin'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestInstructionsPage;
