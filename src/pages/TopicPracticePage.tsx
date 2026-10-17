import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../contexts/RouterContext';
import { ArrowLeft, Bookmark, BookmarkCheck, CheckCircle2, XCircle, ChevronRight, Flag } from 'lucide-react';
import { QuestionReportModal } from '../components/QuestionReportModal';
import { logger } from '../lib/logger';

export const TopicPracticePage: React.FC<{ topicId: string }> = ({ topicId }) => {
  const { navigate } = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Selected option per question for immediate feedback
  const [selectedMap, setSelectedMap] = useState<Map<string, string>>(new Map());
  const [bookmarkedSet, setBookmarkedSet] = useState<Set<string>>(new Set());
  const [reportingQuestion, setReportingQuestion] = useState<any | null>(null);

  useEffect(() => {
    async function loadTopic() {
      try {
        const token = localStorage.getItem('abhi_token');
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`/api/practice/topics/${topicId}`, {
          headers,
          credentials: 'include',
        });

        if (res.ok) {
          const json = await res.json();
          setData(json);
          const bSet = new Set<string>();
          json.questions.forEach((q: any) => {
            if (q.isBookmarked) bSet.add(q.id);
          });
          setBookmarkedSet(bSet);
        }
      } catch (e) {
        logger.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadTopic();
  }, [topicId]);

  const handleSelectOption = (qId: string, optionKey: string) => {
    if (selectedMap.has(qId)) return; // Lock after selection in practice mode
    setSelectedMap((prev) => new Map(prev).set(qId, optionKey));
  };

  const handleToggleBookmark = async (qId: string) => {
    try {
      const token = localStorage.getItem('abhi_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ questionId: qId }),
      });
      if (res.ok) {
        const json = await res.json();
        setBookmarkedSet((prev) => {
          const next = new Set(prev);
          if (json.bookmarked) next.add(qId);
          else next.delete(qId);
          return next;
        });
      }
    } catch (e) {
      logger.error(e);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-sm opacity-60">Loading practice drills...</div>;
  }

  if (!data || data.questions.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold">No Questions Found</h2>
        <p className="text-xs opacity-70">This practice module does not have active questions yet.</p>
        <Link href="/practice" className="inline-block rounded bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white">
          Back to Practice Index
        </Link>
      </div>
    );
  }

  const currentQ = data.questions[currentIndex];
  const userChoice = selectedMap.get(currentQ.id);
  const correctOpt = currentQ.options.find((o: any) => o.isCorrect);
  const hasAnswered = Boolean(userChoice);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-6">
      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <Link
          href="/practice"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline"
        >
          <ArrowLeft size={14} /> Back to practice modules
        </Link>
        <div className="text-xs font-mono opacity-70">
          Question {currentIndex + 1} of {data.questions.length}
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-[var(--line)] pb-4 space-y-1">
        <div className="text-xs font-mono text-[var(--accent)] font-semibold">
          {data.topic.subjectName} • {data.topic.name}
        </div>
        <h1 className="font-serif text-2xl font-bold text-[var(--ink)]">
          Interactive Practice Drill
        </h1>
      </div>

      {/* Question Card */}
      <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between text-xs opacity-70">
          <span className="font-mono font-semibold text-[var(--accent)]">
            QUESTION #{currentIndex + 1}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleToggleBookmark(currentQ.id)}
              className="flex items-center gap-1 text-[var(--accent)] hover:underline"
            >
              {bookmarkedSet.has(currentQ.id) ? (
                <BookmarkCheck size={16} className="fill-current" />
              ) : (
                <Bookmark size={16} />
              )}
              <span className="text-[11px]">Save for later</span>
            </button>
            <button
              onClick={() => setReportingQuestion(currentQ)}
              className="flex items-center gap-1 text-amber-500 hover:underline"
              title="Report question issue"
            >
              <Flag size={15} />
              <span className="text-[11px]">Report</span>
            </button>
          </div>
        </div>

        <p className="text-base sm:text-lg font-medium text-[var(--ink)] leading-relaxed font-sans">
          {currentQ.questionText}
        </p>

        {/* Options */}
        <div className="space-y-3 pt-2">
          {currentQ.options.map((opt: any) => {
            const isSelected = userChoice === opt.optionKey;
            const isCorrect = opt.isCorrect;

            let optStyle = 'border-[var(--line)] bg-[var(--surface)] hover:border-gray-400';
            if (hasAnswered) {
              if (isCorrect) {
                optStyle =
                  'border-[var(--signal-correct)] bg-emerald-50/60 dark:bg-emerald-950/20 font-bold';
              } else if (isSelected && !isCorrect) {
                optStyle =
                  'border-[var(--signal-wrong)] bg-red-50/60 dark:bg-red-950/20';
              }
            }

            return (
              <div
                key={opt.optionKey}
                onClick={() => handleSelectOption(currentQ.id, opt.optionKey)}
                className={`flex items-center justify-between rounded border p-4 cursor-pointer transition-all ${optStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--paper)] border border-[var(--line)] font-mono text-xs font-bold">
                    {opt.optionKey}
                  </span>
                  <span className="text-sm">{opt.optionText}</span>
                </div>

                {hasAnswered && (
                  <div className="text-xs font-mono">
                    {isCorrect && (
                      <span className="text-[var(--signal-correct)] font-bold flex items-center gap-1">
                        <CheckCircle2 size={14} /> Correct
                      </span>
                    )}
                    {isSelected && !isCorrect && (
                      <span className="text-[var(--signal-wrong)] font-bold flex items-center gap-1">
                        <XCircle size={14} /> Your Choice
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Immediate Explanation Reveal */}
        {hasAnswered && (
          <div className="rounded border border-[var(--line)] bg-[var(--paper)] p-5 space-y-2 animate-in fade-in duration-150">
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              Step-by-Step Solution & Concept
            </div>
            <p className="text-xs opacity-90 leading-relaxed font-sans">{currentQ.explanation}</p>
          </div>
        )}

        {/* Next Question Navigation */}
        <div className="border-t border-[var(--line)] pt-4 flex justify-between items-center">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => prev - 1)}
            className="rounded border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--ink)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <button
            onClick={() => {
              if (currentIndex < data.questions.length - 1) {
                setCurrentIndex((prev) => prev + 1);
              } else {
                navigate('/practice');
              }
            }}
            className="rounded bg-[var(--accent)] px-5 py-2 text-xs font-bold text-white hover:bg-[var(--accent-hover)] transition-colors flex items-center gap-1"
          >
            {currentIndex === data.questions.length - 1 ? 'Finish Practice' : 'Next Question'}
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

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

export default TopicPracticePage;
