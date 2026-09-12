import React from 'react';
import { Link } from '../contexts/RouterContext';
import { Wordmark } from '../components/Wordmark';
import {
  ShieldCheck,
  Award,
  BookOpen,
  Cpu,
  Target,
  ArrowRight,
  Database,
  BarChart3,
  Layers,
  CheckCircle2,
  Sparkles,
  Flame,
  BookX,
  Sliders,
  Flag,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      {/* Hero Header */}
      <section className="border-b border-[var(--line)] bg-[var(--surface)] py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--paper)] px-3.5 py-1 text-xs font-semibold text-[var(--accent)] shadow-xs">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" />
            About ABHI MOCK TEST
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold tracking-tight">
            Practice. Analyze. Master.
          </h1>
          <p className="text-base sm:text-lg text-[var(--ink)] opacity-80 max-w-2xl mx-auto leading-relaxed">
            An enterprise-grade, high-fidelity competitive examination simulation engine & AI diagnostic platform engineered for Indian competitive aspirants targeting SBI PO, SSC CGL, IBPS PO, RRB NTPC, and UPSC Prelims.
          </p>
        </div>
      </section>

      {/* Core Mission & Story */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5 space-y-4">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold">
              The Mission Behind the Platform
            </h2>
            <p className="text-sm opacity-80 leading-relaxed">
              Every year, over 30 million candidates across India prepare for banking, staff selection, engineering, and civil service examinations. In cut-throat competitions where cutoff differentials are often mere fractions of a mark, generic test portals fail to build exam-day temperament.
            </p>
            <p className="text-sm opacity-80 leading-relaxed">
              <strong>ABHI MOCK TEST</strong> was engineered with a uncompromising objective: replicate the exact cognitive, temporal, and psychological conditions of official TCS-iON and NTA exam halls, coupled with modern AI-driven retention analytics.
            </p>
          </div>

          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 space-y-2 shadow-xs">
              <div className="h-9 w-9 rounded-xl bg-[var(--paper)] flex items-center justify-center text-[var(--accent)]">
                <Target size={18} />
              </div>
              <h3 className="font-bold text-sm">Exam Accuracy</h3>
              <p className="text-xs opacity-75 leading-relaxed">
                Standardized syllabi for SBI, IBPS, SSC, and Railway exams with authentic sectional timings, negative marking schemes, and question patterns.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 space-y-2 shadow-xs">
              <div className="h-9 w-9 rounded-xl bg-[var(--paper)] flex items-center justify-center text-[var(--accent)]">
                <ShieldCheck size={18} />
              </div>
              <h3 className="font-bold text-sm">Server-Authoritative Clock</h3>
              <p className="text-xs opacity-75 leading-relaxed">
                Prevents client clock manipulation and tab pausing. Timers sync with database timestamps for tamper-proof examination conditions.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 space-y-2 shadow-xs">
              <div className="h-9 w-9 rounded-xl bg-[var(--paper)] flex items-center justify-center text-[var(--accent)]">
                <BarChart3 size={18} />
              </div>
              <h3 className="font-bold text-sm">Deep Diagnostics</h3>
              <p className="text-xs opacity-75 leading-relaxed">
                Sub-topic accuracy tracking, speed-per-question analysis, and automated weak-area detection (under 60% accuracy triggers targeted review).
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 space-y-2 shadow-xs">
              <div className="h-9 w-9 rounded-xl bg-[var(--paper)] flex items-center justify-center text-[var(--accent)]">
                <Sparkles size={18} />
              </div>
              <h3 className="font-bold text-sm">Gemini AI Tutor</h3>
              <p className="text-xs opacity-75 leading-relaxed">
                Step-by-step mathematical dissection and error analysis that explains why distractors are wrong and gives memorable memory hooks.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] font-bold uppercase tracking-wider">
            <Award size={15} /> Core Innovations
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold">
            Built for Serious Aspirants
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 space-y-2 shadow-xs">
              <div className="p-2 w-fit rounded-xl bg-rose-500/10 text-rose-500">
                <BookX size={18} />
              </div>
              <h3 className="font-bold text-sm">Mistake Notebook</h3>
              <p className="text-xs opacity-75 leading-relaxed">
                Indexes every incorrectly answered question. Includes an interactive flashcard drill to build permanent conceptual retention.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 space-y-2 shadow-xs">
              <div className="p-2 w-fit rounded-xl bg-amber-500/10 text-amber-500">
                <Flame size={18} />
              </div>
              <h3 className="font-bold text-sm">Daily Sprint Quiz</h3>
              <p className="text-xs opacity-75 leading-relaxed">
                A 5-minute rapid 5-question mixed section sprint with automatic daily learning streak counter and instant solution reveal.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 space-y-2 shadow-xs">
              <div className="p-2 w-fit rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                <Sliders size={18} />
              </div>
              <h3 className="font-bold text-sm">Custom Test Builder</h3>
              <p className="text-xs opacity-75 leading-relaxed">
                Create custom mock tests by selecting target exam, subject, difficulty, question count, and time limits.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 space-y-2 shadow-xs">
              <div className="p-2 w-fit rounded-xl bg-emerald-500/10 text-emerald-500">
                <Flag size={18} />
              </div>
              <h3 className="font-bold text-sm">Dispute & Ingestion</h3>
              <p className="text-xs opacity-75 leading-relaxed">
                Candidate question error reporting workflow and admin bulk CSV/JSON question ingestion with deduplication check.
              </p>
            </div>
          </div>
        </div>

        {/* Technical Architecture Overview */}
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
              <Cpu size={15} />
              Technical Architecture & Standards
            </div>
            <h3 className="font-serif text-2xl font-bold">
              Full-Stack Modern Web Engineering
            </h3>
            <p className="text-sm opacity-80 max-w-3xl leading-relaxed">
              Engineered with full TypeScript type safety, automated unit testing, rate limiting, and database transactional integrity:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div className="space-y-2 border-t sm:border-t-0 sm:border-l border-[var(--line)] pt-4 sm:pt-0 sm:pl-4">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <Layers size={16} className="text-[var(--accent)]" />
                Frontend Client
              </div>
              <p className="text-xs opacity-75 leading-relaxed">
                React 19, TypeScript 5.8, Vite 6, Tailwind CSS v4, Lucide React, and Motion for buttery-smooth zero-lag UI transitions.
              </p>
            </div>

            <div className="space-y-2 border-t sm:border-t-0 sm:border-l border-[var(--line)] pt-4 sm:pt-0 sm:pl-4">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <Database size={16} className="text-[var(--accent)]" />
                Backend Engine
              </div>
              <p className="text-xs opacity-75 leading-relaxed">
                Node.js & Express REST API, Prisma ORM 6.4, SQLite database with transactional submission, rate limiters, and JWT auth.
              </p>
            </div>

            <div className="space-y-2 border-t sm:border-t-0 sm:border-l border-[var(--line)] pt-4 sm:pt-0 sm:pl-4">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <CheckCircle2 size={16} className="text-[var(--accent)]" />
                Verified & Tested
              </div>
              <p className="text-xs opacity-75 leading-relaxed">
                15 automated unit test suites passing natively, debounced responses with <code className="font-mono text-[10px]">keepalive</code> beacon, and zero compiler errors.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Card */}
        <div className="rounded-2xl border border-[var(--accent)]/30 bg-gradient-to-br from-[var(--surface)] via-[var(--surface-sunken)] to-[var(--surface)] p-8 text-center space-y-4 shadow-sm">
          <h3 className="font-serif text-2xl font-bold">
            Experience the Precision in Your Preparation
          </h3>
          <p className="text-sm opacity-80 max-w-xl mx-auto">
            Take a timed mock test now to evaluate your current score, accuracy, and subject-wise readiness under official exam conditions.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              href="/mock-tests"
              className="rounded-xl bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 active:scale-98 transition-all shadow-sm"
            >
              Explore Mock Tests
            </Link>
            <Link
              href="/daily-challenge"
              className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-6 py-2.5 text-sm font-semibold text-[var(--ink)] hover:border-[var(--accent)] transition-all"
            >
              Daily Sprint Challenge
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
