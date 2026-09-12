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
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      {/* Hero Header */}
      <section className="border-b border-[var(--line)] bg-[var(--surface)] py-14 sm:py-18">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded border border-[var(--line)] bg-[var(--paper)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
            About ABHI MOCK TEST
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-semibold tracking-tight">
            Practice. Analyze. Improve.
          </h1>
          <p className="text-base sm:text-lg text-[var(--ink)] opacity-80 max-w-2xl mx-auto leading-relaxed">
            A high-fidelity examination simulation platform engineered for Indian competitive examination aspirants targeting SBI PO, SSC CGL, IBPS PO, and RBI Grade B.
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
              Every year, over 30 million candidates across India prepare for banking, staff selection, and government competitive examinations. In high-stakes examinations where cutoff differentials are often mere quarter-marks, casual practice fails to prepare candidates for actual test day pressure.
            </p>
            <p className="text-sm opacity-80 leading-relaxed">
              <strong>ABHI MOCK TEST</strong> was founded on a simple engineering premise: mock tests should replicate the exact cognitive, temporal, and psychological conditions of the official examination center.
            </p>
          </div>

          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-5 space-y-2">
              <div className="h-8 w-8 rounded bg-[var(--paper)] flex items-center justify-center text-[var(--accent)]">
                <Target size={18} />
              </div>
              <h3 className="font-bold text-sm">Exam Accuracy</h3>
              <p className="text-xs opacity-75 leading-relaxed">
                Standardized syllabi for SBI, IBPS, SSC, and Railway recruitment with accurate sectional timings and question patterns.
              </p>
            </div>

            <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-5 space-y-2">
              <div className="h-8 w-8 rounded bg-[var(--paper)] flex items-center justify-center text-[var(--accent)]">
                <ShieldCheck size={18} />
              </div>
              <h3 className="font-bold text-sm">Server-Authoritative Clock</h3>
              <p className="text-xs opacity-75 leading-relaxed">
                Prevents client clock manipulation and tab pausing. Timers sync with database timestamps for tamper-proof simulations.
              </p>
            </div>

            <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-5 space-y-2">
              <div className="h-8 w-8 rounded bg-[var(--paper)] flex items-center justify-center text-[var(--accent)]">
                <BarChart3 size={18} />
              </div>
              <h3 className="font-bold text-sm">True Data Diagnostics</h3>
              <p className="text-xs opacity-75 leading-relaxed">
                Sub-topic accuracy tracking, speed-per-question analysis, and percentile metrics computed from real candidate submissions.
              </p>
            </div>

            <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-5 space-y-2">
              <div className="h-8 w-8 rounded bg-[var(--paper)] flex items-center justify-center text-[var(--accent)]">
                <Award size={18} />
              </div>
              <h3 className="font-bold text-sm">Zero Fluff or Ads</h3>
              <p className="text-xs opacity-75 leading-relaxed">
                Academic-first UI built with calm, readable typography, high-contrast palette states, and zero distracting advertisements.
              </p>
            </div>
          </div>
        </div>

        {/* Technical Architecture Overview */}
        <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
              <Cpu size={15} />
              Technical Architecture & Standards
            </div>
            <h3 className="font-serif text-2xl font-bold">
              Engineering for Robustness & Scale
            </h3>
            <p className="text-sm opacity-80 max-w-3xl leading-relaxed">
              Developed as an enterprise-grade BCA final-year computer science project, the application adheres to modern full-stack development best practices:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div className="space-y-2 border-t sm:border-t-0 sm:border-l border-[var(--line)] pt-4 sm:pt-0 sm:pl-4">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <Layers size={16} className="text-[var(--accent)]" />
                Frontend Engine
              </div>
              <p className="text-xs opacity-75 leading-relaxed">
                React 18 with Vite, Tailwind CSS, Lucide icons, and Framer Motion for clean page transitions. Full responsive support across mobile and desktop.
              </p>
            </div>

            <div className="space-y-2 border-t sm:border-t-0 sm:border-l border-[var(--line)] pt-4 sm:pt-0 sm:pl-4">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <Database size={16} className="text-[var(--accent)]" />
                Backend & Database
              </div>
              <p className="text-xs opacity-75 leading-relaxed">
                Node.js and Express RESTful API with Prisma ORM, transactional submission logic, JWT authentication, and bcrypt password hashing.
              </p>
            </div>

            <div className="space-y-2 border-t sm:border-t-0 sm:border-l border-[var(--line)] pt-4 sm:pt-0 sm:pl-4">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <CheckCircle2 size={16} className="text-[var(--accent)]" />
                Reliability & Cloud
              </div>
              <p className="text-xs opacity-75 leading-relaxed">
                Edge-ready SPA routing compatible with Cloudflare Pages, idempotent test submission endpoints, and local draft recovery against crashes.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Card */}
        <div className="rounded border border-[var(--line)] bg-[var(--paper)] p-8 text-center space-y-4">
          <h3 className="font-serif text-2xl font-bold">
            Experience the Difference in Your Preparation
          </h3>
          <p className="text-sm opacity-80 max-w-xl mx-auto">
            Take a timed mock test now to evaluate your current score, accuracy, and subject-wise readiness.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              href="/mock-tests"
              className="rounded bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
            >
              Explore Mock Tests
            </Link>
            <Link
              href="/contact"
              className="rounded border border-[var(--line)] bg-[var(--surface)] px-6 py-2.5 text-sm font-semibold text-[var(--ink)] hover:border-[var(--accent)] transition-colors"
            >
              Contact Developer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
