import React from 'react';
import { useRouter, Link } from '../contexts/RouterContext';
import { Wordmark } from './Wordmark';

export const Footer: React.FC = () => {
  const { path } = useRouter();

  // Hide footer inside active live test engine
  if (path.startsWith('/test/') && !path.endsWith('/instructions')) {
    return null;
  }

  return (
    <footer id="main-footer" className="w-full border-t border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] transition-colors mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-3">
            <Wordmark size="lg" />
            <p className="text-xs text-[var(--ink)] opacity-70 leading-relaxed font-sans max-w-xs">
              Practice. Analyze. Improve. An exact, distraction-free mock test simulation environment engineered specifically for serious aspirants of Indian competitive examinations.
            </p>
          </div>

          {/* Column 1: Exams */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)] mb-3">
              Target Examinations
            </h4>
            <ul className="space-y-2 text-sm text-[var(--ink)] opacity-80">
              <li><Link href="/exams/sbi-po" className="hover:text-[var(--accent)] transition-colors">SBI PO (Probationary Officer)</Link></li>
              <li><Link href="/exams/ibps-po" className="hover:text-[var(--accent)] transition-colors">IBPS PO Prelims & Mains</Link></li>
              <li><Link href="/exams/ssc-cgl" className="hover:text-[var(--accent)] transition-colors">SSC CGL Tier 1 & 2</Link></li>
              <li><Link href="/exams/rbi-grade-b" className="hover:text-[var(--accent)] transition-colors">RBI Grade B Officers</Link></li>
              <li><Link href="/exams/sbi-clerk" className="hover:text-[var(--accent)] transition-colors">SBI Clerk (Junior Associate)</Link></li>
              <li><Link href="/exams/rrb-po" className="hover:text-[var(--accent)] transition-colors">RRB Officer Scale-I</Link></li>
            </ul>
          </div>

          {/* Column 2: Platform Modules */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)] mb-3">
              Preparation Modules
            </h4>
            <ul className="space-y-2 text-sm text-[var(--ink)] opacity-80">
              <li><Link href="/mock-tests?tab=Full+Tests" className="hover:text-[var(--accent)] transition-colors">Full-Length Mock Series</Link></li>
              <li><Link href="/mock-tests?tab=Sectional" className="hover:text-[var(--accent)] transition-colors">Sectional Speed Drills</Link></li>
              <li><Link href="/practice" className="hover:text-[var(--accent)] transition-colors">Topic-Wise Practice Sets</Link></li>
              <li><Link href="/leaderboard" className="hover:text-[var(--accent)] transition-colors">Cohort Leaderboard</Link></li>
              <li><Link href="/dashboard" className="hover:text-[var(--accent)] transition-colors">Weak-Area Diagnostic Engine</Link></li>
            </ul>
          </div>

          {/* Column 3: Platform & Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)] mb-3">
              Platform & Institutional
            </h4>
            <ul className="space-y-2 text-sm text-[var(--ink)] opacity-80">
              <li><Link href="/about" className="hover:text-[var(--accent)] transition-colors">About the Platform</Link></li>
              <li><Link href="/faq" className="hover:text-[var(--accent)] transition-colors">Frequently Asked Questions</Link></li>
              <li><Link href="/contact" className="hover:text-[var(--accent)] transition-colors">Contact Support & Feedback</Link></li>
              <li><Link href="/privacy" className="hover:text-[var(--accent)] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[var(--accent)] transition-colors">Terms of Service</Link></li>
            </ul>
            <div className="pt-3 text-xs font-mono text-[var(--accent)]">
              BCA Capstone Project • Production Ready
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer and Copyright */}
        <div className="border-t border-[var(--line)] pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs opacity-60">
          <div className="flex flex-wrap items-center gap-4">
            <p>© {new Date().getFullYear()} ABHI MOCK TEST. All rights reserved.</p>
            <span>•</span>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/faq" className="hover:underline">FAQ</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
          </div>
          <p className="text-center md:text-right max-w-xl">
            Disclaimer: ABHI MOCK TEST is an independent examination preparation platform and is not affiliated with, endorsed by, or associated with the State Bank of India (SBI), IBPS, Staff Selection Commission (SSC), or Reserve Bank of India (RBI).
          </p>
        </div>
      </div>
    </footer>
  );
};
