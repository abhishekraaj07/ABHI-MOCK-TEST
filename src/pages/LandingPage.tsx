import React, { useEffect, useState } from 'react';
import '../styles/heroAnimation.css';
import { Link } from '../contexts/RouterContext';
import { Exam } from '../types';
import { PaletteLegend } from '../components/PaletteLegend';
import { Clock, CheckCircle2, Shield, BarChart3, ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { FALLBACK_EXAMS, FALLBACK_STATS } from '../lib/fallbackData';
import { SBI_PO_QUANT_35_QUESTIONS } from '../data/sbiPoQuantDemoQuestions';

export const LandingPage: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>(FALLBACK_EXAMS);
  const [stats, setStats] = useState<{
    totalExams: number;
    totalTests: number;
    totalQuestions: number;
    availabilityRate: string;
  }>(FALLBACK_STATS);
  const [loading, setLoading] = useState(false);

  // Demo interactive widget state in Hero section (§4)
  // Starts directly on Question 16 (index 15) so candidate immediately sees Question 16 of 35
  const [demoIndex, setDemoIndex] = useState<number>(15);

  // Pre-fill realistic candidate answers for prior questions (1 to 15)
  const [demoAnswers, setDemoAnswers] = useState<Record<number, string>>({
    0: 'A',
    1: 'A',
    2: 'A',
    3: 'A',
    4: 'A',
    5: 'A',
    6: 'A',
    7: 'A',
    8: 'A',
    9: 'A',
    11: 'A',
    13: 'B',
  });

  // Track review flags by question index
  const [demoReview, setDemoReview] = useState<Record<number, boolean>>({
    10: true, // Q11 marked for review
    11: true, // Q12 answered & marked for review
  });

  // Track visited status by question index
  const [demoVisited, setDemoVisited] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    for (let i = 0; i <= 15; i++) {
      init[i] = true;
    }
    return init;
  });

  const [demoTimer, setDemoTimer] = useState<number>(19 * 60 + 42); // 19m 42s Sectional Timer

  const totalQuestions = SBI_PO_QUANT_35_QUESTIONS.length; // 35
  const answeredCount = Object.keys(demoAnswers).length;
  const reviewCount = Object.values(demoReview).filter(Boolean).length;
  const visitedCount = Object.values(demoVisited).filter(Boolean).length;
  const unansweredCount = Math.max(0, visitedCount - answeredCount);
  const notVisitedCount = Math.max(0, totalQuestions - visitedCount);
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const getQuestionStatus = (idx: number) => {
    const hasAnswer = !!demoAnswers[idx];
    const isReview = !!demoReview[idx];
    const isVisited = !!demoVisited[idx];

    if (hasAnswer && isReview) return 'answered_review';
    if (hasAnswer) return 'answered';
    if (isReview) return 'review';
    if (isVisited) return 'unanswered';
    return 'not_visited';
  };

  const handleSelectDemoOption = (optKey: string) => {
    setDemoAnswers((prev) => ({ ...prev, [demoIndex]: optKey }));
    setDemoVisited((prev) => ({ ...prev, [demoIndex]: true }));
  };

  const handleDemoNext = () => {
    setDemoVisited((prev) => ({ ...prev, [demoIndex]: true }));
    setDemoIndex((prev) => {
      const nextIdx = (prev + 1) % totalQuestions;
      setDemoVisited((v) => ({ ...v, [nextIdx]: true }));
      return nextIdx;
    });
  };

  const handleDemoPrev = () => {
    setDemoVisited((prev) => ({ ...prev, [demoIndex]: true }));
    setDemoIndex((prev) => {
      const prevIdx = (prev - 1 + totalQuestions) % totalQuestions;
      setDemoVisited((v) => ({ ...v, [prevIdx]: true }));
      return prevIdx;
    });
  };

  const handleDemoClear = () => {
    setDemoAnswers((prev) => {
      const next = { ...prev };
      delete next[demoIndex];
      return next;
    });
  };

  const handleDemoMarkReview = () => {
    setDemoReview((prev) => ({
      ...prev,
      [demoIndex]: !prev[demoIndex],
    }));
    setDemoVisited((prev) => ({ ...prev, [demoIndex]: true }));
  };

  const handleJumpToQuestion = (idx: number) => {
    setDemoIndex(idx);
    setDemoVisited((prev) => ({ ...prev, [idx]: true }));
  };

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await apiFetch('/api/exams', undefined, 3, 500);
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data.exams && data.exams.length > 0) {
            setExams(data.exams);
          }
          if (data.stats) {
            setStats(data.stats);
          }
        }
      } catch (err) {
        console.warn('Could not refresh landing exams, using cached catalog:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Demo ticking timer
  useEffect(() => {
    const timer = setInterval(() => {
      setDemoTimer((prev) => (prev > 0 ? prev - 1 : 3600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDemoTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION (§4) */}
      <section className="hero-anim border-b border-[var(--line)] bg-[var(--surface)] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded border border-[var(--line)] bg-[var(--paper)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                <span className="h-2 w-2 rounded-full bg-[var(--signal-correct)] animate-pulse" />
                2026 Competitive Exam Series Live
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[var(--ink)] leading-[1.15]">
                Crack Competitive Exams With Smarter Practice
              </h1>

              <p className="text-base sm:text-lg text-[var(--ink)] opacity-80 leading-relaxed max-w-2xl font-sans">
                Full-fidelity test simulations, server-authoritative countdown timers, and strict negative-marking analytics engineered for serious SBI, IBPS, SSC, and RBI aspirants.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/mock-tests?tab=Free"
                  id="hero-cta-free-test"
                  className="rounded bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
                >
                  Start Free Mock Test
                </Link>

                <Link
                  href="/exams"
                  id="hero-cta-explore-exams"
                  className="rounded border border-[var(--line)] bg-[var(--surface)] px-6 py-3 text-sm font-semibold text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                  Explore Target Exams
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-4 text-xs opacity-75 font-sans">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-[var(--signal-correct)]" />
                  <span>Exact official marking schemes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-[var(--signal-correct)]" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Preview Widget (§4) */}
            <div className="lg:col-span-5">
              <div className="rounded border border-[var(--line)] bg-[var(--paper)] p-5 shadow-sm space-y-4">
                {/* Simulated Engine Header */}
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-3 text-xs">
                  <div>
                    <div className="font-semibold text-[var(--ink)]">
                      SBI PO Prelims — Section 1: Quantitative
                    </div>
                    <div className="text-[10px] text-[var(--ink)] opacity-60">
                      Sectional Time: 20 Minutes • 35 Questions
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 rounded bg-[var(--surface)] px-2.5 py-1 font-mono font-bold text-[var(--accent)] border border-[var(--line)]">
                    <Clock size={13} />
                    <span>{formatDemoTimer(demoTimer)}</span>
                  </div>
                </div>

                {/* Simulated Question Card */}
                {(() => {
                  const currentQ = SBI_PO_QUANT_35_QUESTIONS[demoIndex];
                  const currentAnswer = demoAnswers[demoIndex];
                  const isReviewed = !!demoReview[demoIndex];

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-[var(--ink)]">
                        <div className="flex items-center gap-2">
                          <span id="demo-question-heading" className="font-semibold text-sm">
                            Question {currentQ.qNum} of {totalQuestions}
                          </span>
                          <span className="rounded bg-[var(--surface)] border border-[var(--line)] px-1.5 py-0.5 text-[10px] opacity-75 font-medium">
                            {currentQ.topic}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] opacity-70">{currentQ.marks}</span>
                      </div>

                      {/* Live Sectional Progress Indicator */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono opacity-75">
                          <span>Live Progress: {answeredCount} / {totalQuestions} Answered</span>
                          <span className="font-bold text-[var(--accent)]">{progressPercent}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-[var(--surface)] border border-[var(--line)] overflow-hidden">
                          <div
                            className="h-full bg-[var(--signal-correct)] transition-all duration-300 rounded-full"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      <p className="text-sm font-medium text-[var(--ink)] leading-snug min-h-[44px]">
                        {currentQ.text}
                      </p>

                      <div className="space-y-2 pt-1 text-xs">
                        {currentQ.options.map((opt) => (
                          <label
                            key={opt.key}
                            onClick={() => handleSelectDemoOption(opt.key)}
                            className={`flex items-center gap-3 rounded border p-2.5 cursor-pointer transition-colors ${
                              currentAnswer === opt.key
                                ? 'border-[var(--accent)] bg-[var(--surface)] font-medium text-[var(--ink)] shadow-xs ring-1 ring-[var(--accent)]'
                                : 'border-[var(--line)] bg-[var(--surface)] hover:border-gray-400'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`demo-option-${currentQ.id}`}
                              checked={currentAnswer === opt.key}
                              onChange={() => handleSelectDemoOption(opt.key)}
                              className="accent-[var(--accent)] cursor-pointer"
                            />
                            <span className="font-mono font-bold text-[var(--accent)]">{opt.key}.</span>
                            <span className="text-[var(--ink)]">{opt.text}</span>
                          </label>
                        ))}
                      </div>

                      {/* Navigation Controls with Next Button */}
                      <div className="border-t border-[var(--line)] pt-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            id="demo-btn-prev"
                            type="button"
                            onClick={handleDemoPrev}
                            className="inline-flex items-center gap-1 rounded border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--paper)] transition-colors"
                            title="Previous Question"
                          >
                            <ChevronLeft size={13} />
                            <span>Prev</span>
                          </button>
                          <button
                            id="demo-btn-clear"
                            type="button"
                            onClick={handleDemoClear}
                            className="rounded border border-[var(--line)] bg-[var(--surface)] px-2 py-1.5 text-[11px] font-medium text-[var(--ink)] opacity-70 hover:opacity-100 hover:bg-[var(--paper)] transition-colors"
                            title="Clear Selection"
                          >
                            Clear
                          </button>
                          <button
                            id="demo-btn-review"
                            type="button"
                            onClick={handleDemoMarkReview}
                            className={`rounded px-2.5 py-1.5 text-[11px] font-semibold border transition-colors ${
                              isReviewed
                                ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700'
                                : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] opacity-80 hover:opacity-100'
                            }`}
                            title="Mark for Review"
                          >
                            {isReviewed ? 'Marked' : 'Review'}
                          </button>
                        </div>

                        <button
                          id="demo-btn-next"
                          type="button"
                          onClick={handleDemoNext}
                          className="inline-flex items-center gap-1.5 rounded bg-[var(--accent)] px-4 py-1.5 text-xs font-bold text-white hover:bg-[var(--accent-hover)] transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                          <span>Next</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* 35-Question Live Response Palette */}
                <div className="border-t border-[var(--line)] pt-3">
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] font-semibold text-[var(--ink)] opacity-90 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span>Response Palette</span>
                      <span className="font-mono text-[10px] rounded bg-[var(--surface)] border border-[var(--line)] px-1 py-0.2">
                        {demoIndex + 1} / {totalQuestions}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      <span className="text-[var(--signal-correct)] font-bold">{answeredCount} Answered</span>
                      <span>•</span>
                      <span className="text-[var(--signal-wrong)] font-bold">{unansweredCount} Unanswered</span>
                      <span>•</span>
                      <span className="text-purple-600 dark:text-purple-400 font-bold">{reviewCount} Review</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-xs font-mono max-h-36 overflow-y-auto pr-0.5">
                    {SBI_PO_QUANT_35_QUESTIONS.map((item, idx) => {
                      const stat = getQuestionStatus(idx);
                      const isCurrent = demoIndex === idx;

                      return (
                        <button
                          key={item.id}
                          id={`demo-palette-q-${item.qNum}`}
                          type="button"
                          onClick={() => handleJumpToQuestion(idx)}
                          className={`h-6 sm:h-7 flex items-center justify-center rounded border text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer relative ${
                            isCurrent ? 'ring-2 ring-[var(--accent)] ring-offset-1 font-black scale-105 z-10' : ''
                          } ${
                            stat === 'answered'
                              ? 'bg-[var(--signal-correct)] text-white border-transparent'
                              : stat === 'answered_review'
                              ? 'bg-[var(--signal-review)] text-white border-transparent'
                              : stat === 'review'
                              ? 'bg-[var(--signal-review)] text-white border-transparent'
                              : stat === 'unanswered'
                              ? 'bg-[var(--signal-wrong)] text-white border-transparent'
                              : 'bg-[var(--surface)] text-[var(--ink)] border-[var(--line)] opacity-85 hover:opacity-100'
                          }`}
                          title={`Question ${item.qNum}: ${stat.replace('_', ' ')}`}
                        >
                          {item.qNum}
                          {stat === 'answered_review' && (
                            <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[var(--signal-correct)] ring-1 ring-white" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Direct CTA to Launch SBI PO Prelims Test */}
                <div className="border-t border-[var(--line)] pt-3 flex items-center justify-between text-xs">
                  <span className="text-[11px] opacity-75">Ready for the real timed test?</span>
                  <Link
                    href="/test/b55bf26f-0f32-4fcb-b411-ad012aad0a64/instructions"
                    className="inline-flex items-center gap-1 font-bold text-[var(--accent)] hover:underline"
                  >
                    <span>Launch SBI PO Mock</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS STRIP (§4) — Database-derived metrics */}
      <section className="border-b border-[var(--line)] bg-[var(--paper)] py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="font-serif text-3xl sm:text-4xl font-semibold text-[var(--ink)]">
                {stats.totalQuestions}+
              </div>
              <div className="text-xs text-[var(--ink)] opacity-70 uppercase tracking-wider font-sans">
                Curated Questions
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-serif text-3xl sm:text-4xl font-semibold text-[var(--ink)]">
                {stats.totalTests}
              </div>
              <div className="text-xs text-[var(--ink)] opacity-70 uppercase tracking-wider font-sans">
                Full & Sectional Mocks
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-serif text-3xl sm:text-4xl font-semibold text-[var(--ink)]">
                {stats.totalExams}
              </div>
              <div className="text-xs text-[var(--ink)] opacity-70 uppercase tracking-wider font-sans">
                Target Exam Frameworks
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-serif text-3xl sm:text-4xl font-semibold text-[var(--accent)] font-mono">
                {stats.availabilityRate}
              </div>
              <div className="text-xs text-[var(--ink)] opacity-70 uppercase tracking-wider font-sans">
                Server Availability
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. POPULAR EXAMS GRID */}
      <section className="border-b border-[var(--line)] bg-[var(--surface)] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--ink)]">
                Target Examination Series
              </h2>
              <p className="text-sm text-[var(--ink)] opacity-70 font-sans mt-1">
                Select your targeted exam pattern to access curated syllabus-specific question sets.
              </p>
            </div>
            <Link
              href="/exams"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline"
            >
              View all exams <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="flex flex-col justify-between rounded border border-[var(--line)] bg-[var(--paper)] p-6 hover:border-[var(--accent)] transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-[var(--surface)] border border-[var(--line)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--accent)]">
                      {exam.category}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--ink)] opacity-60">
                      Difficulty: {exam.difficulty}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[var(--ink)] font-serif">
                    {exam.name}
                  </h3>

                  <p className="text-xs text-[var(--ink)] opacity-75 line-clamp-2 leading-relaxed">
                    {exam.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {exam.subjects.map((sub) => (
                      <span
                        key={sub}
                        className="rounded bg-[var(--surface)] border border-[var(--line)] px-2 py-0.5 text-[10px] text-[var(--ink)] opacity-80"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[var(--line)] pt-4 mt-6 flex items-center justify-between text-xs">
                  <span className="font-mono text-[var(--ink)] opacity-70">
                    {exam.testCount} Mock Tests
                  </span>
                  <Link
                    href={`/exams/${exam.slug}`}
                    className="font-semibold text-[var(--accent)] hover:underline"
                  >
                    View Tests →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WHY ABHI MOCK TEST — 4 Real Differentiators (§4) */}
      <section className="border-b border-[var(--line)] bg-[var(--paper)] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--ink)]">
              Engineered For High-Stakes Accuracy
            </h2>
            <p className="text-sm text-[var(--ink)] opacity-75">
              Built to replicate the exact cognitive stress and timing constraints of official examination halls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 space-y-3">
              <div className="h-9 w-9 rounded bg-[var(--paper)] border border-[var(--line)] flex items-center justify-center text-[var(--accent)]">
                <CheckCircle2 size={18} />
              </div>
              <h3 className="font-bold text-sm text-[var(--ink)]">Exact Exam Patterns</h3>
              <p className="text-xs text-[var(--ink)] opacity-75 leading-relaxed">
                Exact section timings, question formats, and official 0.25 negative-marking rules for banking and SSC tiers.
              </p>
            </div>

            <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 space-y-3">
              <div className="h-9 w-9 rounded bg-[var(--paper)] border border-[var(--line)] flex items-center justify-center text-[var(--accent)]">
                <Clock size={18} />
              </div>
              <h3 className="font-bold text-sm text-[var(--ink)]">Server-Authoritative Clock</h3>
              <p className="text-xs text-[var(--ink)] opacity-75 leading-relaxed">
                Countdown calculations execute against database timestamps to prevent tab-freezing or clock resets.
              </p>
            </div>

            <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 space-y-3">
              <div className="h-9 w-9 rounded bg-[var(--paper)] border border-[var(--line)] flex items-center justify-center text-[var(--accent)]">
                <BarChart3 size={18} />
              </div>
              <h3 className="font-bold text-sm text-[var(--ink)]">Granular Diagnostics</h3>
              <p className="text-xs text-[var(--ink)] opacity-75 leading-relaxed">
                Sub-60% accuracy triggers automatic topic-level practice recommendations rather than generic score summaries.
              </p>
            </div>

            <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 space-y-3">
              <div className="h-9 w-9 rounded bg-[var(--paper)] border border-[var(--line)] flex items-center justify-center text-[var(--accent)]">
                <Shield size={18} />
              </div>
              <h3 className="font-bold text-sm text-[var(--ink)]">Distraction-Free UI</h3>
              <p className="text-xs text-[var(--ink)] opacity-75 leading-relaxed">
                Calm typographical hierarchy with zero ads, gamified banners, or loud animations to keep your focus intact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS (§4) — 4-Step Sequence */}
      <section className="bg-[var(--surface)] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--ink)]">
              Four Steps To Mastery
            </h2>
            <p className="text-sm text-[var(--ink)] opacity-75">
              Structured preparation that systematically eliminates errors before exam day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Choose Exam',
                desc: 'Select from SBI PO, IBPS, SSC CGL, or RBI Grade B with sectional or full-length formats.',
              },
              {
                step: '02',
                title: 'Simulate Conditions',
                desc: 'Attempt tests under full countdown clock pressure with the standardized 5-state palette.',
              },
              {
                step: '03',
                title: 'Analyze Scorecard',
                desc: 'Review question-by-question explanations, negative-mark deductions, and percentile rank.',
              },
              {
                step: '04',
                title: 'Target Weak Areas',
                desc: 'Drill automatically recommended topics until your accuracy comfortably exceeds 75%.',
              },
            ].map((st) => (
              <div key={st.step} className="rounded border border-[var(--line)] bg-[var(--paper)] p-6 space-y-3">
                <span className="font-mono text-xs font-bold text-[var(--accent)]">
                  STEP {st.step}
                </span>
                <h3 className="text-base font-bold text-[var(--ink)] font-serif">{st.title}</h3>
                <p className="text-xs text-[var(--ink)] opacity-75 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>

          {/* Bottom Banner */}
          <div className="mt-14 rounded border border-[var(--line)] bg-[var(--paper)] p-8 text-center space-y-4">
            <h3 className="font-serif text-2xl font-semibold text-[var(--ink)]">
              Ready to test your preparation under real exam pressure?
            </h3>
            <p className="text-sm text-[var(--ink)] opacity-75 max-w-xl mx-auto">
              Join thousands of aspirants who rely on ABHI MOCK TEST for accurate scoring and actionable weak-area analysis.
            </p>
            <div className="pt-2">
              <Link
                href="/mock-tests"
                className="inline-block rounded bg-[var(--accent)] px-8 py-3 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
              >
                Browse All Mock Tests
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
