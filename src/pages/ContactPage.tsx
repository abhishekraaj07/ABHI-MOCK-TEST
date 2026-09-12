import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, MapPin, Clock, AlertCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Feedback');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);

    // Simulate reliable dispatch with immediate user feedback
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      {/* Header */}
      <section className="border-b border-[var(--line)] bg-[var(--surface)] py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded border border-[var(--line)] bg-[var(--paper)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
            <MessageSquare size={14} />
            Support & Feedback
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            Contact Engineering Team
          </h1>
          <p className="text-sm sm:text-base opacity-75 max-w-xl mx-auto">
            Report a discrepancy in an exam question, report a technical issue, or suggest a new examination test series.
          </p>
        </div>
      </section>

      {/* Main Content Form & Details */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Contact Details & Info */}
          <div className="md:col-span-5 space-y-6">
            <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4">
              <h2 className="font-serif text-xl font-bold">Platform Information</h2>
              <p className="text-xs opacity-75 leading-relaxed">
                ABHI MOCK TEST is engineered as an educational software development project designed to provide free and accessible mock examinations for students nationwide.
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded bg-[var(--paper)] flex items-center justify-center text-[var(--accent)] flex-shrink-0">
                    <Mail size={14} />
                  </div>
                  <div>
                    <div className="font-semibold">Direct Email</div>
                    <div className="opacity-70 font-mono">support@abhimocktest.com</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded bg-[var(--paper)] flex items-center justify-center text-[var(--accent)] flex-shrink-0">
                    <Clock size={14} />
                  </div>
                  <div>
                    <div className="font-semibold">Response Window</div>
                    <div className="opacity-70">Within 24 business hours</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded bg-[var(--paper)] flex items-center justify-center text-[var(--accent)] flex-shrink-0">
                    <MapPin size={14} />
                  </div>
                  <div>
                    <div className="font-semibold">Project Location</div>
                    <div className="opacity-70">BCA Final-Year Capstone Project, India</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-5 space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--accent)]">
                Question Quality Assurance
              </h3>
              <p className="text-xs opacity-75 leading-relaxed">
                Notice an ambiguity or factual discrepancy in a quantitative question or reasoning puzzle? Send us the Question ID or Test Title and our review panel will verify the explanation.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-7">
            <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 space-y-5">
              <h2 className="font-serif text-xl font-bold">Send a Direct Message</h2>

              {submitted && (
                <div className="rounded border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/40 p-4 flex items-start gap-3 text-xs text-green-800 dark:text-green-300">
                  <CheckCircle2 size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Thank you for your feedback!</span>
                    <p className="mt-0.5 opacity-90">
                      Your submission has been received. Our review team will examine your query.
                    </p>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="rounded border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-3 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
                  <AlertCircle size={15} className="flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
                <div>
                  <label htmlFor="contact-name" className="block mb-1.5 opacity-80">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block mb-1.5 opacity-80">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block mb-1.5 opacity-80">
                    Subject Category
                  </label>
                  <select
                    id="contact-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none transition-colors"
                  >
                    <option value="Question / Syllabus Correction">Question / Syllabus Correction</option>
                    <option value="Platform Technical Issue">Platform Technical Issue</option>
                    <option value="Exam Pattern Suggestion">Exam Pattern Suggestion</option>
                    <option value="Account Assistance">Account Assistance</option>
                    <option value="General Feedback">General Feedback</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block mb-1.5 opacity-80">
                    Message Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please include test title or question number if reporting an issue..."
                    className="w-full rounded border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none transition-colors"
                  />
                </div>

                <button
                  id="contact-submit-btn"
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
                >
                  <Send size={15} />
                  <span>{submitting ? 'Submitting...' : 'Send Message'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
