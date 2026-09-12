import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, Link } from '../contexts/RouterContext';
import {
  Bookmark,
  Trash2,
  Sparkles,
  X,
  Flag,
  Search,
  Filter,
  Layers,
} from 'lucide-react';
import { GeminiChatbot } from '../components/GeminiChatbot';
import { QuestionReportModal } from '../components/QuestionReportModal';

export const BookmarksPage: React.FC = () => {
  const { navigate } = useRouter();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiTutorQuestion, setAiTutorQuestion] = useState<any | null>(null);
  const [reportingQuestion, setReportingQuestion] = useState<any | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedExam, setSelectedExam] = useState<string>('ALL');

  useEffect(() => {
    async function loadBookmarks() {
      try {
        const token = localStorage.getItem('abhi_token');
        if (!token) {
          navigate('/login?redirect=/bookmarks');
          return;
        }

        const res = await fetch('/api/bookmarks', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const json = await res.json();
          setBookmarks(json.bookmarks || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadBookmarks();
  }, [navigate]);

  const handleRemove = async (id: string) => {
    try {
      const token = localStorage.getItem('abhi_token');
      const res = await fetch(`/api/bookmarks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setBookmarks((prev) => prev.filter((b) => b.id !== id && b.questionId !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Distinct subjects and exams for filters
  const subjects = useMemo(() => {
    const set = new Set<string>();
    bookmarks.forEach((b) => {
      if (b.subjectName) set.add(b.subjectName);
    });
    return Array.from(set).sort();
  }, [bookmarks]);

  const exams = useMemo(() => {
    const set = new Set<string>();
    bookmarks.forEach((b) => {
      if (b.examName) set.add(b.examName);
    });
    return Array.from(set).sort();
  }, [bookmarks]);

  // Filtered bookmark list
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((b) => {
      if (selectedSubject !== 'ALL' && b.subjectName !== selectedSubject) {
        return false;
      }
      if (selectedExam !== 'ALL' && b.examName !== selectedExam) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesText = b.questionText?.toLowerCase().includes(query);
        const matchesTopic = b.topicName?.toLowerCase().includes(query);
        if (!matchesText && !matchesTopic) return false;
      }
      return true;
    });
  }, [bookmarks, selectedSubject, selectedExam, searchQuery]);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[var(--line)] pb-5 space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-semibold uppercase tracking-wider">
          <Bookmark size={14} /> Revision Bank
        </div>
        <h1 className="font-serif text-3xl font-bold text-[var(--ink)]">
          Saved Revision Questions
        </h1>
        <p className="text-xs text-[var(--ink-muted)]">
          Curated collection of questions flagged during live exam simulations and practice drills.
        </p>
      </div>

      {/* Filter and Search Controls */}
      {bookmarks.length > 0 && (
        <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by keywords or topic..."
                className="w-full pl-9 pr-4 py-2 bg-[var(--surface-sunken)] border border-[var(--line)] rounded-lg text-xs text-[var(--ink)] placeholder-[var(--ink-muted)] focus:outline-none focus:border-[var(--accent)]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] hover:text-[var(--ink)]"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Subject Select */}
            {subjects.length > 0 && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-medium text-[var(--ink-muted)] shrink-0 flex items-center gap-1">
                  <Filter size={12} /> Subject:
                </span>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-2.5 py-1.5 bg-[var(--surface-sunken)] border border-[var(--line)] rounded-lg text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="ALL">All Subjects ({bookmarks.length})</option>
                  {subjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Exam Select */}
            {exams.length > 0 && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-medium text-[var(--ink-muted)] shrink-0 flex items-center gap-1">
                  <Layers size={12} /> Exam:
                </span>
                <select
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                  className="px-2.5 py-1.5 bg-[var(--surface-sunken)] border border-[var(--line)] rounded-lg text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="ALL">All Exams</option>
                  {exams.map((ex) => (
                    <option key={ex} value={ex}>
                      {ex}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-[var(--ink-muted)] pt-1 border-t border-[var(--line)]">
            <span>
              Showing {filteredBookmarks.length} of {bookmarks.length} saved questions
            </span>
            {(selectedSubject !== 'ALL' || selectedExam !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedSubject('ALL');
                  setSelectedExam('ALL');
                  setSearchQuery('');
                }}
                className="text-[var(--accent)] hover:underline font-medium"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <div className="py-20 text-center text-sm opacity-60">Loading saved bookmarks...</div>
      ) : bookmarks.length === 0 ? (
        <div className="rounded border border-[var(--line)] bg-[var(--surface)] py-16 text-center space-y-3">
          <Bookmark size={32} className="mx-auto text-[var(--accent)] opacity-40" />
          <p className="font-semibold text-[var(--ink)]">No bookmarked questions saved yet.</p>
          <p className="text-xs opacity-70">
            Click the bookmark icon during any test or practice drill to store difficult questions here.
          </p>
          <Link
            href="/mock-tests"
            className="inline-block rounded bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white"
          >
            Explore Mock Tests
          </Link>
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <div className="rounded border border-[var(--line)] bg-[var(--surface)] py-12 text-center space-y-2">
          <p className="font-semibold text-[var(--ink)] text-sm">No matching questions found.</p>
          <p className="text-xs text-[var(--ink-muted)]">Try adjusting your search query or filters.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredBookmarks.map((b, idx) => (
            <div
              key={b.id}
              className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4 shadow-sm transition-all hover:border-[var(--accent)]/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <span className="font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded">
                    {b.subjectName}
                  </span>
                  <span className="opacity-70 font-sans">• {b.topicName}</span>
                  {b.examName && (
                    <span className="opacity-70 font-sans">• {b.examName}</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setReportingQuestion(b)}
                    className="text-xs text-amber-500 hover:text-amber-600 flex items-center gap-1 opacity-80 hover:opacity-100 transition-colors"
                    title="Report question error"
                  >
                    <Flag size={13} />
                    <span>Report</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(b.id)}
                    className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 opacity-80 hover:opacity-100 transition-colors"
                  >
                    <Trash2 size={13} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>

              <p className="text-sm font-medium text-[var(--ink)] leading-relaxed">
                <span className="font-bold font-mono text-[var(--accent)] mr-1.5">
                  Q{idx + 1}.
                </span>
                {b.questionText}
              </p>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                {b.options.map((opt: any) => (
                  <div
                    key={opt.optionKey}
                    className={`p-2.5 rounded border flex items-center justify-between ${
                      opt.isCorrect
                        ? 'border-[var(--signal-correct)] bg-emerald-500/10 font-semibold text-[var(--ink)]'
                        : 'border-[var(--line)] bg-[var(--surface-sunken)] text-[var(--ink)]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold">{opt.optionKey}.</span>
                      <span>{opt.optionText}</span>
                    </div>
                    {opt.isCorrect && (
                      <span className="text-[10px] font-mono text-[var(--signal-correct)] font-bold">
                        ✓ Correct
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Explanation */}
              {b.explanation && (
                <div className="rounded border border-[var(--line)] bg-[var(--surface-sunken)] p-3.5 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold uppercase tracking-wider text-[10px] text-[var(--accent)]">
                      Solution Reference
                    </div>
                    <button
                      type="button"
                      onClick={() => setAiTutorQuestion(b)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 border border-[var(--accent)]/20 transition-colors text-[11px] font-semibold"
                    >
                      <Sparkles size={12} />
                      <span>Ask Gemini AI Mentor</span>
                    </button>
                  </div>
                  <p className="opacity-90 leading-relaxed font-sans">{b.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Gemini AI Question Dissector Modal */}
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
                    Gemini AI Question Dissector
                  </h3>
                  <p className="text-[10px] text-[var(--ink)] opacity-60">
                    {aiTutorQuestion.subjectName} • {aiTutorQuestion.topicName} ({aiTutorQuestion.examName})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAiTutorQuestion(null)}
                className="rounded p-1 text-[var(--ink)] opacity-60 hover:opacity-100 hover:bg-[var(--line)]/50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden p-2">
              <GeminiChatbot
                initialPersona="question-explainer"
                initialQuestionContext={`Question: "${aiTutorQuestion.questionText}". Options: ${aiTutorQuestion.options
                  .map((o: any) => `${o.optionKey}: ${o.optionText}`)
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
          questionId={reportingQuestion.questionId || reportingQuestion.id}
          questionText={reportingQuestion.questionText}
        />
      )}
    </div>
  );
};

export default BookmarksPage;
