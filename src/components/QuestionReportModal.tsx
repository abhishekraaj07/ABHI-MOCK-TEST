import React, { useState } from 'react';
import { Flag, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface QuestionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: string;
  testId?: string;
  questionText?: string;
}

const REPORT_REASONS = [
  { value: 'wrong_question', label: 'Wrong or Incomplete Question' },
  { value: 'wrong_answer', label: 'Incorrect Answer Key / Options' },
  { value: 'typo', label: 'Spelling or Grammar Error' },
  { value: 'unclear_question', label: 'Ambiguous or Confusing Question' },
  { value: 'technical_issue', label: 'Technical Issue (Image/Math error)' },
];

export const QuestionReportModal: React.FC<QuestionReportModalProps> = ({
  isOpen,
  onClose,
  questionId,
  testId,
  questionText,
}) => {
  const { user, guestLogin } = useAuth();
  const [reason, setReason] = useState<string>(REPORT_REASONS[0].value);
  const [description, setDescription] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (description.trim().length < 5) {
      setError('Please provide a brief description (at least 5 characters).');
      return;
    }

    if (!user) {
      await guestLogin();
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('abhi_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await apiFetch('/api/reports', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          questionId,
          testId,
          reason,
          description: description.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit question report.');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setDescription('');
        onClose();
      }, 1800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while submitting.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-2xl p-6 text-[var(--ink)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 id="report-modal-title" className="text-lg font-bold">
                Report an Issue with this Question
              </h3>
              <p className="text-xs text-[var(--ink-muted)]">
                Our academic team will review and verify within 24 hours.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-hover)] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question snippet preview */}
        {questionText && (
          <div className="my-4 p-3 bg-[var(--surface-sunken)] border border-[var(--line)] rounded-xl text-xs text-[var(--ink-muted)] line-clamp-2 italic">
            "{questionText}"
          </div>
        )}

        {success ? (
          <div className="py-8 flex flex-col items-center text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-500 animate-bounce" />
            <h4 className="text-lg font-semibold text-emerald-500">Report Submitted</h4>
            <p className="text-sm text-[var(--ink-muted)] max-w-xs">
              Thank you for helping us maintain question bank quality!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider mb-2">
                What is the issue?
              </label>
              <div className="space-y-2">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r.value}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all text-sm ${
                      reason === r.value
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--ink)] font-medium'
                        : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink-muted)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r.value}
                      checked={reason === r.value}
                      onChange={(e) => setReason(e.target.value)}
                      className="text-[var(--accent)] focus:ring-[var(--accent)]"
                    />
                    <span>{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider mb-1.5">
                Description & Feedback
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what is wrong (e.g., 'Option C is correct according to NCERT formula', 'Missing negative sign in equation')..."
                rows={3}
                required
                className="w-full px-3.5 py-2.5 bg-[var(--surface-sunken)] border border-[var(--line)] rounded-xl text-sm text-[var(--ink)] placeholder-[var(--ink-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-hover)] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[var(--accent)] hover:opacity-90 active:scale-98 rounded-xl transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Report'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
